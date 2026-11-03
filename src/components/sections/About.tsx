import Image from "next/image";
import { Dumbbell, HeartPulse, ShieldCheck } from "lucide-react";
import { images } from "@/config/images";
import { site } from "@/config/site";
import { Counter } from "@/components/ui/Counter";
import { Parallax } from "@/components/ui/Parallax";
import { PlaceholderTag } from "@/components/ui/Placeholder";

const highlights = [
  {
    icon: Dumbbell,
    title: "Serious equipment",
    text: "Racks, platforms, free weights and conditioning tools laid out for real training — not crowded corners.",
  },
  {
    icon: ShieldCheck,
    title: "Coached, not left alone",
    text: "Coaches on the floor to guide technique, adjust programming and keep every session safe.",
  },
  {
    icon: HeartPulse,
    title: "Built for every level",
    text: "First-timers, lifters and busy professionals train side by side with plans that fit them.",
  },
];

export function About() {
  const { stats } = site;
  return (
    <section id="about" aria-labelledby="about-title" className="relative overflow-hidden bg-ink py-24 sm:py-32 lg:py-40">
      <div className="container-x grid gap-14 lg:grid-cols-[1fr_1.05fr] lg:gap-20">
        {/* Image column */}
        <div className="relative">
          <div className="relative aspect-[4/5] overflow-hidden lg:sticky lg:top-28" data-reveal="mask">
            <Parallax amount={14}>
              <Image
                src={images.about.src}
                alt={images.about.alt}
                fill
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover"
              />
            </Parallax>
            <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(8,8,8,0.75),transparent_45%)]" aria-hidden="true" />
            <div className="absolute bottom-0 left-0 flex items-end gap-4 p-5 sm:p-7">
              <span className="display text-6xl leading-none text-ember sm:text-7xl">01</span>
              <span className="pb-1 text-[0.7rem] font-semibold uppercase leading-relaxed tracking-[0.25em] text-silver">
                The training
                <br />
                floor
              </span>
            </div>
            <span className="absolute right-0 top-0 h-16 w-16 border-r-[3px] border-t-[3px] border-ember" aria-hidden="true" />
          </div>
          <span className="absolute -left-4 top-10 hidden h-40 w-px bg-gradient-to-b from-ember to-transparent sm:block" aria-hidden="true" />
        </div>

        {/* Copy column */}
        <div className="flex flex-col justify-center">
          <p className="eyebrow mb-6" data-reveal>
            <span className="text-ember">01</span> About the gym
          </p>
          <h2 id="about-title" className="display text-[clamp(2.75rem,5.4vw,5.5rem)] text-chrome">
            <span className="block overflow-hidden pb-[0.04em]"><span className="block" data-reveal>Not just a gym.</span></span>
            <span className="block overflow-hidden pb-[0.04em]"><span className="block text-metal" data-reveal style={{ ["--d" as string]: 120 }}>A standard.</span></span>
          </h2>

          <div className="mt-8 space-y-5 text-base leading-relaxed text-mute sm:text-lg" data-reveal style={{ ["--d" as string]: 150 }}>
            <p>
              <span className="text-chrome">Planet Muscle was built on one belief:</span> results come from showing up, training with intent and
              being held to a higher standard. Every detail of the space is designed to help you do exactly that.
            </p>
            <p>
              From your first visit to your hundredth session, you&apos;ll train in a focused environment with the right equipment,
              structured programs and coaches who care how you move — not just how much you lift.
            </p>
          </div>

          <ul className="mt-10 divide-y divide-white/10 border-y border-white/10">
            {highlights.map(({ icon: Icon, title, text }, i) => (
              <li key={title} className="group flex gap-5 py-5" data-reveal style={{ ["--d" as string]: 100 * i }}>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center border border-white/15 text-ember transition-colors group-hover:border-ember">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-chrome">{title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-mute">{text}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-12">
            {stats.isPlaceholder && (
              <PlaceholderTag className="mb-5">Placeholder figures — to be verified by the gym</PlaceholderTag>
            )}
            <dl className="grid grid-cols-2 gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-4">
              {stats.items.map((s, i) => (
                <div key={s.label} className="surface-metal flex flex-col-reverse gap-2 border-0 p-5" data-reveal style={{ ["--d" as string]: 80 * i }}>
                  <dt className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-mute">{s.label}</dt>
                  <dd className="display text-5xl text-chrome">
                    <Counter value={s.value} suffix={s.suffix} />
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
