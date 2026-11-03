"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { images } from "@/config/images";
import { gsap } from "@/lib/gsap";
import { onIdle } from "@/lib/hooks";

const headline = [
  ["THE", "WORK", "IS", "YOURS."],
  ["THE", "STANDARD", "IS", "OURS."],
];

const pillars = [
  { n: "01", t: "Discipline", d: "Show up on the hard days. Consistency is the one thing nobody can do for you." },
  { n: "02", t: "Strength", d: "Progress you can measure — built rep by rep with structure and intent." },
  { n: "03", t: "Performance", d: "Train for a body that works: in the gym, at work and in everything else." },
];

/**
 * Cinematic 2D motion-graphics section: scroll-scrubbed kinetic type,
 * word-by-word headline fill, self-drawing SVG geometry and a masked
 * photograph that expands to full bleed. GSAP + ScrollTrigger only.
 */
export function Standard() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const ctx = gsap.context(() => {}, el);
    const cancel = onIdle(() => ctx.add(() => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Kinetic marquee rows move against each other while scrolling.
        gsap.fromTo("[data-k='row-a']", { xPercent: 0 }, { xPercent: -28, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 0.6 } });
        gsap.fromTo("[data-k='row-b']", { xPercent: -28 }, { xPercent: 0, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 0.6 } });

        // Word-by-word light-up of the headline.
        gsap.fromTo(
          "[data-k='word']",
          { opacity: 0.12, yPercent: 30 },
          {
            opacity: 1,
            yPercent: 0,
            stagger: 0.12,
            ease: "power2.out",
            scrollTrigger: { trigger: "[data-k='headline']", start: "top 85%", end: "bottom 45%", scrub: 0.8 },
          },
        );

        // Orange rule under the headline.
        gsap.fromTo("[data-k='rule']", { scaleX: 0 }, { scaleX: 1, ease: "none", scrollTrigger: { trigger: "[data-k='headline']", start: "top 70%", end: "bottom 40%", scrub: true } });

        // SVG geometry draws itself.
        el.querySelectorAll<SVGGeometryElement>("[data-k='draw']").forEach((p) => {
          const len = p.getTotalLength();
          gsap.fromTo(
            p,
            { strokeDasharray: len, strokeDashoffset: len },
            { strokeDashoffset: 0, ease: "none", scrollTrigger: { trigger: el, start: "top 80%", end: "center center", scrub: 1 } },
          );
        });
        gsap.to("[data-k='spin']", { rotate: 120, ease: "none", transformOrigin: "50% 50%", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 1 } });

        // Masked photograph expands from a narrow window to full frame.
        const tl = gsap.timeline({ scrollTrigger: { trigger: "[data-k='mask']", start: "top 90%", end: "center 45%", scrub: 0.8 } });
        tl.fromTo("[data-k='mask']", { clipPath: "inset(14% 28% 14% 28%)" }, { clipPath: "inset(0% 0% 0% 0%)", ease: "none" }, 0)
          .fromTo("[data-k='mask-img']", { scale: 1.35 }, { scale: 1, ease: "none" }, 0)
          .fromTo("[data-k='mask-b']", { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", ease: "none" }, 0.35);

        // Pillars rise in.
        gsap.from("[data-k='pillar']", { y: 50, opacity: 0, stagger: 0.12, duration: 1, scrollTrigger: { trigger: "[data-k='pillars']", start: "top 85%" } });
      });
    }));
    return () => {
      cancel();
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={root}
      id="standard"
      aria-labelledby="standard-title"
      className="relative isolate overflow-hidden bg-[#050505] py-24 sm:py-32 lg:py-40"
    >
      {/* Moving grid texture */}
      <div
        aria-hidden="true"
        className="grid-lines grid-drift absolute inset-0 -z-10 opacity-70 [mask-image:radial-gradient(70%_60%_at_50%_45%,black,transparent)]"
      />
      <div aria-hidden="true" className="absolute left-1/2 top-0 -z-10 h-[60%] w-[60%] -translate-x-1/2 bg-[radial-gradient(closest-side,rgba(255,90,31,0.13),transparent)]" />

      {/* SVG geometry */}
      <svg aria-hidden="true" className="absolute -right-40 top-10 -z-10 h-[620px] w-[620px] opacity-70 sm:-right-24 lg:right-[4%]" viewBox="0 0 600 600" fill="none">
        <g data-k="spin">
          <circle data-k="draw" cx="300" cy="300" r="250" stroke="rgba(255,255,255,0.14)" />
          <circle data-k="draw" cx="300" cy="300" r="190" stroke="rgba(255,90,31,0.55)" strokeDasharray="2 10" />
          <polygon data-k="draw" points="300,80 490,410 110,410" stroke="rgba(255,255,255,0.18)" />
          <rect data-k="draw" x="170" y="170" width="260" height="260" stroke="rgba(255,90,31,0.4)" />
        </g>
        <path data-k="draw" d="M0 520 L600 80" stroke="#FF5A1F" strokeWidth="1.5" />
      </svg>

      {/* Kinetic type rows */}
      <div aria-hidden="true" className="pointer-events-none select-none space-y-2 overflow-hidden">
        <div data-k="row-a" className="display flex w-max gap-8 whitespace-nowrap text-[clamp(4.5rem,14vw,13rem)] leading-none text-outline">
          <span>Discipline</span><span className="text-outline-ember">Strength</span><span>Performance</span><span>Discipline</span><span className="text-outline-ember">Strength</span>
        </div>
        <div data-k="row-b" className="display flex w-max gap-8 whitespace-nowrap text-[clamp(4.5rem,14vw,13rem)] leading-none text-outline">
          <span>Premium</span><span>Quality</span><span className="text-outline-ember">Planet</span><span>Muscle</span><span>Premium</span><span>Quality</span>
        </div>
      </div>

      <div className="container-x relative mt-16 lg:mt-24">
        <p className="eyebrow mb-8"><span className="text-ember">03</span> The standard</p>
        <h2 id="standard-title" data-k="headline" className="display max-w-6xl text-[clamp(3rem,9vw,8.5rem)] text-chrome">
          {headline.map((line, li) => (
            <span key={li} className="block">
              {line.map((w, wi) => (
                <span key={wi} className="inline-block overflow-hidden pr-[0.22em] align-top">
                  <span data-k="word" className={`inline-block ${li === 1 && w === "STANDARD" ? "text-ember" : li === 1 ? "text-metal" : ""}`}>
                    {w}
                  </span>
                </span>
              ))}
            </span>
          ))}
        </h2>
        <div data-k="rule" className="mt-8 h-[3px] w-full max-w-xl origin-left bg-ember" aria-hidden="true" />

        {/* Masked photography */}
        <div className="mt-16 grid gap-5 lg:mt-24 lg:grid-cols-[1.6fr_1fr]">
          <div data-k="mask" className="relative aspect-[16/11] overflow-hidden sm:aspect-[16/9]">
            <div data-k="mask-img" className="absolute inset-0">
              <Image src={images.standardA.src} alt={images.standardA.alt} fill sizes="(min-width: 1024px) 60vw, 100vw" className="object-cover" />
            </div>
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,5,5,0.6),transparent_50%)]" aria-hidden="true" />
            <p className="absolute bottom-5 left-5 max-w-[16rem] text-[0.7rem] font-semibold uppercase leading-relaxed tracking-[0.25em] text-silver sm:bottom-8 sm:left-8">
              Every rep is a decision. <span className="text-ember">Make it count.</span>
            </p>
          </div>
          <div className="relative hidden overflow-hidden lg:block">
            <div data-k="mask-b" className="absolute inset-0">
              <Image src={images.standardB.src} alt={images.standardB.alt} fill sizes="35vw" className="object-cover grayscale" />
              <div className="absolute inset-0 bg-ember/20 mix-blend-multiply" aria-hidden="true" />
            </div>
          </div>
        </div>

        <ol data-k="pillars" className="mt-16 grid gap-px border border-white/10 bg-white/10 md:grid-cols-3 lg:mt-24">
          {pillars.map((p) => (
            <li key={p.n} data-k="pillar" className="group relative bg-[#070707] p-7 sm:p-9">
              <span className="display text-sm text-ember">{p.n}</span>
              <h3 className="display mt-4 text-4xl text-chrome sm:text-5xl">{p.t}</h3>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-mute">{p.d}</p>
              <span className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-ember transition-transform duration-700 ease-out-expo group-hover:scale-x-100" aria-hidden="true" />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
