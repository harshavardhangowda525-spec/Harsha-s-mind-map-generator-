import Image from "next/image";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { images } from "@/config/images";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Parallax } from "@/components/ui/Parallax";

const lines = ["Build strength.", "Break limits.", "Become unstoppable."];

export function Hero() {
  return (
    <section
      id="home"
      aria-labelledby="hero-title"
      className="relative isolate flex min-h-[640px] h-[100svh] flex-col justify-end overflow-hidden bg-ink"
    >
      {/* Background photograph */}
      <div className="absolute inset-0 -z-20 overflow-hidden" aria-hidden="true">
        <Parallax amount={14} start="top top">
          <div className="hero-zoom absolute inset-0">
            <Image
              src={images.hero.src}
              alt=""
              fill
              priority
              fetchPriority="high"
              sizes="100vw"
              className="object-cover object-[62%_center] opacity-80"
            />
          </div>
        </Parallax>
      </div>

      {/* Cinematic overlays */}
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,8,8,0.92)_0%,rgba(8,8,8,0.55)_45%,rgba(8,8,8,0.2)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,#080808_0%,rgba(8,8,8,0.35)_35%,rgba(8,8,8,0)_60%,rgba(8,8,8,0.7)_100%)]" />
        <div className="light-sweep absolute left-1/4 top-1/4 h-[70vh] w-[70vw] mix-blend-screen" />
        {/* Directional orange accents */}
        <svg className="absolute right-0 top-0 h-full w-[55%] opacity-90" viewBox="0 0 600 900" preserveAspectRatio="xMaxYMid slice" fill="none">
          <path d="M600 120 L250 900" stroke="url(#hg1)" strokeWidth="1.2" />
          <path d="M600 260 L330 900" stroke="url(#hg1)" strokeWidth="0.8" />
          <path d="M600 40 L470 340" stroke="#FF5A1F" strokeWidth="3" className="draw-loop" />
          <defs>
            <linearGradient id="hg1" x1="600" y1="0" x2="250" y2="900" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FF5A1F" stopOpacity="0.9" />
              <stop offset="1" stopColor="#FF5A1F" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute left-0 top-[22%] h-28 w-[3px] bg-ember" />
      </div>

      <div className="container-x relative pb-24 pt-32 sm:pb-28 lg:pb-20">
        <p className="eyebrow hero-fade mb-6 text-silver sm:mb-8" style={{ ["--i" as string]: 0 }}>
          Premium Gym &amp; Training Center
        </p>

        <h1 id="hero-title" className="display text-[clamp(3rem,8.4vw,8.75rem)] text-chrome">
          {lines.map((l, i) => (
            <span key={l} className="hero-line">
              <span style={{ ["--i" as string]: i }} className={i === 2 ? "text-ember" : i === 1 ? "text-metal" : ""}>
                {l}
              </span>
            </span>
          ))}
        </h1>

        <div className="mt-8 grid gap-8 lg:mt-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <p className="hero-fade max-w-md text-base leading-relaxed text-silver/90 sm:text-lg" style={{ ["--i" as string]: 1 }}>
            More than a gym. A place where discipline becomes strength and every session moves you forward.
          </p>
          <div className="hero-fade flex flex-col gap-3 xs:flex-row sm:gap-4" style={{ ["--i" as string]: 2 }}>
            <MagneticButton href="#membership">
              Explore memberships <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </MagneticButton>
            <MagneticButton href="#visit" variant="ghost">
              Book a free visit
            </MagneticButton>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <a
        href="#about"
        className="hero-fade absolute bottom-6 right-4 hidden flex-col items-center gap-3 text-[0.62rem] font-semibold uppercase tracking-[0.3em] text-mute hover:text-chrome sm:right-8 md:flex"
        style={{ ["--i" as string]: 4 }}
        aria-label="Scroll to About section"
      >
        <span className="[writing-mode:vertical-rl]">Scroll</span>
        <span className="relative h-14 w-px overflow-hidden bg-white/15">
          <span className="scroll-dot absolute inset-x-0 top-0 h-5 bg-ember" />
        </span>
        <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
      </a>

      {/* Discipline ticker */}
      <div className="absolute inset-x-0 bottom-0 overflow-hidden border-t border-white/10 bg-ink/40 py-2.5 backdrop-blur-sm" aria-hidden="true">
        <div className="marquee flex w-max gap-10 whitespace-nowrap text-[0.68rem] font-semibold uppercase tracking-[0.35em] text-mute [--dur:38s]">
          {Array.from({ length: 2 }).map((_, k) => (
            <span key={k} className="flex gap-10">
              {["Strength", "Discipline", "Conditioning", "Coaching", "Recovery", "Performance", "Community", "Consistency"].map((w) => (
                <span key={w} className="flex items-center gap-10">
                  {w}
                  <span className="h-1 w-1 rotate-45 bg-ember" />
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
