"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface LogoutButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export default function LogoutButton({ className, children }: LogoutButtonProps) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    // Refresh the router cache so server components re-read the cleared session
    router.refresh();
    router.push("/");
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className={
        className ??
        "px-4 py-2 text-sm font-semibold text-white bg-stone-900 hover:bg-orange-600 rounded-xl transition-all duration-200 shadow-sm"
      }
    >
      {children ?? "Sign out"}
    </button>
  );
}
