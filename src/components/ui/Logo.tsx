import { site } from "@/config/site";
import { cn } from "@/lib/utils";

/** IRON PULSE wordmark with a pulse-line monogram. */
export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg viewBox="0 0 40 40" className="h-8 w-8 shrink-0" aria-hidden="true">
        <rect x="1" y="1" width="38" height="38" rx="2" fill="none" stroke="rgb(255 255 255 / 0.35)" />
        <path
          d="M5 22h8l3-9 5 16 4-12 2 5h8"
          fill="none"
          stroke="#FF5A1F"
          strokeWidth="2.4"
          strokeLinecap="square"
          strokeLinejoin="miter"
        />
      </svg>
      {!compact && (
        <span className="display text-[1.35rem] leading-none tracking-[0.06em] text-metal">
          {site.name}
        </span>
      )}
      <span className="sr-only">{site.name}</span>
    </span>
  );
}
