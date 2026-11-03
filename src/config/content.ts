import { unsplash, type SiteImage } from "./images";

/* ───────────────────────────── GALLERY ─────────────────────────────
 * Replace `src` with "/images/your-photo.jpg" after adding files to
 * /public/images. `size` controls the tile shape in the asymmetric grid.
 */
export const galleryCategories = [
  "Training Floor",
  "Equipment",
  "Personal Training",
  "Group Classes",
  "Facilities",
] as const;
export type GalleryCategory = (typeof galleryCategories)[number];

export type GalleryItem = SiteImage & {
  category: GalleryCategory;
  size: "tall" | "wide" | "square" | "large";
};

export const gallery: GalleryItem[] = [
  { src: unsplash("1593079831268-3381b0db4a77", 1800), alt: "Wide view of a dark training floor", category: "Training Floor", size: "large" },
  { src: unsplash("1583454110551-21f2fa2afe61", 1200), alt: "Member gripping dumbbells mid-set", category: "Personal Training", size: "tall" },
  { src: unsplash("1544033527-b192daee1f5b", 1200), alt: "Long rows of dumbbells on racks", category: "Equipment", size: "square" },
  { src: unsplash("1518611012118-696072aa579a", 1600), alt: "Group class performing floor exercises", category: "Group Classes", size: "wide" },
  { src: unsplash("1540497077202-7c8a3999166f", 1200), alt: "Bright facility with strength machines", category: "Facilities", size: "square" },
  { src: unsplash("1620188467120-5042ed1eb5da", 1200), alt: "Loaded barbell resting on the gym floor", category: "Equipment", size: "tall" },
  { src: unsplash("1534438327276-14e5300c3a48", 1600), alt: "Dumbbell racks along the training floor", category: "Training Floor", size: "wide" },
  { src: unsplash("1532384748853-8f54a8f476e2", 1200), alt: "Member performing a single-arm dumbbell row", category: "Personal Training", size: "square" },
  { src: unsplash("1607962837359-5e7e89f86776", 1200), alt: "Outdoor group running session", category: "Group Classes", size: "square" },
  { src: unsplash("1558611848-73f7eb4001a1", 1200), alt: "Strength machines beside a mirrored wall", category: "Facilities", size: "tall" },
  { src: unsplash("1576678927484-cc907957088c", 1600), alt: "Close-up of heavy dumbbells in soft focus", category: "Equipment", size: "wide" },
  { src: unsplash("1574680096145-d05b474e2155", 1200), alt: "Athlete preparing for a barbell squat", category: "Training Floor", size: "square" },
];

/* ─────────────────────────── TESTIMONIALS ───────────────────────────
 * ⚠ EXAMPLES ONLY — these are not real reviews.
 * Replace with genuine member feedback (with permission) and set
 * `isPlaceholder: false` for each. Only add `rating` if the member gave one.
 */
export type Testimonial = {
  name: string;
  detail: string;
  quote: string;
  rating?: number;
  photo?: SiteImage;
  isPlaceholder: boolean;
};

export const testimonials: Testimonial[] = [
  {
    name: "Member Name",
    detail: "Member since 20XX · Strength Training",
    quote:
      "Example testimonial. Replace with a genuine quote from a member describing their experience — what changed for them and what they value most about training here.",
    isPlaceholder: true,
  },
  {
    name: "Member Name",
    detail: "Member since 20XX · Personal Training",
    quote:
      "Example testimonial. A real member might talk about their coach, the structure of their plan and how it fits around a busy work schedule.",
    isPlaceholder: true,
  },
  {
    name: "Member Name",
    detail: "Member since 20XX · Group Fitness",
    quote:
      "Example testimonial. Use the member's own words about the community, the classes and the consistency they've built.",
    isPlaceholder: true,
  },
  {
    name: "Member Name",
    detail: "Member since 20XX · Mobility & Recovery",
    quote:
      "Example testimonial. Ask members for permission before publishing their name, photo or rating alongside their feedback.",
    isPlaceholder: true,
  },
];

/* ─────────────────────────────── FAQ ─────────────────────────────── */
export const faqs: { q: string; a: string }[] = [
  {
    q: "I've never trained in a gym before. Is IRON PULSE right for me?",
    a: "Yes. Every new member can start with a guided introduction to the floor and equipment, and our coaches scale every program to your level. Book a free visit and we'll walk you through it.",
  },
  {
    q: "How does the free visit work?",
    a: "Choose a preferred date and time in the visit form and send the request on WhatsApp. Our team will reply to confirm availability. During the visit you can tour the facility, meet a coach and ask about plans.",
  },
  {
    q: "Can I pause or upgrade my membership?",
    a: "Membership changes depend on your plan. Message us on WhatsApp and the team will explain the options available for your membership.",
  },
  {
    q: "Do I need to book group classes in advance?",
    a: "We recommend reserving your spot so the coach can plan the session. The current timetable and booking process will be shared when you join.",
  },
  {
    q: "Is personal training included in membership?",
    a: "It depends on the plan — see the comparison table in the Membership section. Personal training can also be added to any plan.",
  },
  {
    q: "What should I bring for my first session?",
    a: "Comfortable training clothes, clean indoor shoes, a water bottle and a small towel. Lockers and changing rooms are available.",
  },
];
