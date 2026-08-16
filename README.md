# MindMap — Turn Any Resource Into a Living Story

A premium, cinematic AI mind-map generator with the editorial sophistication of a
luxury brand. Paste notes, upload a document, or name a topic, and watch your
knowledge bloom into a beautiful, interactive mind map — then keep growing it
every day with **Storybook Mode**.

> Live, dependency-free, and fully offline-capable. Open `index.html` and go.

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
- **Storybook Mode** — a growing visual story. Each day's resource is intelligently
  merged into the existing map: connections are detected, new branches are created,
  related concepts merge, and new knowledge is highlighted in gold.
- **Knowledge Journey dashboard** — daily resource cards with date, AI summary,
  concepts added, connected topics, and a "View Mind Map" link.
- **Luxury motion** — magnetic buttons, custom cursor, scroll-triggered reveals,
  a scroll-driven text-fill "About" section, count-up stats, and parallax statements.
- **Fully responsive** and respects `prefers-reduced-motion`.

## ✦ The "AI" engine

The concept extraction runs **entirely in the browser** — no API keys, no network.
`js/generator.js` performs:

- Sentence segmentation and stop-word filtered keyword scoring (frequency +
  position + proper-noun weighting)
- Bigram / phrase detection for readable branch labels
- Heading detection (Markdown, numbered, ALL-CAPS, `Label:` lines)
- Example / definition cue detection
- Curated topic templates for common subjects, with a generic scaffold fallback
- A Storybook merge algorithm that scores label overlap to decide whether today's
  themes attach to an existing branch or spawn a new one

This keeps the experience instant and private. To wire in a real LLM later, replace
`MindGen.fromText` / `MindGen.fromTopic` with an API call that returns the same
`{ root, meta }` tree shape.

## ✦ Accounts & authentication

A full authentication system backs the app so users can save their maps to an
account and reach them from anywhere:

- **Sign Up** (name, email, password, confirm) and **Log In** pages.
- **Email verification** — on sign-up an account is created and a secure,
  expiring, single-use verification link is emailed. Until it's clicked, the
  account is unverified and account-only features are blocked. A "Verify Your
  Email" page shows the address and offers **Resend Verification Email**.
- **Forgot / reset password** with expiring single-use links.
- Nav shows **Log In / Sign Up** when signed out, and the user's profile chip
  plus **Log Out** when signed in.
- **Saved mind maps** live on the account — press **Save** in the Studio, then
  find them under **Your Account → Your saved mind maps** and reopen them any time.

**Security:** passwords are hashed with bcrypt (never stored in plain text),
sessions are stateless JWTs in `httpOnly`, `SameSite`, `Secure` cookies,
authenticated routes are guarded, verification/reset tokens are random and
stored only as SHA-256 hashes, and the auth surface is rate-limited. No secret
is ever hard-coded — everything comes from environment variables.

## ✦ Structure

```
index.html            Page markup (site + auth pages), SPA router shell
css/styles.css        Luxury editorial design system (dark charcoal + gold)
js/generator.js       Client-side content-analysis engine → mind-map tree
js/mindmap.js         Interactive SVG renderer (layouts, zoom, pan, drag, export)
js/storybook.js       Curated daily resources for the example Storybook
js/main.js            Orchestration: animations, canvases, page router, wiring
js/auth.js            Frontend auth client + login/signup/verify/account UI
server/index.js       Express app: security headers, static frontend, API mount
server/config.js      All configuration from environment variables
server/db.js          SQLite schema (users, tokens, maps) — swappable
server/tokens.js      Secure, expiring, single-use email/reset tokens
server/mailer.js      SMTP email service (dev mode logs links to the console)
server/middleware.js  Session parsing + requireAuth / requireVerified guards
server/routes/auth.js Signup, login, verify, resend, forgot/reset, logout, me
server/routes/maps.js Per-user saved mind maps (CRUD, protected)
```

## ✦ Run it

The frontend is static, but accounts need the backend. The Express server serves
**both** the site and the API from one origin:

```bash
npm install
cp .env.example .env          # then edit values (at minimum set JWT_SECRET)
npm start                     # → http://localhost:3000
```

In development you don't need a mail server: verification/reset emails are printed
to the server console (and the link is surfaced on the page) so you can test the
whole flow locally.

> Want just the static site (no accounts)? You can still open it via any static
> host — the mind-map generator and Storybook work without a backend; only the
> account features need the server.

### Configuration (environment variables)

Copy `.env.example` and set:

| Variable | Purpose |
| --- | --- |
| `APP_URL` | Public base URL, used in email links |
| `JWT_SECRET` | Signing secret for session tokens (**required in prod**) |
| `SESSION_COOKIE_NAME`, `JWT_EXPIRES_IN`, `BCRYPT_ROUNDS` | Auth tuning |
| `DATABASE_FILE` | SQLite path (swap `server/db.js` for Postgres if desired) |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_SECURE` / `SMTP_USER` / `SMTP_PASS` | Email service |
| `EMAIL_FROM` | Verification email sender address |
| `EMAIL_VERIFICATION_EXPIRES_MIN`, `PASSWORD_RESET_EXPIRES_MIN` | Token lifetimes |

If the site is hosted separately from the API, set `window.MINDMAP_API_BASE`
to the backend URL before `js/auth.js` loads.

## ✦ Try it

1. Go to **The Studio**, click **Load a sample resource**, then **Generate Mind Map**.
2. Drag nodes, use the **+ / −** badges to collapse branches, scroll to zoom.
3. Cycle **Layout**, then **Export** your map as a PNG.
4. Scroll to **Storybook Mode** and add chapters to grow a living story.
5. **Sign Up**, click the verification link (printed in the server console in dev),
   generate a map, press **Save**, and find it under **Your Account**.
