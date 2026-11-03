import { images, type SiteImage } from "./images";

/**
 * TRAINING PROGRAMS — edit titles, copy, benefits and schedules here.
 * Schedules are ⚠ PLACEHOLDER until the gym confirms its timetable.
 */
export type Program = {
  slug: string;
  title: string;
  kicker: string;
  summary: string;
  description: string;
  image: SiteImage;
  benefits: string[];
  idealFor: string;
  schedule: { day: string; time: string }[];
  scheduleIsPlaceholder: boolean;
};

export const programs: Program[] = [
  {
    slug: "strength-training",
    title: "Strength Training",
    kicker: "Barbell · Dumbbell · Progressive overload",
    summary: "Build raw, usable strength with structured lifting cycles and technique-first coaching.",
    description:
      "Squat, hinge, press and pull — the foundations of real strength. Our strength program follows a planned progression so every session builds on the last, with coaches on the floor to keep your technique sharp and your training safe.",
    image: images.programs.strength,
    benefits: [
      "Structured weekly progression",
      "Technique coaching on core lifts",
      "Fully equipped racks and platforms",
      "Suitable from first lift to advanced",
    ],
    idealFor: "Anyone who wants to get measurably stronger — beginners included.",
    schedule: [
      { day: "Mon · Wed · Fri", time: "6:30 AM & 7:00 PM" },
      { day: "Tue · Thu", time: "7:30 PM" },
    ],
    scheduleIsPlaceholder: true,
  },
  {
    slug: "personal-training",
    title: "Personal Training",
    kicker: "1-on-1 · Fully personalised",
    summary: "One coach, one plan, built around your goals, your schedule and your starting point.",
    description:
      "Work one-on-one with a coach who plans every session around you. Expect an initial assessment, a clear plan, regular check-ins and the accountability that keeps progress moving.",
    image: images.programs.personal,
    benefits: [
      "Initial movement & goal assessment",
      "Individual programming",
      "Flexible session times",
      "Regular progress reviews",
    ],
    idealFor: "Members who want maximum guidance and accountability.",
    schedule: [{ day: "Monday – Saturday", time: "By appointment" }],
    scheduleIsPlaceholder: true,
  },
  {
    slug: "functional-fitness",
    title: "Functional Fitness",
    kicker: "Ropes · Sleds · Kettlebells",
    summary: "Train movements that carry into real life — power, coordination and work capacity.",
    description:
      "High-energy sessions using kettlebells, battle ropes, sleds and bodyweight work. Functional training builds an athletic, capable body that performs well outside the gym too.",
    image: images.programs.functional,
    benefits: [
      "Full-body athletic conditioning",
      "Scalable for every fitness level",
      "Improves coordination and power",
      "Coach-led small groups",
    ],
    idealFor: "People who want variety and athletic conditioning.",
    schedule: [
      { day: "Tue · Thu · Sat", time: "7:00 AM" },
      { day: "Mon · Wed", time: "6:30 PM" },
    ],
    scheduleIsPlaceholder: true,
  },
  {
    slug: "cardio-conditioning",
    title: "Cardio Conditioning",
    kicker: "Engine · Endurance · Recovery",
    summary: "Build a stronger engine with interval and steady-state work that fits your level.",
    description:
      "Structured conditioning that develops your heart and lungs, from steady-state sessions to coach-led intervals. Improve stamina, energy and recovery between hard training days.",
    image: images.programs.cardio,
    benefits: [
      "Interval and steady-state formats",
      "Modern cardio equipment",
      "Heart-rate guided options",
      "Complements strength training",
    ],
    idealFor: "Anyone looking to improve stamina and everyday energy.",
    schedule: [{ day: "Daily", time: "Open floor during gym hours" }],
    scheduleIsPlaceholder: true,
  },
  {
    slug: "group-fitness",
    title: "Group Fitness",
    kicker: "Classes · Energy · Community",
    summary: "Coach-led classes where the energy of the room pushes you further than training alone.",
    description:
      "Show up, plug in and train with a group that keeps you accountable. Classes are coached, scalable and designed to be challenging and fun at every fitness level.",
    image: images.programs.group,
    benefits: [
      "Coach-led, scalable workouts",
      "Motivating group atmosphere",
      "Variety across the week",
      "Great for building consistency",
    ],
    idealFor: "People who love energy, structure and community.",
    schedule: [
      { day: "Mon – Fri", time: "7:00 AM & 6:00 PM" },
      { day: "Saturday", time: "8:00 AM" },
    ],
    scheduleIsPlaceholder: true,
  },
  {
    slug: "mobility-recovery",
    title: "Mobility & Recovery",
    kicker: "Stretch · Breathe · Restore",
    summary: "Move better and recover faster with guided mobility, stretching and breathwork.",
    description:
      "Mobility and recovery sessions that help you train consistently. Improve range of motion, ease stiffness from desk work and build the resilience that keeps you training for years.",
    image: images.programs.mobility,
    benefits: [
      "Guided mobility routines",
      "Helps ease stiffness from desk work",
      "Supports better training quality",
      "Calm, low-impact sessions",
    ],
    idealFor: "Everyone — especially working professionals and lifters.",
    schedule: [
      { day: "Wed · Sun", time: "8:00 AM" },
      { day: "Friday", time: "7:30 PM" },
    ],
    scheduleIsPlaceholder: true,
  },
];
