"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Check, Minus } from "lucide-react";
import {
  billingCycles,
  comparison,
  CURRENCY_SYMBOL,
  plans,
  PRICING_IS_PLACEHOLDER,
  type BillingCycle,
} from "@/config/membership";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PlaceholderTag } from "@/components/ui/Placeholder";
import { cn, formatINR } from "@/lib/utils";
import { planEnquiry } from "@/lib/whatsapp";

const months: Record<BillingCycle, number> = { monthly: 1, quarterly: 3, annual: 12 };

export function Membership() {
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const cycleMeta = billingCycles.find((c) => c.id === cycle)!;

  return (
    <section id="membership" aria-labelledby="membership-title" className="relative overflow-hidden bg-coal py-24 sm:py-32 lg:py-40">
      <div aria-hidden="true" className="absolute -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 bg-[radial-gradient(closest-side,rgba(255,90,31,0.12),transparent)]" />
      <div className="container-x relative">
        <SectionHeading
          id="membership-title"
          index="05"
          eyebrow="Membership"
          lines={["Your goals.", "Your plan."]}
          intro="Three clear plans. No confusion. Choose your billing cycle, compare what's included, and enquire in one tap — your plan is added to the message automatically."
        />

        {/* Billing selector */}
        <div className="mt-14 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between lg:mt-20">
          <div role="radiogroup" aria-label="Billing cycle" className="relative inline-flex w-full rounded-[2px] border border-white/15 bg-black/40 p-1 sm:w-auto">
            {billingCycles.map((c) => {
              const active = c.id === cycle;
              return (
                <button
                  key={c.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setCycle(c.id)}
                  onKeyDown={(e) => {
                    const idx = billingCycles.findIndex((b) => b.id === cycle);
                    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                      e.preventDefault();
                      const next = billingCycles[(idx + (e.key === "ArrowRight" ? 1 : billingCycles.length - 1)) % billingCycles.length];
                      setCycle(next.id);
                      (e.currentTarget.parentElement?.querySelector(`[data-cycle='${next.id}']`) as HTMLElement | null)?.focus();
                    }
                  }}
                  tabIndex={active ? 0 : -1}
                  data-cycle={c.id}
                  className={cn(
                    "relative min-h-11 flex-1 px-5 text-[0.72rem] font-semibold uppercase tracking-[0.18em] transition-colors sm:flex-none sm:px-7",
                    active ? "text-[#0b0b0b]" : "text-mute hover:text-chrome",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="cycle-pill"
                      className="absolute inset-0 rounded-[1px] bg-ember"
                      transition={{ type: "spring", stiffness: 420, damping: 36 }}
                    />
                  )}
                  <span className="relative">{c.label}</span>
                </button>
              );
            })}
          </div>
          {PRICING_IS_PLACEHOLDER && <PlaceholderTag>Sample pricing — final prices set by the gym</PlaceholderTag>}
        </div>

        {/* Plan cards */}
        <ul className="mt-8 grid gap-5 lg:grid-cols-3 lg:items-stretch">
          {plans.map((p, i) => {
            const price = p.price[cycle];
            return (
              <li key={p.id} data-reveal style={{ ["--d" as string]: i * 110 }}>
                <article
                  className={cn(
                    "group relative flex h-full flex-col p-7 transition-transform duration-700 ease-out-expo sm:p-9 lg:hover:-translate-y-2",
                    p.featured
                      ? "border border-ember/70 bg-[linear-gradient(170deg,#1f130d_0%,#121212_45%,#0d0d0d_100%)] shadow-[0_30px_80px_-40px_rgba(255,90,31,0.6)]"
                      : "surface-metal",
                  )}
                >
                  {p.featured && (
                    <span className="absolute -top-px right-7 bg-ember px-3 py-1.5 text-[0.62rem] font-bold uppercase tracking-[0.22em] text-[#0b0b0b]">
                      Recommended
                    </span>
                  )}
                  <span className="display text-sm text-ember">0{i + 1}</span>
                  <h3 className="display mt-3 text-5xl text-chrome">{p.name}</h3>
                  <p className="mt-3 min-h-12 text-sm leading-relaxed text-mute">{p.tagline}</p>

                  <div className="mt-8 border-y border-white/10 py-6" aria-live="polite">
                    <div className="relative h-[3.6rem] overflow-hidden">
                      <AnimatePresence mode="popLayout" initial={false}>
                        <motion.p
                          key={`${p.id}-${cycle}`}
                          className="display flex items-baseline gap-1 text-[3.4rem] leading-none text-chrome"
                          initial={{ y: "100%", opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: "-100%", opacity: 0 }}
                          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        >
                          {price === null ? (
                            <span className="text-4xl">Ask us</span>
                          ) : (
                            <>
                              <span className="text-2xl text-mute">{CURRENCY_SYMBOL}</span>
                              {formatINR(price)}
                            </>
                          )}
                        </motion.p>
                      </AnimatePresence>
                    </div>
                    <p className="mt-2 text-xs uppercase tracking-[0.16em] text-mute">
                      {cycleMeta.durationLabel}
                      {price !== null && months[cycle] > 1 && (
                        <> · ≈ {CURRENCY_SYMBOL}{formatINR(Math.round(price / months[cycle]))}/month</>
                      )}
                    </p>
                  </div>

                  <dl className="mt-6 space-y-5 text-sm">
                    <div>
                      <dt className="text-[0.66rem] font-semibold uppercase tracking-[0.22em] text-dim">Facilities</dt>
                      <dd className="mt-2.5">
                        <ul className="space-y-2">
                          {p.facilities.map((f) => (
                            <li key={f} className="flex gap-2.5 text-silver">
                              <Check className="mt-0.5 h-4 w-4 shrink-0 text-ember" aria-hidden="true" /> {f}
                            </li>
                          ))}
                        </ul>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[0.66rem] font-semibold uppercase tracking-[0.22em] text-dim">Program access</dt>
                      <dd className="mt-1.5 text-silver">{p.programAccess}</dd>
                    </div>
                    <div>
                      <dt className="text-[0.66rem] font-semibold uppercase tracking-[0.22em] text-dim">Personal training</dt>
                      <dd className="mt-1.5 text-silver">{p.personalTraining}</dd>
                    </div>
                  </dl>

                  <div className="mt-auto pt-9">
                  <a
                    href={planEnquiry(p.name, cycleMeta.label, cycleMeta.durationLabel)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "flex min-h-12 w-full items-center justify-center gap-2 px-5 text-[0.72rem] font-bold uppercase tracking-[0.18em] transition-colors",
                      p.featured ? "bg-ember text-[#0b0b0b] hover:bg-[#ff6d38]" : "border border-white/20 text-chrome hover:border-ember hover:text-ember",
                    )}
                    aria-label={`Enquire about the ${p.name} plan, ${cycleMeta.label} billing, on WhatsApp`}
                  >
                    Enquire about this plan <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </a>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>

        {/* Comparison */}
        <div className="mt-20" data-reveal>
          <h3 className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-chrome">Compare benefits</h3>
          <div className="mt-6 overflow-x-auto border border-white/10">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <caption className="sr-only">Membership benefits by plan</caption>
              <thead>
                <tr className="bg-black/40">
                  <th scope="col" className="p-4 text-left text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-dim">Benefit</th>
                  {plans.map((p) => (
                    <th key={p.id} scope="col" className={cn("p-4 text-center display text-xl font-normal", p.featured ? "text-ember" : "text-chrome")}>
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparison.map((row) => (
                  <tr key={row.feature} className="border-t border-white/10 transition-colors hover:bg-white/[0.02]">
                    <th scope="row" className="p-4 text-left font-normal text-silver">{row.feature}</th>
                    {plans.map((p) => {
                      const v = row.values[p.id];
                      return (
                        <td key={p.id} className={cn("p-4 text-center", p.featured && "bg-ember/[0.04]")}>
                          {v === true ? (
                            <Check className="mx-auto h-4 w-4 text-ember" aria-label="Included" />
                          ) : v === false || v === undefined ? (
                            <Minus className="mx-auto h-4 w-4 text-dim" aria-label="Not included" />
                          ) : (
                            <span className="text-chrome">{v}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
