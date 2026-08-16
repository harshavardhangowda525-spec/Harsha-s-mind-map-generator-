# MindMap — Turn Any Resource Into a Living Story

A premium, cinematic AI mind-map generator with the editorial sophistication of a
luxury brand. Paste notes, upload a document, or name a topic, and watch your
knowledge bloom into a beautiful, interactive mind map — then keep growing it
every day with **Storybook Mode**.

> A Node/Express backend adds secure accounts, email verification, sessions,
> user profiles, and an admin panel — while the mind-map generator itself is
> unchanged. See **Accounts & security** below.

---

## ✦ Highlights

- **Cinematic hero** — full-screen animated neural-network canvas, scroll parallax,
  masked line reveals, and large Cormorant Garamond typography.
- **Interactive Mind-Map Studio** — paste text, upload `.txt/.md/.pdf/.csv`, or
  enter a topic. Generates a live SVG map with:
  - Central topic → main branches → subtopics → key points & examples
  - **Zoom & pan**, **drag-and-drop nodes**, **expand / collapse**
  - Three layouts: **radial**, **tree**, **horizontal**
  - Controls: **Regenerate · Expand · Summarize · Explain · Export (PNG) · Save**
- **Storybook Mode** — a persistent reading journal. Add a chapter from your own
  resources whenever you learn something; each one merges into your evolving map
  and highlights the new knowledge. Press **Finished** to archive a book into
  your **Finished Storybooks** collection and start the next. Saved in your
  browser between visits.
- **Knowledge Journey dashboard** — daily resource cards and count-up stats.
- **Multi-page experience** — each nav item (Generator, Storybook, Journey,
  Features, About) opens as its own page with its own URL.
- **Luxury motion** — magnetic buttons, custom cursor, scroll-triggered reveals,
  a scroll-driven text-fill "About" section, and parallax statements.
- **Fully responsive** and respects `prefers-reduced-motion`.

## ✦ The "AI" engine

The concept extraction runs **entirely in the browser** — no keys, no network.
`js/generator.js` performs sentence segmentation, stop-word–filtered keyword
scoring, phrase/heading detection, example/definition cue detection, curated
topic templates, and a Storybook merge algorithm that scores label overlap to
decide whether today's themes attach to an existing branch or spawn a new one.

To wire in a real LLM later, replace `MindGen.fromText` / `MindGen.fromTopic`
with an API call that returns the same `{ root, meta }` tree shape.

## ✦ Accounts & security

The app is gated behind authentication: an unauthenticated visitor sees the
**Login** screen first, and the mind-map generator only appears after a valid,
verified session exists. A Node/Express + SQLite backend serves both the site
and the API.

- **Auth flow:** Sign Up → email verification → Login → Mind Map Generator.
  A logged-in user with a valid session is taken straight to the app on return.
- **Email verification:** a secure, expiring, single-use link; unverified users
  can't log in. The verify screen offers Resend, Change Email, and Back to Login.
- **Forgot / reset password:** expiring, single-use reset links.
- **Sessions:** stateless JWT in an `httpOnly`, `SameSite`, `Secure` cookie —
  never localStorage. Log out invalidates it; the server is the source of truth.
- **Profile & settings:** update your name and change your password; the nav
  shows your name with Profile, Account Settings, and Log Out.
- **Protected routes & data:** every `/api/maps` and `/api/admin` route is
  server-authorized; each user sees only their own saved maps.
- **Admin panel (`/admin`):** the single admin — `harshavardhangowda525@gmail.com`
  (configurable via `ADMIN_EMAIL`) — is granted the admin role **server-side
  only** and can view/search users, inspect details and saved maps, enable/disable
  accounts, and delete accounts. The admin account itself can't be disabled/deleted.
- **Disabled accounts:** can't log in and have existing sessions invalidated on
  the next request, with a clear "account has been disabled" message.
- **Security:** bcrypt password hashing, server-side authorization, rate-limited
  auth endpoints, hashed + expiring tokens, input validation, and security
  headers. No secret is hard-coded — all come from environment variables.

## ✦ Structure

```
index.html            Page markup + auth/profile/admin pages, SPA router shell
css/styles.css        Luxury editorial design system (dark charcoal + gold)
js/generator.js       Client-side content-analysis engine → mind-map tree
js/mindmap.js         Interactive SVG renderer (layouts, zoom, pan, drag, export)
js/storybook.js       Curated daily resources for the example Storybook
js/main.js            Orchestration, animations, page router + auth gate
js/auth.js            Auth client: session gate, login/signup/verify/reset,
                      profile, settings, and the admin panel UI
server/index.js       Express app: security headers, static frontend, API mount
server/config.js      All configuration from environment variables
server/db.js          SQLite schema (users, tokens, maps) + migrations
server/tokens.js      Secure, expiring, single-use verify/reset tokens
server/mailer.js      SMTP email (dev mode logs links to the console)
server/middleware.js  requireAuth / requireVerified / requireAdmin guards
server/routes/auth.js Signup, verify, login, logout, me, profile, password, reset
server/routes/maps.js Per-user saved mind maps (CRUD, protected)
server/routes/admin.js Admin: users, search, enable/disable, delete, maps, stats
```

## ✦ Run it

Accounts need the backend. The Express server serves both the site and the API:

```bash
npm install
cp .env.example .env          # set JWT_SECRET; ADMIN_EMAIL defaults to the admin
npm start                     # → http://localhost:3000
```

In development you don't need a mail server — verification and reset links are
printed to the server console (and surfaced on the page) so you can test the
whole flow locally.

### Configuration (environment variables)

Copy `.env.example` and set: `ADMIN_EMAIL` (the sole admin), `JWT_SECRET`
(required in production), `DATABASE_FILE` (SQLite path), the `SMTP_*` values and
`EMAIL_FROM` (email service + sender), `APP_URL` (public URL used in email
links), and the token lifetimes. Never commit real secrets.

### Deployment

Deploy the Node app to any Node host (Render, Railway, Fly.io, a VPS, Docker).
Set the environment variables above; for real emails configure `SMTP_*`
(e.g. a Gmail App Password, SendGrid, Mailgun, Postmark). Swap `server/db.js`
for Postgres if you want a managed database.

## ✦ Try it

1. **Sign Up**, then click the verification link (printed in the server console
   in dev). You're taken to the generator.
2. In **The Studio**, generate a map and press **Save** — find it under **Profile**.
3. Open **Storybook Mode**, add chapters, and mark a book **Finished**.
4. Sign up as `harshavardhangowda525@gmail.com` to access the **Admin Panel**.
