"use client";

import { useEffect, useId, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { AlertCircle, ArrowUpRight, CheckCircle2, Loader2 } from "lucide-react";
import { images } from "@/config/images";
import { programs } from "@/config/programs";
import { site } from "@/config/site";
import { SocialIcon } from "@/components/ui/SocialIcon";
import { cn, SELECT_PROGRAM_EVENT } from "@/lib/utils";
import { visitRequestMessage, whatsappLink, type VisitRequest } from "@/lib/whatsapp";

const NOT_SURE = "Not sure yet — help me choose";
type Errors = Partial<Record<keyof VisitRequest, string>>;
type Status = "idle" | "loading" | "success" | "error";

const toISO = (d: Date) => {
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
};

function validate(v: VisitRequest, today: string, maxDate: string): Errors {
  const e: Errors = {};
  const name = v.name.trim();
  if (name.length < 2) e.name = "Please enter your full name.";
  else if (!/^[\p{L} .'-]+$/u.test(name)) e.name = "Please use letters only.";
  const digits = v.phone.replace(/\D/g, "");
  const local = digits.length === 12 && digits.startsWith("91") ? digits.slice(2) : digits.length === 11 && digits.startsWith("0") ? digits.slice(1) : digits;
  if (!local) e.phone = "Please enter your phone number.";
  else if (!/^[6-9]\d{9}$/.test(local)) e.phone = "Enter a valid 10-digit mobile number.";
  if (!v.date) e.date = "Choose a preferred date.";
  else if (v.date < today) e.date = "Please choose today or a future date.";
  else if (v.date > maxDate) e.date = "Please choose a date within the next 60 days.";
  if (!v.time) e.time = "Choose a preferred time.";
  if (!v.program) e.program = "Choose a program.";
  if ((v.message ?? "").length > 500) e.message = "Please keep your message under 500 characters.";
  return e;
}

export function Visit() {
  const uid = useId();
  const [values, setValues] = useState<VisitRequest>({ name: "", phone: "", date: "", time: "", program: NOT_SURE, message: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof VisitRequest, boolean>>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [link, setLink] = useState("");
  const [range, setRange] = useState({ today: "", max: "" });

  useEffect(() => {
    const now = new Date();
    const max = new Date(now);
    max.setDate(max.getDate() + 60);
    setRange({ today: toISO(now), max: toISO(max) });
    const onSelect = (e: Event) => {
      const program = (e as CustomEvent<string>).detail;
      setValues((v) => ({ ...v, program }));
    };
    window.addEventListener(SELECT_PROGRAM_EVENT, onSelect);
    return () => window.removeEventListener(SELECT_PROGRAM_EVENT, onSelect);
  }, []);

  const set = (k: keyof VisitRequest) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const next = { ...values, [k]: e.target.value };
    setValues(next);
    if (touched[k]) setErrors(validate(next, range.today, range.max));
    if (status !== "idle" && status !== "loading") setStatus("idle");
  };
  const blur = (k: keyof VisitRequest) => () => {
    setTouched((t) => ({ ...t, [k]: true }));
    setErrors(validate(values, range.today, range.max));
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errs = validate(values, range.today, range.max);
    setErrors(errs);
    setTouched({ name: true, phone: true, date: true, time: true, program: true, message: true });
    const first = Object.keys(errs)[0];
    if (first) {
      (e.currentTarget.querySelector(`[name='${first}']`) as HTMLElement | null)?.focus();
      return;
    }
    setStatus("loading");
    const url = whatsappLink(visitRequestMessage(values));
    setLink(url);
    // Open synchronously within the user gesture to avoid popup blockers.
    const w = window.open(url, "_blank");
    if (w) {
      try {
        w.opener = null;
      } catch {
        /* ignore */
      }
    }
    await new Promise((r) => setTimeout(r, 650));
    setStatus(w ? "success" : "error");
  };

  const err = (k: keyof VisitRequest) => (touched[k] ? errors[k] : undefined);

  return (
    <section id="visit" aria-labelledby="visit-title" className="relative isolate overflow-hidden bg-coal">
      <div className="grid lg:grid-cols-[1fr_1.15fr]">
        {/* Image side */}
        <div className="relative min-h-[360px] overflow-hidden lg:min-h-full">
          <div className="absolute inset-0" data-reveal="mask-x">
            <Image src={images.visit.src} alt={images.visit.alt} fill sizes="(min-width: 1024px) 46vw, 100vw" className="object-cover" />
          </div>
          <div className="absolute inset-0 bg-[linear-gradient(0deg,#121212_0%,rgba(18,18,18,0.3)_55%,rgba(18,18,18,0.6)_100%)] lg:bg-[linear-gradient(90deg,rgba(18,18,18,0.2)_0%,rgba(18,18,18,0.55)_70%,#121212_100%)]" aria-hidden="true" />
          <div className="relative flex h-full flex-col justify-end p-6 pb-10 sm:p-10 lg:p-14">
            <p className="eyebrow mb-6 text-silver"><span className="text-ember">09</span> Free gym visit</p>
            <h2 id="visit-title" className="display text-[clamp(2.75rem,6.5vw,6rem)] text-chrome">
              Your next chapter <span className="text-ember">starts here.</span>
            </h2>
            <ol className="mt-8 grid gap-4 text-sm text-silver sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {["Fill in your details", "Send it on WhatsApp", "We confirm your slot"].map((s, i) => (
                <li key={s} className="flex items-center gap-3 border-t border-white/15 pt-4">
                  <span className="display text-2xl text-ember">0{i + 1}</span> {s}
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Form side */}
        <div className="px-4 py-16 sm:px-10 sm:py-20 lg:px-14 lg:py-28">
          <form onSubmit={onSubmit} noValidate className="mx-auto max-w-xl" aria-describedby={`${uid}-note`}>
            <p id={`${uid}-note`} className="mb-8 text-sm leading-relaxed text-mute">
              Request a free visit to tour the gym and meet a coach. Your request opens in WhatsApp with everything filled in —
              just tap send. <span className="text-silver">Your visit is confirmed once our team replies.</span>
            </p>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Full name" id={`${uid}-name`} error={err("name")} className="sm:col-span-2">
                <input id={`${uid}-name`} name="name" autoComplete="name" className="field" value={values.name} onChange={set("name")} onBlur={blur("name")} aria-invalid={!!err("name")} aria-describedby={err("name") ? `${uid}-name-err` : undefined} placeholder="Your name" />
              </Field>
              <Field label="Phone number" id={`${uid}-phone`} error={err("phone")}>
                <input id={`${uid}-phone`} name="phone" type="tel" inputMode="tel" autoComplete="tel" className="field" value={values.phone} onChange={set("phone")} onBlur={blur("phone")} aria-invalid={!!err("phone")} aria-describedby={err("phone") ? `${uid}-phone-err` : undefined} placeholder="98765 43210" />
              </Field>
              <Field label="Interested program" id={`${uid}-program`} error={err("program")}>
                <select id={`${uid}-program`} name="program" className="field" value={values.program} onChange={set("program")} onBlur={blur("program")} aria-invalid={!!err("program")}>
                  <option>{NOT_SURE}</option>
                  {programs.map((p) => (
                    <option key={p.slug}>{p.title}</option>
                  ))}
                </select>
              </Field>
              <Field label="Preferred date" id={`${uid}-date`} error={err("date")}>
                <input id={`${uid}-date`} name="date" type="date" min={range.today || undefined} max={range.max || undefined} className="field" value={values.date} onChange={set("date")} onBlur={blur("date")} aria-invalid={!!err("date")} aria-describedby={err("date") ? `${uid}-date-err` : undefined} />
              </Field>
              <Field label="Preferred time" id={`${uid}-time`} error={err("time")}>
                <select id={`${uid}-time`} name="time" className="field" value={values.time} onChange={set("time")} onBlur={blur("time")} aria-invalid={!!err("time")} aria-describedby={err("time") ? `${uid}-time-err` : undefined}>
                  <option value="">Select a time</option>
                  {site.visitSlots.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </Field>
              <Field label="Message (optional)" id={`${uid}-message`} error={err("message")} className="sm:col-span-2">
                <textarea id={`${uid}-message`} name="message" rows={4} maxLength={600} className="field resize-none" value={values.message} onChange={set("message")} onBlur={blur("message")} aria-invalid={!!err("message")} placeholder="Goals, questions or anything we should know" />
              </Field>
            </div>

            <button
              type="submit"
              disabled={status === "loading"}
              className="group mt-8 inline-flex min-h-14 w-full items-center justify-center gap-3 bg-ember px-8 text-[0.75rem] font-bold uppercase tracking-[0.12em] text-[#0b0b0b] transition-colors hover:bg-[#ff6d38] disabled:opacity-70 sm:text-[0.8rem] sm:tracking-[0.2em]"
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> Preparing your message…
                </>
              ) : (
                <>
                  <SocialIcon name="whatsapp" className="h-5 w-5" /> Request visit on WhatsApp
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                </>
              )}
            </button>

            <div aria-live="polite" className="mt-6">
              <AnimatePresence mode="wait">
                {status === "success" && (
                  <motion.div key="ok" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex gap-3 border border-emerald-400/30 bg-emerald-400/[0.06] p-4 text-sm text-silver">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" aria-hidden="true" />
                    <p>
                      <span className="font-semibold text-chrome">Your message is ready in WhatsApp.</span> Tap send to submit your request — our team will
                      reply to confirm availability. Didn&apos;t open?{" "}
                      <a href={link} target="_blank" rel="noopener noreferrer" className="text-ember underline underline-offset-4">Open WhatsApp</a>.
                    </p>
                  </motion.div>
                )}
                {status === "error" && (
                  <motion.div key="err" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex gap-3 border border-ember/40 bg-ember/[0.06] p-4 text-sm text-silver">
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-ember" aria-hidden="true" />
                    <p>
                      Your browser blocked WhatsApp from opening.{" "}
                      <a href={link} target="_blank" rel="noopener noreferrer" className="font-semibold text-ember underline underline-offset-4">Tap here to open it</a>, or call us on{" "}
                      <a href={`tel:${site.contact.phoneHref}`} className="text-chrome underline underline-offset-4">{site.contact.phoneDisplay}</a>.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <p className="mt-4 text-xs text-dim">
              We don&apos;t store form data on this website — your details are only shared when you send the WhatsApp message.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}

function Field({ label, id, error, className, children }: { label: string; id: string; error?: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={cn(className)}>
      <label htmlFor={id} className="mb-2 block text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-mute">{label}</label>
      {children}
      {error && (
        <p id={`${id}-err`} className="mt-1.5 text-xs text-[#ff8a8a]">{error}</p>
      )}
    </div>
  );
}
