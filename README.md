# IRON PULSE — Premium Gym Website

**BEYOND YOUR LIMITS.**

A cinematic, conversion-focused one-page website for a premium gym, built with
Next.js (App Router), TypeScript, Tailwind CSS, GSAP + ScrollTrigger and Motion for React.
No 3D, no backend — enquiries and visit requests go straight to the gym's WhatsApp.

---

## Quick start

Requirements: **Node.js 20.9+** and npm.

```bash
npm install
npm run dev        # http://localhost:3000
```

Production build:

```bash
npm run build
npm start          # serves the production build on http://localhost:3000
npm run typecheck  # TypeScript check only
```

Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SITE_URL` to the live domain
(used for canonical URLs, sitemap, robots and Open Graph).

---

## What's included

| Section | Highlights |
| --- | --- |
| Page-load sequence | Pure-CSS brand reveal that lifts after about 1 s and never blocks content |
| Navigation | Transparent bar over the hero that becomes blurred glass and shrinks on scroll, highlights the active section, has a full-screen animated mobile menu, and supports keyboard focus trapping and Esc |
| Hero | Full-bleed photo with load zoom, parallax, animated light sweep, orange directional SVG lines, staggered headline, magnetic CTAs, scroll indicator and ticker |
| About | Masked image reveal, brand story, highlights, count-up statistics (labelled as placeholders) |
| Programs | Six-card asymmetric grid, hover zoom, overlay and arrow motion, tap-friendly on mobile. Each card opens a detail dialog with benefits, a sample schedule, a WhatsApp enquiry button and "Book a free visit", which fills in the form |
| The Standard | 2D motion graphics: scroll-scrubbed kinetic type, word-by-word headline fill, self-drawing SVG geometry, moving grid, masked photo transitions |
| Trainers | Cards with hover info panels, a snap carousel on smaller screens, and sample-profile labels |
| Membership | Monthly / Quarterly / Annual selector, animated prices from the config file, featured plan, comparison table. "Enquire about this plan" sends the plan and billing cycle to WhatsApp |
| Gallery | Asymmetric grid, category filters, full-screen lightbox with keyboard (← → Esc) and swipe navigation |
| Testimonials | Carousel with autoplay (pauses on hover or focus, plus a pause button), swipe, previous/next, progress bars, "Example" labels |
| BMI calculator | Metric or imperial, standard formula, neutral wording, clear limitations. Nothing is stored or sent anywhere |
| FAQ | Accessible accordion |
| Free visit | Validated form with loading, success and error states. Opens WhatsApp with a professional prefilled message. Never claims the booking is confirmed |
| Contact | Address, hours, phone, WhatsApp, email, socials, a stylised location card with "Get directions", and an optional click-to-load Google Map |
| Footer | Navigation, programs, membership links, contact, socials, privacy policy, animated accents, back to top |
| Extras | Scroll progress bar, floating section counter (desktop), floating WhatsApp button (desktop), sticky membership bar (mobile), privacy page, 404 page |

Also included: SEO metadata, Open Graph image (auto-generated), `sitemap.xml`, `robots.txt`,
web manifest, `ExerciseGym` JSON-LD, security headers, skip link, reduced-motion support, and
reveal animations that leave content visible when JavaScript is off.

---

## Editing content (no component changes needed)

All business content lives in **`src/config/`**:

| File | What you edit |
| --- | --- |
| `site.ts` | Gym name, tagline, description, **site URL**, phone, **WhatsApp number**, email, address, Google Maps links, opening hours, visit time slots, social links, About statistics, legal business name |
| `images.ts` | Every photo used in the hero, About, Standard, Visit, Programs and Trainers sections |
| `programs.ts` | Six programs: title, copy, image, benefits, "ideal for", schedule |
| `trainers.ts` | Coach profiles |
| `membership.ts` | Plans, **prices per billing cycle**, facilities, program access, personal-training eligibility, comparison table |
| `content.ts` | Gallery images and categories, testimonials, FAQ |

### Placeholder flags

The site marks unverified content on the page itself, so nothing is presented as fact before
the owner confirms it:

- `site.stats.isPlaceholder` shows a "Placeholder figures" label on the statistics
- `PRICING_IS_PLACEHOLDER` (in `membership.ts`) shows a "Sample pricing" label
- `isPlaceholder` on each trainer shows a "Sample" label
- `isPlaceholder` on each testimonial shows an "Example" label
- `scheduleIsPlaceholder` on each program shows a "Sample timing" label

Set each flag to `false` **only after** the real details are in place.

### Replacing photos

1. Put the client's photos in `public/images/` (e.g. `public/images/hero.jpg`).
2. In `src/config/images.ts` (or `content.ts` for the gallery), change `src` to `"/images/hero.jpg"`.
3. Update the `alt` text to describe the new photo.

Recommended sizes: hero and section images about 2400 px wide, cards about 1200 px.
Photos are served in AVIF/WebP at the right size for each device by `next/image`.
After all photos are local, you can remove the Unsplash entry from `next.config.ts`.

### WhatsApp number

`site.contact.whatsappNumber` takes the international format, **digits only**: for example,
`919876543210` for +91 98765 43210.

---

## Deploying to Vercel

1. Push this repository to GitHub.
2. In Vercel, go to **Add New → Project**, import the repo, keep the detected **Next.js**
   settings and click **Deploy**.
3. Go to **Settings → Environment Variables** and add `NEXT_PUBLIC_SITE_URL` =
   `https://www.your-domain.in` (Production). Redeploy.
