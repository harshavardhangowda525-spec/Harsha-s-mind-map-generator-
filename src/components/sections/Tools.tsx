"use client";

import { useId, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Info, Plus } from "lucide-react";
import { faqs } from "@/config/content";
import { cn } from "@/lib/utils";

/** BMI calculator + FAQ, side by side on large screens. */
export function Tools() {
  return (
    <section id="tools" aria-label="BMI calculator and frequently asked questions" className="relative bg-ink py-24 sm:py-32 lg:py-40">
      <div className="container-x grid gap-16 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
        <BmiCalculator />
        <Faq />
      </div>
    </section>
  );
}

/* ───────────────────────────── BMI ───────────────────────────── */

const bands = [
  { max: 18.5, label: "Below the standard range", note: "A BMI under 18.5 is classed as below the standard adult range." },
  { max: 25, label: "Within the standard range", note: "A BMI from 18.5 to 24.9 falls within the standard adult range." },
  { max: 30, label: "Above the standard range", note: "A BMI from 25 to 29.9 is classed as above the standard adult range." },
  { max: Infinity, label: "Well above the standard range", note: "A BMI of 30 or more is classed as well above the standard adult range." },
];

function BmiCalculator() {
  const id = useId();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [cm, setCm] = useState("");
  const [kg, setKg] = useState("");
  const [ft, setFt] = useState("");
  const [inch, setInch] = useState("");
  const [lb, setLb] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const { bmi, error } = useMemo(() => {
    let hM: number, wKg: number;
    if (unit === "metric") {
      hM = parseFloat(cm) / 100;
      wKg = parseFloat(kg);
    } else {
      hM = ((parseFloat(ft) || 0) * 12 + (parseFloat(inch) || 0)) * 0.0254;
      wKg = parseFloat(lb) * 0.45359237;
    }
    if (!hM || !wKg || isNaN(hM) || isNaN(wKg)) return { bmi: null, error: "Enter your height and weight." };
    if (hM < 1 || hM > 2.5) return { bmi: null, error: "Please enter a height between 100 cm and 250 cm (3 ft 4 in – 8 ft 2 in)." };
    if (wKg < 25 || wKg > 300) return { bmi: null, error: "Please enter a weight between 25 kg and 300 kg (55 lb – 660 lb)." };
    return { bmi: wKg / (hM * hM), error: null };
  }, [unit, cm, kg, ft, inch, lb]);

  const band = bmi !== null ? bands.find((b) => bmi < b.max)! : null;
  // Gauge position across 12–40 range.
  const pos = bmi !== null ? Math.min(100, Math.max(0, ((bmi - 12) / 28) * 100)) : 0;

  return (
    <div>
      <p className="eyebrow mb-6" data-reveal><span className="text-ember">08</span> Tools</p>
      <h2 className="display text-[clamp(2.5rem,6vw,4.75rem)] text-chrome" data-reveal>BMI calculator</h2>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-mute" data-reveal>
        A quick, private check using the standard formula: weight (kg) ÷ height (m)². Nothing you enter is saved or sent anywhere.
      </p>

      <form
        className="surface-metal mt-8 p-6 sm:p-8"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(true);
        }}
        noValidate
        autoComplete="off"
        data-reveal
      >
        <div role="radiogroup" aria-label="Units" className="inline-flex border border-white/15 p-1">
          {(["metric", "imperial"] as const).map((u) => (
            <button
              key={u}
              type="button"
              role="radio"
              aria-checked={unit === u}
              onClick={() => {
                setUnit(u);
                setSubmitted(false);
              }}
              className={cn(
                "min-h-10 px-4 text-[0.68rem] font-semibold uppercase tracking-[0.18em] transition-colors",
                unit === u ? "bg-ember text-[#0b0b0b]" : "text-mute hover:text-chrome",
              )}
            >
              {u === "metric" ? "cm / kg" : "ft / lb"}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {unit === "metric" ? (
            <>
              <NumField id={`${id}-cm`} label="Height (cm)" value={cm} onChange={setCm} placeholder="e.g. 172" />
              <NumField id={`${id}-kg`} label="Weight (kg)" value={kg} onChange={setKg} placeholder="e.g. 68" />
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <NumField id={`${id}-ft`} label="Height (ft)" value={ft} onChange={setFt} placeholder="5" />
                <NumField id={`${id}-in`} label="(in)" value={inch} onChange={setInch} placeholder="8" />
              </div>
              <NumField id={`${id}-lb`} label="Weight (lb)" value={lb} onChange={setLb} placeholder="e.g. 150" />
            </>
          )}
        </div>

        <button
          type="submit"
          className="mt-6 inline-flex min-h-12 w-full items-center justify-center bg-chrome px-6 text-[0.75rem] font-bold uppercase tracking-[0.18em] text-ink transition-colors hover:bg-white sm:w-auto"
        >
          Calculate BMI
        </button>

        <div aria-live="polite" className="mt-6">
          {submitted && error && <p className="text-sm text-[#ff8a8a]">{error}</p>}
          {submitted && bmi !== null && band && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="flex flex-wrap items-end justify-between gap-4 border-t border-white/10 pt-6">
                <div>
                  <p className="text-[0.66rem] font-semibold uppercase tracking-[0.22em] text-dim">Your BMI</p>
                  <p className="display mt-1 text-6xl text-chrome">{bmi.toFixed(1)}</p>
                </div>
                <p className="text-sm font-semibold text-ember">{band.label}</p>
              </div>
              <div className="relative mt-6" aria-hidden="true">
                <div className="flex h-1.5 overflow-hidden">
                  <span className="w-[23%] bg-white/25" />
                  <span className="w-[23%] bg-white/50" />
                  <span className="w-[18%] bg-white/30" />
                  <span className="flex-1 bg-white/15" />
                </div>
                <span className="absolute -top-1.5 h-4 w-[3px] -translate-x-1/2 bg-ember transition-[left] duration-700" style={{ left: `${pos}%` }} />
                <div className="relative mt-2 h-3 text-[0.6rem] tabular-nums text-dim">
                  {[12, 18.5, 25, 30, 40].map((v) => (
                    <span key={v} className="absolute -translate-x-1/2 first:translate-x-0 last:-translate-x-full" style={{ left: `${((v - 12) / 28) * 100}%` }}>
                      {v}
                    </span>
                  ))}
                </div>
              </div>
              <p className="mt-5 text-sm leading-relaxed text-silver">{band.note}</p>
            </motion.div>
          )}
        </div>

        <div className="mt-6 flex gap-3 border-t border-white/10 pt-5 text-xs leading-relaxed text-mute">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-ember" aria-hidden="true" />
          <p>
            BMI is a limited screening measure for adults, not a diagnosis. It doesn&apos;t account for muscle mass, body
            composition, age, sex or ethnicity, and adult ranges are not appropriate for children or teenagers. For personal
            health advice, please speak to a doctor or qualified health professional.
          </p>
        </div>
      </form>
    </div>
  );
}

