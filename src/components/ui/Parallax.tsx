"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { onIdle } from "@/lib/hooks";
import { cn } from "@/lib/utils";

/**
 * Moves its child vertically while the parent scrolls through the viewport.
 * `amount` is the travel in percent of the element height (e.g. 12 → ±6%).
 * Disabled for reduced-motion users.
 */
export function Parallax({
  children,
  amount = 12,
  className,
  start = "top bottom",
}: {
  children: React.ReactNode;
  amount?: number;
  className?: string;
  start?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    const cancel = onIdle(() => mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(
        el,
        { yPercent: -amount / 2 },
        {
          yPercent: amount / 2,
          ease: "none",
          scrollTrigger: { trigger: el.parentElement, start, end: "bottom top", scrub: true },
        },
      );
    }));
    return () => {
      cancel();
      mm.revert();
    };
  }, [amount, start]);

  return (
    <div ref={ref} className={cn("absolute -inset-y-[8%] inset-x-0 will-change-transform", className)}>
      {children}
    </div>
  );
}

export { ScrollTrigger };