4. Go to **Settings → Domains** and add the client's domain, then follow Vercel's DNS
   instructions (an A record for the apex domain and a CNAME for `www`). HTTPS
   certificates are issued automatically.
5. After launch, test the live URL with
   [PageSpeed Insights](https://pagespeed.web.dev/) and submit `/sitemap.xml` in Google Search Console.

---

## Project structure

```
src/
  app/
    layout.tsx           fonts, metadata, JSON-LD, skip link
    page.tsx             section order
    globals.css          design tokens, textures, motion keyframes, reveal system
    privacy/page.tsx     privacy policy template
    opengraph-image.tsx  generated social preview
    sitemap.ts · robots.ts · manifest.ts · icon.svg · not-found.tsx
  components/
    layout/   Header (+ mobile menu), Footer, ScrollUI (progress, counter, floating CTAs), RevealObserver
    sections/ Hero, About, Programs, Standard, Trainers, Membership, Gallery, Testimonials, Tools (BMI + FAQ), Visit, Contact
    ui/       Logo, MagneticButton, SectionHeading, Counter, Parallax, Placeholder tag, SocialIcon
  config/     ← all editable content
  lib/        whatsapp.ts (message builders), hooks.ts, gsap.ts, utils.ts
```

**Animation approach:** CSS keyframes handle the load sequence, hero entrance and ambient
loops. One shared IntersectionObserver drives `[data-reveal]` scroll reveals. GSAP with
ScrollTrigger handles scrubbed effects (parallax, the Standard section) and starts during
browser idle time so it doesn't slow down loading. Motion for React handles UI state
transitions (menu, dialogs, prices, lightbox, carousel, accordion). Every effect respects
`prefers-reduced-motion`.

---

## Measured results (local, before launch)

Lighthouse 13.6 against the local production build (`next start`), with headless Chromium
using the default mobile and desktop presets with simulated throttling:

| | Performance | Accessibility | Best Practices | SEO |
| --- | --- | --- | --- | --- |
| Mobile | 94–95 | 100 | 100 | 100 |
| Desktop | 99 | 100 | 100 | 100 |

Mobile: LCP about 1.0 s, CLS 0, TBT 200–250 ms. Desktop: LCP 0.3 s, CLS 0, TBT 0 ms.

These scores are from a local machine with Unsplash-hosted images. **Re-measure on the live
domain** with PageSpeed Insights after the client's photos and content are in place.

Also tested in Chromium at 360, 390, 768, 1366 and 1920 px wide: no horizontal overflow and no
console errors. Automated checks covered the mobile menu, program dialog, form validation, the
WhatsApp handoff, plan selector, lightbox (click, keyboard, Esc), gallery filters, BMI, FAQ, the
trainer carousel, reduced motion and the skip link.

---

## Client content required before launch

- [ ] Final gym name, logo files and registered business name
- [ ] Domain name (and DNS access)
- [ ] Phone number and **WhatsApp business number**
- [ ] Email address
- [ ] Full address and Google Maps link (optional: Google Maps embed code)
- [ ] Opening hours, plus visit time slots that suit the front desk
- [ ] Social media profile links
- [ ] Verified statistics (members, trainers, programs, years), or remove them
- [ ] Program details and **real class timetables**
- [ ] Trainer names, photos, specializations, experience and **verified certifications**
- [ ] **Membership prices** for each plan and billing cycle, and what each plan includes
- [ ] Genuine member testimonials, **with permission** (optional: photos and ratings)
- [ ] Professional photos of the gym: training floor, equipment, personal training, classes, facilities
- [ ] Review of the privacy policy wording by the owner

---

Photography: free-to-use images from [Unsplash](https://unsplash.com/license), used as stand-ins
until the client's own photos are added.
