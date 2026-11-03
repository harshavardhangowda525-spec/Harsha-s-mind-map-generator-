/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  IMAGE LIBRARY
 *  Every photograph on the site is referenced from here.
 *
 *  Current images: free-to-use photos from Unsplash (https://unsplash.com/license).
 *  To use the client's own photographs:
 *    1. Put files in /public/images  (e.g. /public/images/hero.jpg)
 *    2. Change `src` below to "/images/hero.jpg"
 *    3. Update `alt` to describe the new photo.
 *  Recommended: landscape 2400px wide for hero/sections, 1200px for cards.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type SiteImage = { src: string; alt: string };

const unsplash = (id: string, w = 2000) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

export const images = {
  hero: {
    src: unsplash("1605296867304-46d5465a13f1", 2400),
    alt: "Athlete preparing for a heavy barbell lift in a dark, dramatically lit gym",
  },
  about: {
    src: unsplash("1623874514711-0f321325f318"),
    alt: "Spacious industrial training floor with benches, racks and natural light",
  },
  standardA: {
    src: unsplash("1574680178050-55c6a6a96e0a"),
    alt: "Athlete performing a barbell back squat in a squat rack",
  },
  standardB: {
    src: unsplash("1526506118085-60ce8714f8c5"),
    alt: "Close-up of an athlete's back under low gym lighting",
  },
  visit: {
    src: unsplash("1637666062717-1c6bcfa4a4df"),
    alt: "Gym interior with dumbbell racks and an orange ceiling beam",
  },
  programs: {
    strength: { src: unsplash("1517836357463-d25dfeac3438", 1400), alt: "Barbell deadlift on a rubber gym floor" },
    personal: { src: unsplash("1597452485669-2c7bb5fef90d", 1400), alt: "Member training on a cable machine" },
    functional: { src: unsplash("1599058917212-d750089bc07e", 1400), alt: "Athlete training with battle ropes" },
    cardio: { src: unsplash("1571902943202-507ec2618e8f", 1400), alt: "Row of treadmills and cardio equipment" },
    group: { src: unsplash("1518310383802-640c2de311b2", 1400), alt: "Group fitness class training together" },
    mobility: { src: unsplash("1544367567-0f2fcb009e0b", 1400), alt: "Person in a deep stretching pose at sunset" },
  },
  trainers: {
    one: { src: unsplash("1567013127542-490d757e51fc", 900), alt: "Coach portrait in the gym (placeholder photo)" },
    two: { src: unsplash("1550345332-09e3ac987658", 900), alt: "Coach portrait in black and white (placeholder photo)" },
    three: { src: unsplash("1611672585731-fa10603fb9e0", 900), alt: "Coach training with dumbbells (placeholder photo)" },
    four: { src: unsplash("1594381898411-846e7d193883", 900), alt: "Coach portrait in training wear (placeholder photo)" },
  },
} as const;

export { unsplash };
