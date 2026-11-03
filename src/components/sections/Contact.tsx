"use client";

import { useState } from "react";
import { ArrowUpRight, Clock, Mail, MapPin, Navigation, Phone } from "lucide-react";
import { fullAddress, site } from "@/config/site";
import { SocialIcon } from "@/components/ui/SocialIcon";
import { PlaceholderTag } from "@/components/ui/Placeholder";
import { generalEnquiry } from "@/lib/whatsapp";

export function Contact() {
  const [showMap, setShowMap] = useState(false);
  const c = site.contact;
  const a = c.address;

  return (
    <section id="contact" aria-labelledby="contact-title" className="relative bg-ink py-24 sm:py-32 lg:py-40">
      <div className="container-x">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-end">
          <div>
            <p className="eyebrow mb-6" data-reveal><span className="text-ember">10</span> Contact &amp; location</p>
            <h2 id="contact-title" className="display text-[clamp(2.75rem,8vw,7rem)] text-chrome">
              <span className="block overflow-hidden pb-[0.04em]"><span className="block" data-reveal>Come train</span></span>
              <span className="block overflow-hidden pb-[0.04em]"><span className="block text-metal" data-reveal style={{ ["--d" as string]: 120 }}>with us.</span></span>
            </h2>
          </div>
          <PlaceholderTag className="justify-self-start lg:justify-self-end">Business details to be confirmed</PlaceholderTag>
        </div>

        <div className="mt-14 grid gap-5 lg:grid-cols-[1fr_1.25fr]">
          {/* Info */}
          <div className="grid gap-px border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-1">
            <InfoBlock icon={MapPin} title="Address">
              <address className="not-italic leading-relaxed">
                {a.line1}
                <br />
                {a.line2}
                <br />
                {a.city}, {a.region} {a.postalCode}
              </address>
            </InfoBlock>
            <InfoBlock icon={Clock} title="Opening hours">
              <dl className="space-y-1.5">
                {site.hours.map((h) => (
                  <div key={h.days} className="flex justify-between gap-4">
                    <dt>{h.days}</dt>
                    <dd className="text-chrome">{h.time}</dd>
                  </div>
                ))}
              </dl>
            </InfoBlock>
            <InfoBlock icon={Phone} title="Call or WhatsApp">
              <a href={`tel:${c.phoneHref}`} className="block py-1 text-chrome hover:text-ember">{c.phoneDisplay}</a>
              <a href={generalEnquiry()} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-2 py-1 text-ember hover:underline">
                <SocialIcon name="whatsapp" /> Start a WhatsApp enquiry
              </a>
            </InfoBlock>
            <InfoBlock icon={Mail} title="Email & social">
              <a href={`mailto:${c.email}`} className="block break-all py-1 text-chrome hover:text-ember">{c.email}</a>
              <div className="mt-3 flex gap-2">
                {site.socials.map((s) => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="flex h-11 w-11 items-center justify-center border border-white/15 text-silver hover:border-ember hover:text-ember">
                    <SocialIcon name={s.icon} />
                  </a>
                ))}
              </div>
            </InfoBlock>
          </div>

          {/* Location card */}
          <div className="relative flex min-h-[420px] flex-col overflow-hidden border border-white/10 bg-[#0c0c0c]" data-reveal>
            {showMap && c.mapsEmbedUrl ? (
              <iframe
                title={`Map showing ${site.name}`}
                src={c.mapsEmbedUrl}
                className="absolute inset-0 h-full w-full grayscale invert-[0.9] contrast-[0.9]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : (
              <MapGraphic />
            )}
            <div className="relative mx-4 mb-4 mt-auto border border-white/10 bg-[#0a0a0a]/90 p-5 backdrop-blur sm:mx-6 sm:mb-6 sm:p-6">
              <p className="text-[0.66rem] font-semibold uppercase tracking-[0.22em] text-ember">Find us</p>
              <p className="display mt-2 text-3xl text-chrome">{site.name}</p>
              <p className="mt-2 text-sm leading-relaxed text-mute">{fullAddress}</p>
              <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                <a href={c.mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 bg-ember px-5 text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[#0b0b0b] hover:bg-[#ff6d38]">
                  <Navigation className="h-4 w-4" aria-hidden="true" /> Get directions
                </a>
                {c.mapsEmbedUrl && !showMap && (
                  <button type="button" onClick={() => setShowMap(true)} className="inline-flex min-h-12 items-center justify-center gap-2 border border-white/20 px-5 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-chrome hover:border-ember">
                    Show map <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoBlock({ icon: Icon, title, children }: { icon: React.ComponentType<{ className?: string }>; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#0c0c0c] p-6 text-sm text-mute sm:p-7" data-reveal>
      <h3 className="mb-4 flex items-center gap-3 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-chrome">
        <Icon className="h-4 w-4 text-ember" aria-hidden="true" /> {title}
      </h3>
      {children}
    </div>
  );
}

/** Stylised street-grid illustration with a pulsing location pin (no third-party map load). */
function MapGraphic() {
  return (
    <svg aria-hidden="true" className="absolute inset-0 h-full w-full" viewBox="0 0 600 500" preserveAspectRatio="xMidYMid slice" fill="none">
      <rect width="600" height="500" fill="#0c0c0c" />
      <g stroke="rgba(255,255,255,0.06)">
        {Array.from({ length: 16 }).map((_, i) => (
          <path key={`v${i}`} d={`M${i * 40} 0V500`} />
        ))}
        {Array.from({ length: 13 }).map((_, i) => (
          <path key={`h${i}`} d={`M0 ${i * 40}H600`} />
        ))}
      </g>
      <g stroke="rgba(255,255,255,0.16)" strokeWidth="10" strokeLinecap="round">
        <path d="M-20 140 C 150 120, 260 200, 620 160" />
        <path d="M180 -20 L 260 520" />
        <path d="M-20 360 L 620 300" />
      </g>
      <g stroke="rgba(255,255,255,0.09)" strokeWidth="4">
        <path d="M420 -20 L 380 520" />
        <path d="M-20 250 L 620 230" />
        <path d="M60 -20 L 120 520" />
      </g>
      <path d="M90 470 C 160 380, 200 300, 300 236" stroke="#FF5A1F" strokeWidth="2.5" className="draw-loop" />
      <g transform="translate(300 230)">
        <circle r="46" fill="rgba(255,90,31,0.12)">
          <animate attributeName="r" values="18;56;18" dur="2.8s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="1;0;1" dur="2.8s" repeatCount="indefinite" />
        </circle>
        <circle r="9" fill="#FF5A1F" />
        <circle r="3.5" fill="#0b0b0b" />
      </g>
    </svg>
  );
}
