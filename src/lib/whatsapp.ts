import { site } from "@/config/site";

/** Build a wa.me link that opens WhatsApp with a prefilled message. */
export function whatsappLink(message: string, number: string = site.contact.whatsappNumber) {
  const digits = number.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export const generalEnquiry = () =>
  whatsappLink(`Hi ${site.shortName} team, I'd like to know more about memberships and training at the gym.`);

export const programEnquiry = (program: string) =>
  whatsappLink(
    `Hi ${site.shortName} team,\n\nI'm interested in the *${program}* program. Could you share the current schedule, availability and membership options?\n\nThank you!`,
  );

export const planEnquiry = (plan: string, cycleLabel: string, duration: string) =>
  whatsappLink(
    `Hi ${site.shortName} team,\n\nI'd like to enquire about the *${plan}* membership plan (${cycleLabel} · ${duration}).\n\nCould you please share the current price, what's included and how to get started?\n\nThank you!`,
  );

export type VisitRequest = {
  name: string;
  phone: string;
  date: string;
  time: string;
  program: string;
  message?: string;
};

export function visitRequestMessage(v: VisitRequest) {
  const date = new Date(`${v.date}T00:00:00`).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const lines = [
    `Hi ${site.shortName} team,`,
    "",
    "I'd like to request a *free gym visit*.",
    "",
    `• Name: ${v.name}`,
    `• Phone: ${v.phone}`,
    `• Preferred date: ${date}`,
    `• Preferred time: ${v.time}`,
    `• Interested in: ${v.program}`,
  ];
  if (v.message?.trim()) lines.push(`• Note: ${v.message.trim()}`);
  lines.push("", "Please let me know if this slot is available. Thank you!");
  return lines.join("\n");
}
