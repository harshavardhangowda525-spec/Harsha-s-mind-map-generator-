"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Pause, Play, Quote, Star } from "lucide-react";
import { testimonials } from "@/config/content";
import { PlaceholderTag } from "@/components/ui/Placeholder";
import { cn, pad2 } from "@/lib/utils";

const INTERVAL = 7000;

export function Testimonials() {
  const [[i, dir], setState] = useState<[number, number]>([0, 1]);
  const [hovered, setHovered] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const paused = hovered || userPaused || reduced;
  const n = testimonials.length;

  const go = useCallback((d: number) => setState(([cur]) => [(cur + d + n) % n, d]), [n]);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (paused) return;
    const t = window.setTimeout(() => go(1), INTERVAL);
    return () => window.clearTimeout(t);
  }, [i, paused, go]);

  const t = testimonials[i];

  return (
    <section id="testimonials" aria-labelledby="testimonials-title" className="relative overflow-hidden bg-coal py-24 sm:py-32 lg:py-40">
      <div aria-hidden="true" className="display pointer-events-none absolute -right-10 top-10 select-none text-[28rem] leading-none text-white/[0.025]">
        &rdquo;
      </div>
      <div className="container-x relative grid gap-12 lg:grid-cols-[1fr_1.6fr] lg:gap-20">
        <div>
          <p className="eyebrow mb-6" data-reveal><span className="text-ember">07</span> Member stories</p>
          <h2 id="testimonials-title" className="display text-[clamp(2.75rem,5vw,4.75rem)] text-chrome">
            <span className="block overflow-hidden pb-[0.04em]"><span className="block" data-reveal>Real people.</span></span>
            <span className="block overflow-hidden pb-[0.04em]"><span className="block text-metal" data-reveal style={{ ["--d" as string]: 120 }}>Real progress.</span></span>
          </h2>
          {testimonials.some((x) => x.isPlaceholder) && (
            <p className="mt-6 max-w-sm text-sm text-mute" data-reveal>
              <PlaceholderTag className="mb-3">Example testimonials</PlaceholderTag>
              <br />
              These are layout examples, not real reviews. Replace them with genuine member feedback before launch.
            </p>
          )}

          <div className="mt-10 flex items-center gap-2">
            <NavButton label="Previous testimonial" onClick={() => go(-1)}><ArrowLeft className="h-5 w-5" /></NavButton>
            <NavButton label="Next testimonial" onClick={() => go(1)}><ArrowRight className="h-5 w-5" /></NavButton>
            <NavButton label={userPaused ? "Resume autoplay" : "Pause autoplay"} onClick={() => setUserPaused((v) => !v)}>
              {userPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </NavButton>
            <span className="ml-4 text-xs tabular-nums text-mute">
              <span className="text-chrome">{pad2(i + 1)}</span> / {pad2(n)}
            </span>
          </div>
        </div>

        <div
          className="relative"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onFocusCapture={() => setHovered(true)}
          onBlurCapture={() => setHovered(false)}
          aria-roledescription="carousel"
          aria-label="Member testimonials"
        >
          <div className="surface-metal relative min-h-[380px] overflow-hidden p-7 sm:min-h-[340px] sm:p-12">
            <span className="absolute left-0 top-0 h-full w-[3px] bg-ember" aria-hidden="true" />
            <AnimatePresence mode="wait" initial={false} custom={dir}>
              <motion.figure
                key={i}
                custom={dir}
                initial={{ opacity: 0, x: dir * 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: dir * -40 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -50) go(1);
                  else if (info.offset.x > 50) go(-1);
                }}
                className="cursor-grab touch-pan-y active:cursor-grabbing"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${n}`}
              >
                <Quote className="h-9 w-9 text-ember" aria-hidden="true" />
                {t.rating ? (
                  <div className="mt-6 flex gap-1" aria-label={`Rated ${t.rating} out of 5`}>
                    {Array.from({ length: 5 }).map((_, k) => (
                      <Star key={k} className={cn("h-4 w-4", k < t.rating! ? "fill-ember text-ember" : "text-dim")} aria-hidden="true" />
                    ))}
                  </div>
                ) : null}
                <blockquote className="mt-6 text-xl leading-relaxed text-chrome sm:text-2xl lg:text-[1.7rem] lg:leading-snug">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-8 flex items-center gap-4">
                  {t.photo ? (
                    <Image src={t.photo.src} alt={t.photo.alt} width={52} height={52} className="h-13 w-13 rounded-full object-cover" />
                  ) : (
                    <span className="display flex h-13 w-13 items-center justify-center rounded-full border border-white/15 text-xl text-mute" aria-hidden="true">
                      {t.name.split(" ").map((s) => s[0]).join("").slice(0, 2)}
                    </span>
                  )}
                  <span>
                    <span className="flex flex-wrap items-center gap-2 font-semibold text-chrome">
                      {t.name}
                      {t.isPlaceholder && <PlaceholderTag>Example</PlaceholderTag>}
                    </span>
                    <span className="mt-1 block text-xs uppercase tracking-[0.14em] text-mute">{t.detail}</span>
                  </span>
                </figcaption>
              </motion.figure>
            </AnimatePresence>
          </div>

          {/* progress segments */}
          <div className="mt-5 flex gap-2" aria-hidden="true">
            {testimonials.map((_, k) => (
              <span key={k} className="relative h-[2px] flex-1 overflow-hidden bg-white/10">
                {k < i && <span className="absolute inset-0 bg-ember/60" />}
                {k === i && (
                  <span
                    key={`${i}-${paused}`}
                    className="absolute inset-0 origin-left bg-ember"
                    style={paused ? undefined : { animation: `progress ${INTERVAL}ms linear forwards` }}
                  />
                )}
              </span>
            ))}
          </div>
          <style>{`@keyframes progress{from{transform:scaleX(0)}to{transform:scaleX(1)}}`}</style>
        </div>
      </div>
    </section>
  );
}

function NavButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-12 w-12 items-center justify-center border border-white/20 text-chrome transition-colors hover:border-ember hover:text-ember"
    >
      {children}
    </button>
  );
}
