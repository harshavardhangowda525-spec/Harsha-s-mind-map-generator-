# Turn on accounts (Supabase) — no server needed

Sign-up, login, **real email verification**, password reset, and saved mind
maps all run from your static site using [Supabase](https://supabase.com) (free).
There is **no server to deploy or keep alive**. One-time setup, ~5 minutes:

## 1. Create a free Supabase project
1. Go to **https://supabase.com** → **Start your project** → sign in (GitHub works).
2. **New project** → give it a name, set a database password (save it), pick a
   region → **Create new project**. Wait ~2 minutes for it to finish.

## 2. Copy your two keys
1. In the project, open **Project Settings** (gear icon) → **API**.
2. Copy **Project URL** and the **anon public** key.
   (The anon key is safe to expose in frontend code.)

## 3. Paste the keys into the app
Open **`js/config.js`**, fill in both values, then commit & push:
```js
window.MINDMAP_CONFIG = {
  SUPABASE_URL: 'https://YOURPROJECT.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOi...your-anon-key...'
};
```

## 4. Create the "maps" table (for saved mind maps)
In Supabase: **SQL Editor** → **New query** → paste this → **Run**:
```sql
create table if not exists public.maps (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title      text not null default 'Untitled map',
  data       jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.maps enable row level security;

create policy "maps_select_own" on public.maps for select using (auth.uid() = user_id);
create policy "maps_insert_own" on public.maps for insert with check (auth.uid() = user_id);
create policy "maps_update_own" on public.maps for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "maps_delete_own" on public.maps for delete using (auth.uid() = user_id);
```
Row Level Security ensures each user can only ever see their own maps.

## 5. Allow your website URL
In Supabase: **Authentication** → **URL Configuration**:
- **Site URL** → the address where your site is hosted, e.g.
  `https://YOURNAME.github.io/harsha-s-mind-map-generator-/`
- **Redirect URLs** → add that same URL.
- **Save**.

Email confirmation is already on by default
(**Authentication → Providers → Email → "Confirm email"**). Leave it on.

## 6. Done
Open your site → **Sign Up** → check your email inbox → click the verification
link → you're logged in. Generate a map, press **Save**, and find it under
**Your Account → Your saved mind maps**.

---

### Notes
- **Hosting the site:** any static host works (GitHub Pages, Netlify, Cloudflare
  Pages, …). Use whatever URL you open it at as the Site URL in step 5.
- **Free email limits:** Supabase's built-in email sender is rate-limited (a few
  messages/hour) and can land in spam. For production, add your own SMTP under
  **Project Settings → Authentication → SMTP Settings** (e.g. a Gmail App
  Password, SendGrid, Resend, Postmark…).
- **Nothing to run:** you never start a server. The `server/` folder in this repo
  is an optional self-hosted alternative and is not needed for this setup.
