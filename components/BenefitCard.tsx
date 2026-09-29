import React from "react";

interface BenefitCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  statBadge?: string;
}

export default function BenefitCard({
  icon,
  title,
  description,
  statBadge,
}: BenefitCardProps) {
  return (
    <div className="p-8 rounded-3xl bg-white border border-stone-200/90 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between space-y-5">
      <div>
        <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 border border-orange-200/50 flex items-center justify-center mb-6 shadow-xs">
          {icon}
        </div>

        <h3 className="text-xl font-bold font-serif text-stone-900 tracking-tight">
          {title}
        </h3>

        <p className="mt-2.5 text-sm text-stone-600 leading-relaxed">
          {description}
        </p>
      </div>

      {statBadge && (
        <div className="pt-4 border-t border-stone-100">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-800 bg-stone-50 px-3 py-1 rounded-full border border-stone-200/70">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            {statBadge}
          </span>
        </div>
      )}
    </div>
  );
}
