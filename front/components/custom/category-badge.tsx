"use client";

import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

type CategoryBadgeProps = {
  label: string;
  active?: boolean;
  onClick?: ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
  className?: string;
};

export default function CategoryBadge({
  label,
  active = false,
  onClick,
  className,
}: CategoryBadgeProps) {
  const baseClasses =
    "inline-flex items-center justify-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500";

  const styles = active
    ? "bg-primary-500 text-white border-primary-500 shadow-sm"
    : "bg-white text-primary-600 border-primary-200 hover:bg-primary-50";

  const combinedClasses = cn(baseClasses, styles, className);

  if (onClick) {
    return (
      <button
        type="button"
        className={combinedClasses}
        onClick={onClick}
        aria-pressed={active}
      >
        {label}
      </button>
    );
  }

  return <span className={combinedClasses}>{label}</span>;
}
