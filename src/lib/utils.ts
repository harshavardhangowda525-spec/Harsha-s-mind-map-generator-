export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export const pad2 = (n: number) => String(n).padStart(2, "0");

export const formatINR = (n: number) => new Intl.NumberFormat("en-IN").format(n);

/** Custom event used to pre-select a program in the visit form. */
export const SELECT_PROGRAM_EVENT = "ironpulse:select-program";
export function selectProgramForVisit(program: string) {
  window.dispatchEvent(new CustomEvent(SELECT_PROGRAM_EVENT, { detail: program }));
  document.getElementById("visit")?.scrollIntoView({ behavior: "smooth", block: "start" });
}
