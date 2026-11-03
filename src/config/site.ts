/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  IRON PULSE — SITE CONFIGURATION
 *  Every business detail on the website comes from this file.
 *  Edit values here; no component changes are required.
 *
 *  Anything marked  ⚠ PLACEHOLDER  must be replaced with details verified by
 *  the gym owner before the site goes live.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const site = {
  name: "IRON PULSE",
  shortName: "Iron Pulse",
  tagline: "BEYOND YOUR LIMITS.",
  description:
    "IRON PULSE is a premium gym and training center offering strength training, personal coaching, functional fitness, group classes and recovery — built for people who want to train with purpose.",

  /** Production URL. Prefer setting NEXT_PUBLIC_SITE_URL in Vercel. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://iron-pulse.vercel.app",
  locale: "en_IN",

  contact: {
    // ⚠ PLACEHOLDER — all contact details below
    phoneDisplay: "+91 00000 00000",
    phoneHref: "+910000000000",
    /** WhatsApp number in international format, digits only (no +, spaces or dashes). */
    whatsappNumber: "910000000000",
    email: "hello@your-gym-domain.in",
    address: {
      line1: "Your Street Address, Building / Floor",
      line2: "Area / Locality",
      city: "City",
      region: "State",
      postalCode: "000000",
      country: "India",
    },
    /** Paste the gym's Google Maps share link (used by the "Get directions" button). */
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=gym",
    /**
     * Optional: Google Maps "Embed a map" iframe src. Loaded only when a
     * visitor clicks "Show map" (keeps the page fast). Leave empty to hide.
     */
    mapsEmbedUrl: "",
  },

  // ⚠ PLACEHOLDER — confirm with the gym owner
  hours: [
    { days: "Monday – Friday", time: "5:30 AM – 10:30 PM" },
    { days: "Saturday", time: "6:00 AM – 9:00 PM" },
    { days: "Sunday", time: "7:00 AM – 12:00 PM" },
  ],

  /** Time slots offered in the free-visit form (keep within opening hours). */
  visitSlots: [
    "6:00 AM – 8:00 AM",
    "8:00 AM – 11:00 AM",
    "11:00 AM – 2:00 PM",
    "2:00 PM – 5:00 PM",
    "5:00 PM – 8:00 PM",
    "8:00 PM – 10:00 PM",
  ],

  // ⚠ PLACEHOLDER — replace with real profile URLs, or remove entries.
  socials: [
    { label: "Instagram", href: "https://instagram.com/" , icon: "instagram" },
    { label: "Facebook", href: "https://facebook.com/", icon: "facebook" },
    { label: "YouTube", href: "https://youtube.com/", icon: "youtube" },
  ] as const,

  /**
   * About-section statistics. ⚠ PLACEHOLDER numbers.
   * Keep `isPlaceholder: true` until the owner verifies them — the site will
   * then show a small "placeholder" label so nothing is presented as fact.
   */
  stats: {
    isPlaceholder: true,
    items: [
      { value: 500, suffix: "+", label: "Active members" },
      { value: 8, suffix: "", label: "Certified trainers" },
      { value: 6, suffix: "", label: "Training programs" },
      { value: 5, suffix: "+", label: "Years of experience" },
    ],
  },

  legal: {
    businessName: "IRON PULSE Fitness", // ⚠ PLACEHOLDER — registered business name
    privacyLastUpdated: "2026-11-03",
  },
} as const;

export const navLinks = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "programs", label: "Programs" },
  { id: "trainers", label: "Trainers" },
  { id: "membership", label: "Membership" },
  { id: "gallery", label: "Gallery" },
  { id: "contact", label: "Contact" },
] as const;

/** Sections tracked by the floating section counter (in page order). */
export const trackedSections = [
  { id: "home", label: "Intro" },
  { id: "about", label: "About" },
  { id: "programs", label: "Programs" },
  { id: "standard", label: "Standard" },
  { id: "trainers", label: "Coaches" },
  { id: "membership", label: "Membership" },
  { id: "gallery", label: "Gallery" },
  { id: "testimonials", label: "Members" },
  { id: "tools", label: "BMI & FAQ" },
  { id: "visit", label: "Free Visit" },
  { id: "contact", label: "Contact" },
] as const;

export const fullAddress = (() => {
  const a = site.contact.address;
  return `${a.line1}, ${a.line2}, ${a.city}, ${a.region} ${a.postalCode}`;
})();
