"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Award } from "lucide-react";
import { trainers } from "@/config/trainers";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PlaceholderTag } from "@/components/ui/Placeholder";
import { cn } from "@/lib/utils";

export function Trainers() {
  const track = useRef<HTMLUListElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });
  const anyPlaceholder = trainers.some((t) => t.isPlaceholder);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const update = () =>
      setEdge({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8 });
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const scrollBy = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const card = el.querySelector("li");
    el.scrollBy({ left: dir * ((card?.clientWidth ?? 300) + 16), behavior: "smooth" });
  };

  return (
    <section id="trainers" aria-labelledby="trainers-title" className="relative bg-ink py-24 sm:py-32 lg:py-40">
      <div className="container-x">
        <SectionHeading
          id="trainers-title"
          index="04"
          eyebrow="Meet the coaches"
          lines={["Coached to", "go further."]}
          intro={
            <>
              Experienced coaches who plan, correct and push — so every session counts.
              {anyPlaceholder && (
                <span className="mt-4 block">
                  <PlaceholderTag>Sample profiles — replace with real coaches</PlaceholderTag>
                </span>
              )}
            </>
          }
        />

        <div className="mt-12 flex items-center justify-end gap-2 lg:hidden">
          <CarouselButton label="Previous coach" disabled={edge.start} onClick={() => scrollBy(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </CarouselButton>
          <CarouselButton label="Next coach" disabled={edge.end} onClick={() => scrollBy(1)}>
            <ArrowRight className="h-5 w-5" />
          </CarouselButton>
        </div>
      </div>

      <div className="container-x mt-6 !pr-0 lg:mt-20 lg:!pr-14">
        <ul
          ref={track}
          aria-label="Coaches"
          className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 pr-4 lg:grid lg:grid-cols-4 lg:gap-5 lg:overflow-visible lg:pr-0"
        >
          {trainers.map((t, i) => (
            <li
              key={t.name + i}
              className="w-[82%] shrink-0 snap-start xs:w-[70%] sm:w-[44%] lg:w-auto"
              data-reveal
              style={{ ["--d" as string]: i * 110 }}
            >
              <article className="group relative h-full transition-transform duration-700 ease-out-expo lg:hover:-translate-y-2" tabIndex={-1}>
                <div className="relative aspect-[3/4] overflow-hidden bg-steel">
                  <Image
                    src={t.image.src}
                    alt={t.image.alt}
                    fill
                    sizes="(min-width: 1024px) 24vw, (min-width: 640px) 44vw, 82vw"
                    className="object-cover grayscale-[0.85] transition-[transform,filter] duration-[1.2s] ease-out-expo group-hover:scale-105 group-hover:grayscale-0"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(8,8,8,0.95)_0%,rgba(8,8,8,0.1)_55%)]" aria-hidden="true" />
                  {t.isPlaceholder && <PlaceholderTag className="absolute left-3 top-3 bg-black/60 backdrop-blur">Sample</PlaceholderTag>}
                  <span className="display absolute right-4 top-3 text-2xl text-white/60" aria-hidden="true">0{i + 1}</span>

                  {/* Hover info panel (pointer devices) */}
                  <div className="absolute inset-x-0 bottom-0 hidden translate-y-full bg-[#0c0c0c]/95 p-5 backdrop-blur transition-transform duration-700 ease-out-expo group-hover:translate-y-0 group-focus-within:translate-y-0 [@media(hover:hover)]:block">
                    <p className="text-sm leading-relaxed text-silver">{t.bio}</p>
                    <ul className="mt-4 space-y-1.5">
                      {t.certifications.map((c, k) => (
                        <li key={k} className="flex items-center gap-2 text-xs text-mute">
                          <Award className="h-3.5 w-3.5 text-ember" aria-hidden="true" /> {c}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="absolute inset-x-0 bottom-0 p-5 transition-opacity duration-500 [@media(hover:hover)]:group-hover:opacity-0">
                    <p className="text-[0.66rem] font-semibold uppercase tracking-[0.22em] text-ember">{t.role}</p>
                    <h3 className="display mt-2 text-3xl text-chrome">{t.name}</h3>
                  </div>
                </div>

                <div className="mt-4 flex items-start justify-between gap-4 border-t border-white/10 pt-4">
                  <div>
                    <p className="text-sm font-semibold text-chrome">{t.specialization}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-mute">{t.experience}</p>
                  </div>
                  <span className="mt-1 h-px w-8 bg-ember transition-all duration-500 group-hover:w-14" aria-hidden="true" />
                </div>

                {/* Touch devices: details always visible */}
                <div className="mt-3 [@media(hover:hover)]:hidden">
                  <p className="text-sm leading-relaxed text-mute">{t.bio}</p>
                  <ul className="mt-3 space-y-1.5">
                    {t.certifications.map((c, k) => (
                      <li key={k} className="flex items-center gap-2 text-xs text-mute">
                        <Award className="h-3.5 w-3.5 text-ember" aria-hidden="true" /> {c}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function CarouselButton({ label, disabled, onClick, children }: { label: string; disabled: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex h-12 w-12 items-center justify-center border border-white/20 text-chrome transition-colors hover:border-ember hover:text-ember",
        "disabled:opacity-30 disabled:hover:border-white/20 disabled:hover:text-chrome",
      )}
    >
      {children}
    </button>
  );
}
