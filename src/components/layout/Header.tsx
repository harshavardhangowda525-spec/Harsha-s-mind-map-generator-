"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { navLinks, site } from "@/config/site";
import { Logo } from "@/components/ui/Logo";
import { SocialIcon } from "@/components/ui/SocialIcon";
import { useActiveSection, useDialogKeys, useScrollLock } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { generalEnquiry } from "@/lib/whatsapp";

const ids = navLinks.map((l) => l.id);

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const active = useActiveSection(ids);
  const menuRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => mq.matches && setOpen(false);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useScrollLock(open);
  useDialogKeys(open, menuRef, close);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500",
          scrolled || open
            ? "border-b border-white/10 bg-[#0a0a0a]/75 backdrop-blur-xl"
            : "border-b border-transparent bg-transparent",
        )}
      >
        <nav
          aria-label="Primary"
          className={cn(
            "container-x flex items-center justify-between transition-[height] duration-500 ease-out-expo",
            scrolled ? "h-16" : "h-20 lg:h-24",
          )}
        >
          <a href="#home" className="relative z-10" aria-label={`${site.name} — back to top`} onClick={close}>
            <Logo />
          </a>

          <ul className="hidden items-center gap-1 lg:flex">
            {navLinks.map((l) => (
              <li key={l.id}>
                <a
                  href={`#${l.id}`}
                  aria-current={active === l.id ? "true" : undefined}
                  className={cn(
                    "group relative px-3 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.2em] transition-colors",
                    active === l.id ? "text-chrome" : "text-mute hover:text-chrome",
                  )}
                >
                  {l.label}
                  <span
                    className={cn(
                      "absolute inset-x-3 -bottom-0.5 h-px origin-left bg-ember transition-transform duration-500 ease-out-expo",
                      active === l.id ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
                    )}
                  />
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            <a
              href="#membership"
              className="hidden min-h-11 items-center gap-2 rounded-[2px] bg-ember px-5 text-[0.72rem] font-bold uppercase tracking-[0.2em] text-[#0b0b0b] transition-colors hover:bg-[#ff6d38] sm:inline-flex"
            >
              Join now <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <button
              type="button"
              className="relative z-10 inline-flex h-11 w-11 items-center justify-center rounded-[2px] border border-white/15 text-chrome lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={menuRef}
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            className="fixed inset-0 z-40 flex flex-col overflow-y-auto bg-ink pt-24 lg:hidden"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          >
            <div className="grid-lines pointer-events-none absolute inset-0 opacity-50" aria-hidden="true" />
            <div className="container-x relative flex flex-1 flex-col">
              <ul className="flex flex-col border-t border-white/10">
                {[...navLinks, { id: "visit", label: "Free Visit" }].map((l, i) => (
                  <li key={l.id} className="overflow-hidden border-b border-white/10">
                    <motion.a
                      href={`#${l.id}`}
                      onClick={close}
                      className="flex items-baseline justify-between py-3.5"
                      initial={{ y: "100%" }}
                      animate={{ y: 0 }}
                      transition={{ delay: 0.25 + i * 0.05, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <span
                        className={cn(
                          "display text-[2.4rem] xs:text-5xl",
                          active === l.id ? "text-ember" : "text-chrome",
                        )}
                      >
                        {l.label}
                      </span>
                      <span className="text-xs tabular-nums text-dim">0{i + 1}</span>
                    </motion.a>
                  </li>
                ))}
              </ul>
              <motion.div
                className="mt-auto flex flex-col gap-5 py-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                <a
                  href="#membership"
                  onClick={close}
                  className="inline-flex min-h-13 items-center justify-center gap-2 bg-ember px-6 py-4 text-sm font-bold uppercase tracking-[0.2em] text-[#0b0b0b]"
                >
                  Join now <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </a>
                <div className="flex items-center justify-between text-sm text-mute">
                  <a href={generalEnquiry()} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 py-2">
                    <SocialIcon name="whatsapp" /> WhatsApp us
                  </a>
                  <div className="flex gap-1">
                    {site.socials.map((s) => (
                      <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="p-2.5 hover:text-ember">
                        <SocialIcon name={s.icon} className="h-5 w-5" />
                      </a>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
