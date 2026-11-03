import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { site } from "@/config/site";
import { Logo } from "@/components/ui/Logo";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${site.name} handles information shared through this website.`,
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  const updated = new Date(site.legal.privacyLastUpdated).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  return (
    <main className="page-enter min-h-screen bg-ink">
      <header className="border-b border-white/10">
        <div className="container-x flex h-20 items-center justify-between">
          <Link href="/" aria-label={`${site.name} home`}><Logo /></Link>
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-mute hover:text-chrome">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to site
          </Link>
        </div>
      </header>
      <article className="container-x max-w-3xl py-20 text-mute [&_h2]:display [&_h2]:mt-12 [&_h2]:text-3xl [&_h2]:text-chrome [&_p]:mt-4 [&_p]:leading-relaxed [&_li]:mt-2 [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-5">
        <p className="eyebrow">Legal</p>
        <h1 className="display mt-6 text-6xl text-chrome sm:text-7xl">Privacy policy</h1>
        <p className="text-sm">Last updated: {updated}</p>
        <p className="mt-6 border-l-2 border-ember pl-4 text-sm">
          This is a general template. The gym owner should review it (ideally with a legal adviser) before launch.
        </p>

        <h2>Who we are</h2>
        <p>
          This website is operated by {site.legal.businessName} (&ldquo;{site.name}&rdquo;, &ldquo;we&rdquo;). You can contact us at{" "}
          <a className="text-ember" href={`mailto:${site.contact.email}`}>{site.contact.email}</a> or {site.contact.phoneDisplay}.
        </p>

        <h2>Information you share</h2>
        <p>
          This website does not have user accounts and does not store form submissions on our servers. When you use the free-visit
          form or an enquiry button, your details are placed into a WhatsApp message on your own device. Nothing is shared with us until
          you choose to send that message.
        </p>
        <ul>
          <li>Information in WhatsApp messages you send us (such as name, phone number, preferred visit time) is used only to respond to your enquiry and arrange your visit.</li>
          <li>WhatsApp is operated by a third party and its own privacy policy applies to messages sent through it.</li>
        </ul>

        <h2>BMI calculator</h2>
        <p>The BMI calculator runs entirely in your browser. Height and weight values are not saved, transmitted or stored.</p>

        <h2>Cookies &amp; analytics</h2>
        <p>
          This website does not use advertising cookies. If analytics are added in future, this policy will be updated to describe them.
          Our hosting provider may keep standard server logs (such as IP address and browser type) for security and performance.
        </p>

        <h2>Third-party links</h2>
        <p>Links to WhatsApp, Google Maps and social media open services with their own privacy practices.</p>

        <h2>Your choices</h2>
        <p>You can ask us to delete enquiry messages you have sent us by contacting us using the details above.</p>

        <h2>Changes</h2>
        <p>We may update this policy from time to time. The &ldquo;last updated&rdquo; date above shows the latest version.</p>
      </article>
    </main>
  );
}
