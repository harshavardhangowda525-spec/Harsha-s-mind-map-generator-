"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, CalendarClock, Check, X } from "lucide-react";
import { programs, type Program } from "@/config/programs";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PlaceholderTag } from "@/components/ui/Placeholder";
import { SocialIcon } from "@/components/ui/SocialIcon";
import { useDialogKeys, useScrollLock } from "@/lib/hooks";
import { cn, pad2, selectProgramForVisit } from "@/lib/utils";
import { programEnquiry } from "@/lib/whatsapp";

/** Bento layout: column spans + heights per card position (desktop). */
const layout = [
  "lg:col-span-7 lg:h-[560px]",
  "lg:col-span-5 lg:h-[560px]",
  "lg:col-span-4 lg:h-[460px]",
  "lg:col-span-4 lg:h-[460px]",
  "lg:col-span-4 lg:h-[460px]",
  "lg:col-span-12 lg:h-[400px]",
];

export function Programs() {
  const [selected, setSelected] = useState<Program | null>(null);

  return (
    <section id="programs" aria-labelledby="programs-title" className="relative bg-coal py-24 sm:py-32 lg:py-40">
      <div className="grid-lines pointer-events-none absolute inset-0 opacity-40 [mask-image:linear-gradient(180deg,black,transparent_35%)]" aria-hidden="true" />
      <div className="container-x relative">
        <SectionHeading
          id="programs-title"
          index="02"
          eyebrow="Training programs"
          lines={["Find your", "strength."]}
          intro={
            <>
              Six coached programs, one standard. Choose the path that fits your goals — or combine them. Tap any program to see
              benefits, schedule and how to start.
            </>
          }
        />

        <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:mt-20 lg:grid-cols-12 lg:gap-5">
          {programs.map((p, i) => (
            <li key={p.slug} className={cn("sm:col-span-1", i === 5 && "sm:col-span-2", layout[i])} data-reveal style={{ ["--d" as string]: (i % 3) * 90 }}>
              <ProgramCard program={p} index={i} wide={i === 5} onOpen={() => setSelected(p)} />
            </li>
          ))}
        </ul>
      </div>

      <AnimatePresence>{selected && <ProgramDialog program={selected} onClose={() => setSelected(null)} />}</AnimatePresence>
    </section>
  );
}

function ProgramCard({ program: p, index, wide, onOpen }: { program: Program; index: number; wide?: boolean; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-haspopup="dialog"
      className="group relative flex h-[420px] w-full flex-col justify-end overflow-hidden bg-steel text-left sm:h-[460px] lg:h-full"
    >
      <Image
        src={p.image.src}
        alt={p.image.alt}
        fill
        sizes={wide ? "100vw" : "(min-width: 1024px) 40vw, (min-width: 640px) 50vw, 100vw"}
        className="object-cover transition-transform duration-[1.4s] ease-out-expo group-hover:scale-[1.07] group-focus-visible:scale-[1.07]"
      />
      <span
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,8,8,0.1)_0%,rgba(8,8,8,0.35)_35%,rgba(8,8,8,0.82)_62%,rgba(8,8,8,0.97)_100%)] transition-opacity duration-700"
      />
      <span
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,90,31,0)_30%,rgba(255,90,31,0.28)_100%)] opacity-0 mix-blend-multiply transition-opacity duration-700 group-hover:opacity-100"
      />

      <span className="absolute left-5 top-5 flex items-center gap-3 sm:left-7 sm:top-7" aria-hidden="true">
        <span className="display text-xl text-chrome/90">{pad2(index + 1)}</span>
        <span className="h-px w-8 bg-white/40" />
      </span>

      <span className="absolute right-5 top-5 flex h-12 w-12 items-center justify-center rounded-full border border-white/25 bg-black/20 text-chrome backdrop-blur-sm transition-all duration-500 ease-out-expo group-hover:rotate-45 group-hover:border-ember group-hover:bg-ember group-hover:text-ink sm:right-7 sm:top-7">
        <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
      </span>

      <span className={cn("relative block p-5 sm:p-7", wide && "lg:grid lg:grid-cols-[1fr_1fr] lg:items-end lg:gap-10")}>
        <span className="block transition-transform duration-700 ease-out-expo group-hover:-translate-y-2">
          <span className="mb-3 block text-[0.66rem] font-semibold uppercase tracking-[0.22em] text-ember">{p.kicker}</span>
          <span className="display block text-[2.4rem] leading-[0.95] text-chrome sm:text-5xl">{p.title}</span>
        </span>
        <span className="mt-3 block max-w-md text-sm leading-relaxed text-silver/85 transition-colors duration-500 group-hover:text-chrome">
          {p.summary}
          <span className="mt-4 flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-chrome">
            View program
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1" aria-hidden="true" />
          </span>
        </span>
      </span>
      <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-[0.18] bg-ember transition-transform duration-700 ease-out-expo group-hover:scale-x-100" />
    </button>
  );
}

