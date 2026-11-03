"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "ghost" | "dark";

const styles: Record<Variant, string> = {
  primary:
    "bg-ember text-[#0b0b0b] hover:bg-[#ff6d38] shadow-[0_10px_40px_-12px_rgba(255,90,31,0.7)]",
  ghost: "text-chrome border border-white/25 hover:border-ember bg-white/[0.02] backdrop-blur-sm",
  dark: "bg-chrome text-ink hover:bg-white",
};

type Props = {
  href?: string;
  onClick?: () => void;
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
  external?: boolean;
  type?: "button" | "submit";
  disabled?: boolean;
  ariaLabel?: string;
};

/**
 * CTA with a subtle magnetic pull (fine pointers only) and an animated
 * outline sweep. Renders <a> when `href` is given, otherwise <button>.
 */
export function MagneticButton({
  href,
  onClick,
  variant = "primary",
  className,
  children,
  external,
  type = "button",
  disabled,
  ariaLabel,
}: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const inner = useRef<HTMLSpanElement>(null);

  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || !ref.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width / 2) / r.width;
    const y = (e.clientY - r.top - r.height / 2) / r.height;
    ref.current.style.transform = `translate3d(${x * 10}px, ${y * 8}px, 0)`;
    if (inner.current) inner.current.style.transform = `translate3d(${x * 5}px, ${y * 4}px, 0)`;
  };
  const onLeave = () => {
    if (ref.current) ref.current.style.transform = "";
    if (inner.current) inner.current.style.transform = "";
  };

  const cls = cn(
    "group relative inline-flex min-h-12 items-center justify-center gap-3 overflow-hidden rounded-[2px] px-7 py-3.5",
    "text-[0.8rem] font-semibold uppercase tracking-[0.18em] transition-[transform,background-color,border-color,color] duration-500 ease-out-expo will-change-transform",
    "disabled:pointer-events-none disabled:opacity-60",
    styles[variant],
    className,
  );

  const content = (
    <>
      {/* animated outline sweep */}
      <span aria-hidden="true" className="pointer-events-none absolute inset-0">
        <span className="absolute left-0 top-0 h-px w-full origin-left scale-x-0 bg-current opacity-60 transition-transform duration-500 ease-out-expo group-hover:scale-x-100" />
        <span className="absolute bottom-0 right-0 h-px w-full origin-right scale-x-0 bg-current opacity-60 transition-transform duration-500 ease-out-expo group-hover:scale-x-100" />
      </span>
      <span ref={inner} className="relative inline-flex items-center gap-3 transition-transform duration-300 ease-out">
        {children}
      </span>
    </>
  );

  if (href) {
    return (
      <a
        ref={(el) => {
          ref.current = el;
        }}
        href={href}
        onClick={onClick}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        className={cls}
        aria-label={ariaLabel}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {content}
      </a>
    );
  }
  return (
    <button
      ref={(el) => {
        ref.current = el;
      }}
      type={type}
      onClick={onClick}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={cls}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {content}
    </button>
  );
}
