/**
 * MEMBERSHIP PLANS
 * ⚠ Prices below are SAMPLE VALUES for layout only — not real prices.
 * Replace every `price` with the gym's confirmed pricing, then set
 * `PRICING_IS_PLACEHOLDER = false` to remove the "sample pricing" notice.
 *
 * Set a price to `null` to show "Ask us" instead of a number.
 */

export const PRICING_IS_PLACEHOLDER = true;
export const CURRENCY_SYMBOL = "₹";

export type BillingCycle = "monthly" | "quarterly" | "annual";

export const billingCycles: { id: BillingCycle; label: string; durationLabel: string }[] = [
  { id: "monthly", label: "Monthly", durationLabel: "1 month" },
  { id: "quarterly", label: "Quarterly", durationLabel: "3 months" },
  { id: "annual", label: "Annual", durationLabel: "12 months" },
];

export type Plan = {
  id: string;
  name: string;
  tagline: string;
  featured?: boolean;
  /** Total price for the whole duration of each cycle. */
  price: Record<BillingCycle, number | null>;
  facilities: string[];
  programAccess: string;
  personalTraining: string;
};

export const plans: Plan[] = [
  {
    id: "essential",
    name: "Essential",
    tagline: "For people beginning their fitness journey.",
    price: { monthly: 1999, quarterly: 5499, annual: 19999 },
    facilities: ["Full gym floor access", "Cardio zone", "Locker & changing rooms"],
    programAccess: "Open-floor training",
    personalTraining: "Available as paid add-on",
  },
  {
    id: "performance",
    name: "Performance",
    tagline: "For members seeking structured training and additional support.",
    featured: true,
    price: { monthly: 2999, quarterly: 7999, annual: 28999 },
    facilities: ["Everything in Essential", "All group classes", "Monthly progress check-in"],
    programAccess: "Strength, Functional, Cardio & Group programs",
    personalTraining: "Eligible · discounted add-on sessions",
  },
  {
    id: "elite",
    name: "Elite",
    tagline: "For members seeking premium coaching and expanded access.",
    price: { monthly: 5999, quarterly: 16999, annual: 59999 },
    facilities: ["Everything in Performance", "Mobility & Recovery sessions", "Priority booking"],
    programAccess: "All six programs",
    personalTraining: "Included coaching sessions each month",
  },
];

/** Benefits comparison table. `true`, `false`, or a short text value per plan id. */
export const comparison: { feature: string; values: Record<string, boolean | string> }[] = [
  { feature: "Gym floor & equipment", values: { essential: true, performance: true, elite: true } },
  { feature: "Cardio zone", values: { essential: true, performance: true, elite: true } },
  { feature: "Locker & changing rooms", values: { essential: true, performance: true, elite: true } },
  { feature: "Group fitness classes", values: { essential: false, performance: true, elite: true } },
  { feature: "Structured programs", values: { essential: false, performance: "4 programs", elite: "All 6" } },
  { feature: "Progress check-ins", values: { essential: false, performance: "Monthly", elite: "Bi-weekly" } },
  { feature: "Mobility & Recovery", values: { essential: false, performance: false, elite: true } },
  { feature: "Personal training", values: { essential: "Add-on", performance: "Discounted", elite: "Included" } },
];
