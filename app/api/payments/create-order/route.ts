import { NextResponse } from "next/server";
import Razorpay from "razorpay";

import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const bookingId = body?.bookingId;

    if (!bookingId || typeof bookingId !== "string") {
      return NextResponse.json(
        { error: "Booking ID is required." },
        { status: 400 }
      );
    }

    const { data: booking, error: bookingError } =
      await supabase
        .from("bookings")
        .select(
          `
            id,
            traveller_id,
            total_amount_inr,
            status,
            payment_status,
            razorpay_order_id
          `
        )
        .eq("id", bookingId)
        .eq("traveller_id", user.id)
        .maybeSingle();

    if (bookingError) {
      return NextResponse.json(
        { error: bookingError.message },
        { status: 500 }
      );
    }

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found." },
        { status: 404 }
      );
    }

    if (booking.status !== "CONFIRMED") {
      return NextResponse.json(
        {
          error:
            "This booking must be confirmed by the local partner before payment.",
        },
        { status: 400 }
      );
    }

    if (booking.payment_status === "PAID") {
      return NextResponse.json(
        { error: "This booking has already been paid." },
        { status: 400 }
      );
    }

    if (!booking.total_amount_inr || booking.total_amount_inr <= 0) {
      return NextResponse.json(
        { error: "Invalid booking amount." },
        { status: 400 }
      );
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json(
        {
          error:
            "Razorpay is not configured. Add the Razorpay test keys to .env.local.",
        },
        { status: 500 }
      );
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    if (booking.razorpay_order_id) {
      return NextResponse.json({
        orderId: booking.razorpay_order_id,
        amount: booking.total_amount_inr * 100,
        currency: "INR",
        keyId,
      });
    }

    const order = await razorpay.orders.create({
      amount: booking.total_amount_inr * 100,
      currency: "INR",
      receipt: booking.id.slice(0, 40),
      notes: {
        booking_id: booking.id,
        traveller_id: user.id,
      },
    });

    const { error: updateError } = await supabase
      .from("bookings")
      .update({
        razorpay_order_id: order.id,
        payment_status: "PENDING",
      })
      .eq("id", booking.id)
      .eq("traveller_id", user.id);

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
    });
  } catch (error) {
    console.error("Razorpay create order error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create payment order.",
      },
      { status: 500 }
    );
  }
}