function ProgramDialog({ program: p, onClose }: { program: Program; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => onClose(), [onClose]);
  useScrollLock(true);
  useDialogKeys(true, ref, close);

  return (
    <motion.div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-black/75 backdrop-blur-sm sm:items-center sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={close}
    >
      <motion.div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="program-dialog-title"
        className="surface-metal relative max-h-[92svh] w-full max-w-4xl overflow-y-auto overscroll-contain sm:max-h-[88vh]"
        initial={{ y: 60, opacity: 0, clipPath: "inset(10% 0 0 0)" }}
        animate={{ y: 0, opacity: 1, clipPath: "inset(0% 0 0 0)" }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-56 sm:h-72">
          <Image src={p.image.src} alt={p.image.alt} fill sizes="(min-width: 896px) 896px, 100vw" className="object-cover" />
          <div className="absolute inset-0 bg-[linear-gradient(0deg,#111_0%,rgba(17,17,17,0.2)_70%)]" aria-hidden="true" />
          <button
            type="button"
            onClick={close}
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-black/50 text-chrome backdrop-blur hover:border-ember hover:text-ember"
            aria-label="Close program details"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="absolute bottom-0 left-0 p-6 sm:p-8">
            <p className="mb-2 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-ember">{p.kicker}</p>
            <h3 id="program-dialog-title" className="display text-5xl text-chrome sm:text-6xl">{p.title}</h3>
          </div>
        </div>

        <div className="grid gap-10 p-6 sm:p-8 md:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="text-base leading-relaxed text-silver">{p.description}</p>
            <h4 className="mt-8 text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-chrome">What you get</h4>
            <ul className="mt-4 space-y-3">
              {p.benefits.map((b) => (
                <li key={b} className="flex gap-3 text-sm text-silver">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-ember" aria-hidden="true" />
                  {b}
                </li>
              ))}
            </ul>
            <p className="mt-6 border-l-2 border-ember pl-4 text-sm text-mute">
              <span className="font-semibold text-chrome">Ideal for: </span>
              {p.idealFor}
            </p>
          </div>

          <div className="flex flex-col">
            <div className="border border-white/10 bg-black/30 p-5">
              <div className="flex items-center justify-between gap-3">
                <h4 className="flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-chrome">
                  <CalendarClock className="h-4 w-4 text-ember" aria-hidden="true" /> Schedule
                </h4>
                {p.scheduleIsPlaceholder && <PlaceholderTag>Sample timing</PlaceholderTag>}
              </div>
              <dl className="mt-4 divide-y divide-white/10">
                {p.schedule.map((s) => (
                  <div key={s.day} className="flex justify-between gap-4 py-3 text-sm">
                    <dt className="text-mute">{s.day}</dt>
                    <dd className="text-right text-chrome">{s.time}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="mt-6 flex flex-col gap-3">
              <a
                href={programEnquiry(p.title)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center justify-center gap-2.5 bg-ember px-6 text-[0.75rem] font-bold uppercase tracking-[0.18em] text-[#0b0b0b] transition-colors hover:bg-[#ff6d38]"
              >
                <SocialIcon name="whatsapp" className="h-4 w-4" /> Enquire on WhatsApp
              </a>
              <button
                type="button"
                onClick={() => {
                  close();
                  window.setTimeout(() => selectProgramForVisit(p.title), 150);
                }}
                className="inline-flex min-h-12 items-center justify-center gap-2 border border-white/20 px-6 text-[0.75rem] font-semibold uppercase tracking-[0.18em] text-chrome transition-colors hover:border-ember"
              >
                Book a free visit <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
