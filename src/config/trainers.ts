import { images, type SiteImage } from "./images";

/**
 * TRAINERS — ⚠ SAMPLE PROFILES ONLY.
 * These are not real people. Replace name, photo, specialization, experience,
 * certifications and bio with each coach's verified details, then set
 * `isPlaceholder: false`.
 */
export type Trainer = {
  name: string;
  role: string;
  specialization: string;
  experience: string;
  certifications: string[];
  bio: string;
  image: SiteImage;
  isPlaceholder: boolean;
};

export const trainers: Trainer[] = [
  {
    name: "Coach Name One",
    role: "Head Coach",
    specialization: "Strength & Powerlifting",
    experience: "X years coaching",
    certifications: ["Certification to be added", "Certification to be added"],
    bio: "Sample biography. Replace with the coach's own words about their approach, background and the members they love working with.",
    image: images.trainers.one,
    isPlaceholder: true,
  },
  {
    name: "Coach Name Two",
    role: "Performance Coach",
    specialization: "Functional & Conditioning",
    experience: "X years coaching",
    certifications: ["Certification to be added", "Certification to be added"],
    bio: "Sample biography. Describe this coach's coaching style, specialities and what a first session with them looks like.",
    image: images.trainers.two,
    isPlaceholder: true,
  },
  {
    name: "Coach Name Three",
    role: "Personal Trainer",
    specialization: "Body Recomposition",
    experience: "X years coaching",
    certifications: ["Certification to be added"],
    bio: "Sample biography. Add verified credentials and a short, friendly introduction to help new members choose a coach.",
    image: images.trainers.three,
    isPlaceholder: true,
  },
  {
    name: "Coach Name Four",
    role: "Group & Mobility Coach",
    specialization: "Group Fitness & Mobility",
    experience: "X years coaching",
    certifications: ["Certification to be added", "Certification to be added"],
    bio: "Sample biography. Mention the classes this coach leads and how they help members build consistency.",
    image: images.trainers.four,
    isPlaceholder: true,
  },
];