function NumField({ id, label, value, onChange, placeholder }: { id: string; label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-mute">{label}</label>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        min={0}
        step="any"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="field"
      />
    </div>
  );
}

/* ───────────────────────────── FAQ ───────────────────────────── */

function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const base = useId();
  return (
    <div>
      <p className="eyebrow mb-6" data-reveal>Questions</p>
      <h2 className="display text-[clamp(2.5rem,6vw,4.75rem)] text-chrome" data-reveal>Before you start</h2>
      <ul className="mt-8 border-t border-white/10">
        {faqs.map((f, i) => {
          const isOpen = open === i;
          return (
            <li key={f.q} className="border-b border-white/10" data-reveal style={{ ["--d" as string]: i * 60 }}>
              <h3>
                <button
                  type="button"
                  id={`${base}-q${i}`}
                  aria-expanded={isOpen}
                  aria-controls={`${base}-a${i}`}
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="group flex w-full items-center justify-between gap-6 py-6 text-left"
                >
                  <span className={cn("text-base font-semibold transition-colors sm:text-lg", isOpen ? "text-chrome" : "text-silver group-hover:text-chrome")}>{f.q}</span>
                  <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center border transition-all duration-500", isOpen ? "rotate-45 border-ember bg-ember text-ink" : "border-white/20 text-chrome group-hover:border-ember")}>
                    <Plus className="h-4 w-4" aria-hidden="true" />
                  </span>
                </button>
              </h3>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    id={`${base}-a${i}`}
                    role="region"
                    aria-labelledby={`${base}-q${i}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="max-w-xl pb-6 pr-12 text-sm leading-relaxed text-mute sm:text-base">{f.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
