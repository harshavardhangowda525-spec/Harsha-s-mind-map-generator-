"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useScroll, useSpring } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { trackedSections } from "@/config/site";
import { SocialIcon } from "@/components/ui/SocialIcon";
import { useActiveSection } from "@/lib/hooks";
import { pad2 } from "@/lib/utils";
import { generalEnquiry } from "@/lib/whatsapp";

const ids = trackedSections.map((s) => s.id);

/** Thin orange reading-progress bar along the top edge. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });
  return (
    <motion.div
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-[70] h-[2px] origin-left bg-ember"
      style={{ scaleX }}
    />
  );
}

/** Floating "03 / 11 — PROGRAMS" counter on large screens. */
export function SectionCounter() {
  const active = useActiveSection(ids);
  const idx = Math.max(0, ids.indexOf(active as (typeof ids)[number]));
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed left-6 top-1/2 z-30 hidden -translate-y-1/2 xl:block"
    >
      <div className="flex flex-col items-center gap-4">
        <span className="overflow-hidden text-[0.7rem] font-semibold tabular-nums text-chrome">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={idx}
              className="block"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-100%" }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              {pad2(idx + 1)}
            </motion.span>
          </AnimatePresence>
        </span>
        <span className="relative h-24 w-px bg-white/15">
          <span
            className="absolute inset-x-0 top-0 bg-ember transition-[height] duration-700 ease-out-expo"
            style={{ height: `${((idx + 1) / ids.length) * 100}%` }}
          />
        </span>
        <span className="text-[0.7rem] tabular-nums text-dim">{pad2(ids.length)}</span>
        <span className="mt-2 text-[0.62rem] font-semibold uppercase tracking-[0.3em] text-mute [writing-mode:vertical-rl] rotate-180">
          {trackedSections[idx].label}
        </span>
      </div>
    </div>
  );
}

/**
 * Desktop: floating WhatsApp button.
 * Mobile: sticky bottom bar with "View plans" + WhatsApp, shown after the
 * hero and hidden while the membership / visit / contact sections are on screen.
 */
export function FloatingCTAs() {
  const [pastHero, setPastHero] = useState(false);
  const [suppressed, setSuppressed] = useState(false);

  useEffect(() => {
    const onScroll = () => setPastHero(window.scrollY > window.innerHeight * 0.85);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const watched = ["membership", "visit", "contact"]
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];
    const visible = new Set<string>();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => (e.isIntersecting ? visible.add(e.target.id) : visible.delete(e.target.id)));
        setSuppressed(visible.size > 0);
      },
      { rootMargin: "0px 0px -20% 0px" },
    );
    watched.forEach((el) => io.observe(el));
    return () => {
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
    };
  }, []);

  const showBar = pastHero && !suppressed;

  return (
    <>
      <a
        href={generalEnquiry()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        className={`group fixed bottom-6 right-6 z-40 hidden h-14 items-center gap-0 overflow-hidden rounded-full border border-white/10 bg-[#111]/90 pl-4 pr-4 text-chrome shadow-2xl backdrop-blur-md transition-all duration-500 hover:border-ember hover:pr-5 md:inline-flex ${pastHero ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"}`}
      >
        <span className="relative flex h-6 w-6 items-center justify-center text-ember">
          <span className="absolute inset-0 animate-ping rounded-full bg-ember/30 [animation-duration:2.4s]" aria-hidden="true" />
          <SocialIcon name="whatsapp" className="relative h-6 w-6" />
        </span>
        <span className="max-w-0 overflow-hidden whitespace-nowrap text-xs font-semibold uppercase tracking-[0.18em] transition-[max-width,margin] duration-500 group-hover:ml-3 group-hover:max-w-40 group-focus-visible:ml-3 group-focus-visible:max-w-40">
          Enquire now
        </span>
      </a>

      <div
        className={`fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#0a0a0a]/90 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl transition-transform duration-500 ease-out-expo md:hidden ${showBar ? "translate-y-0" : "translate-y-full"}`}
        aria-hidden={!showBar}
        inert={!showBar}
      >
        <div className="flex gap-2">
          <a
            href="#membership"
            className="flex min-h-12 flex-1 items-center justify-center gap-2 bg-ember text-[0.75rem] font-bold uppercase tracking-[0.18em] text-[#0b0b0b]"
          >
            View memberships <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </a>
          <a
            href={generalEnquiry()}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat with us on WhatsApp"
            className="flex min-h-12 w-14 items-center justify-center border border-white/15 text-ember"
          >
            <SocialIcon name="whatsapp" className="h-6 w-6" />
          </a>
        </div>
      </div>
    </>
  );
}
