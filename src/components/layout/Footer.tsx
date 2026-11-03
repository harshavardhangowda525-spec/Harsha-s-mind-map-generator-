import Link from "next/link";
import { ArrowUp, ArrowUpRight } from "lucide-react";
import { fullAddress, navLinks, site } from "@/config/site";
import { programs } from "@/config/programs";
import { plans } from "@/config/membership";
import { Logo } from "@/components/ui/Logo";
import { SocialIcon } from "@/components/ui/SocialIcon";
import { generalEnquiry } from "@/lib/whatsapp";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-[#060606] pb-28 pt-20 md:pb-10">
      {/* animated accent rail */}
      <div className="absolute inset-x-0 top-0 h-px overflow-hidden" aria-hidden="true">
        <div className="marquee h-px w-[200%] bg-[linear-gradient(90deg,transparent,#FF5A1F_20%,transparent_40%,transparent_60%,#FF5A1F_80%,transparent)] [--dur:9s]" />
      </div>

      <div className="container-x">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr_1fr_1fr_1.2fr]">
          <div>
            <Logo />
            <p className="display mt-6 text-3xl text-chrome">{site.tagline}</p>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-mute">
              Premium strength, coaching and conditioning — built for people who train with purpose.
            </p>
            <div className="mt-6 flex gap-2">
              {site.socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-11 w-11 items-center justify-center border border-white/15 text-silver transition-colors hover:border-ember hover:text-ember"
                >
                  <SocialIcon name={s.icon} />
                </a>
              ))}
            </div>
          </div>

          <FooterCol title="Explore">
            {navLinks.map((l) => (
              <FooterLink key={l.id} href={`#${l.id}`}>{l.label}</FooterLink>
            ))}
          </FooterCol>

          <FooterCol title="Programs">
            {programs.map((p) => (
              <FooterLink key={p.slug} href="#programs">{p.title}</FooterLink>
            ))}
          </FooterCol>

          <FooterCol title="Membership">
            {plans.map((p) => (
              <FooterLink key={p.id} href="#membership">{p.name}</FooterLink>
            ))}
            <FooterLink href="#visit">Book a free visit</FooterLink>
            <FooterLink href={generalEnquiry()} external>Membership enquiry</FooterLink>
          </FooterCol>

          <FooterCol title="Contact">
            <li className="text-sm leading-relaxed text-mute">{fullAddress}</li>
            <FooterLink href={`tel:${site.contact.phoneHref}`}>{site.contact.phoneDisplay}</FooterLink>
            <FooterLink href={`mailto:${site.contact.email}`}>{site.contact.email}</FooterLink>
          </FooterCol>
        </div>

        <div className="pointer-events-none relative mt-20 select-none" aria-hidden="true">
          <p className="display whitespace-nowrap text-center text-[clamp(2.5rem,14.5vw,15rem)] leading-[0.8] text-outline">
            {site.brandMark}
          </p>
          <div className="absolute inset-x-0 bottom-[18%] h-[3px] origin-left bg-ember" data-reveal="line" />
        </div>

        <div className="mt-10 flex flex-col-reverse gap-6 relative border-t border-white/10 pt-6 text-xs text-dim sm:flex-row sm:items-center sm:justify-between md:pr-20">
          <p>
            © {year} {site.legal.businessName}. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-chrome">Privacy policy</Link>
            <a
              href="#home"
              className="group inline-flex items-center gap-2 font-semibold uppercase tracking-[0.2em] text-silver hover:text-ember"
            >
              Back to top
              <span className="flex h-10 w-10 items-center justify-center border border-white/15 transition-all duration-500 group-hover:-translate-y-1 group-hover:border-ember">
                <ArrowUp className="h-4 w-4" aria-hidden="true" />
              </span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-5 text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-chrome">{title}</h3>
      <ul className="space-y-1">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children, external }: { href: string; children: React.ReactNode; external?: boolean }) {
  return (
    <li>
      <a
        href={href}
        className="group inline-flex items-center gap-1.5 py-1.5 text-sm text-mute transition-colors hover:text-chrome"
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        <span className="h-px w-0 bg-ember transition-all duration-300 group-hover:w-3" />
        {children}
        {external && <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />}
      </a>
    </li>
  );
}
