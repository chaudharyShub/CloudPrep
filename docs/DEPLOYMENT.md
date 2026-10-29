# Deployment

CloudPrep has two parts:

- **The app:** a static single-page app. `npm run build` produces plain HTML, CSS, JavaScript and fonts in `dist/`, hosted on Vercel and deployed automatically from `master`.
- **The backend:** a Supabase project (Postgres with Row Level Security, and Supabase Auth). The app calls it directly with the public (publishable) key. It holds the published questions and signed-in users' data (D-044 to D-047).

Without Supabase settings the app still builds and runs, for guests only, and says sign-in isn't set up.

## Environment variables

| Variable | Where | Notes |
|---|---|---|
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` | Vercel (Production and Preview) and `.env.local` | Public values, built into the app. Redeploy after changing them |
| `VITE_EMAIL_SIGN_IN=true` | Vercel (optional) | Shows email sign-in links. Only set it once custom SMTP is set up (see below) |
| `SUPABASE_URL`, `SUPABASE_SECRET_KEY` | `.env.local` only | Used by `npm run publish:questions`. The secret key bypasses Row Level Security: never commit it, never add it to Vercel, never give it a `VITE_` prefix |

Copy `.env.example` to `.env.local` (git-ignored) and fill it in from the Supabase dashboard (*Project Settings → API keys*).

## Vercel

The repository includes `vercel.json`:

| Setting | Value |
|---|---|
| Framework preset | Vite |
| Build command | `npm run build` (prepares the proctor files, type check, then `vite build`) |
| Output directory | `dist` |
| Node.js | 22 or newer (Vercel's default is fine) |
| Rewrites | Every path except `/assets/*` and Vercel's own `/_vercel/*` falls back to `/index.html`, so links like `/results/<id>/review` work when opened directly or refreshed |
| Headers | `/assets/*` files have content hashes in their names, so they are cached for a year (`immutable`) |

Vercel serves real files first, so `/favicon.svg`, the icons and the files in `/assets/` are never rewritten. A missing `/assets/` file returns a 404 instead of the HTML page.

### AI proctor files

`npm run build` (and `npm run dev`) first runs `scripts/setup-proctor-assets.mjs`. It copies the MediaPipe WebAssembly runtime from `node_modules` and downloads the two models, checked against pinned SHA-256 hashes, into `public/proctor/`. They end up in `dist/proctor/` (about 36 MB; a browser downloads about 25 MB of it). The first build therefore needs internet access. `public/proctor/` is git-ignored because it is recreated on every build. These files keep the default caching (revalidated on each visit), because their names don't change when MediaPipe is upgraded.

## First-time setup

### 1. Supabase project and database

1. Create a project at supabase.com and copy its URL and keys into `.env.local`.
2. **Link the project:** `npx supabase login`, then `npx supabase link --project-ref <project-ref>` (it asks for the database password).
3. **Create the tables:** `npm run db:push` applies `supabase/migrations/`.
4. **Publish the questions:** `npm run publish:questions -- --dry-run` to check, then `npm run publish:questions`, then `npm run check:published` to confirm the app receives exactly the repo's questions.
5. **Check:** in the dashboard's Table Editor, `exams` has one row (`clf-c02`, `is_published` true, `bank_version` set) and `questions` has every non-draft question.

Note: free-tier projects pause after about a week without activity; resume them from the dashboard.

### 2. Sign-in

1. **Redirect URLs** (Supabase: *Authentication → URL Configuration*): Site URL = your live URL (for example `https://<app>.vercel.app`). Redirect URLs: `https://<app>.vercel.app/**`, `http://localhost:5173/**` and `http://localhost:4173/**`. Add preview URLs too if you sign in on preview deployments.
2. **Google:** in Google Cloud Console create an OAuth client (*Web application*) with the authorised redirect URI `https://<project-ref>.supabase.co/auth/v1/callback`. Enter its client ID and secret in Supabase under *Authentication → Sign In / Providers → Google* and enable it. Publish the Google app (out of "Testing") so anyone can sign in.
3. **Email sign-in links (off by default):** the sign-in page shows only Google unless `VITE_EMAIL_SIGN_IN=true` is set. Supabase's built-in email only reaches your project team's addresses, a few per hour, so first set up custom SMTP under *Authentication → Emails → SMTP Settings* (for example Resend or Brevo, with a sender on a domain you own), then add the variable in Vercel and redeploy.

### Admin access (D-054)

The `/admin` page shows signed-in accounts and their activity, only to accounts listed in `public.admins`. After `npm run db:push` has created the table, sign in to the live site once with your Google account. Then put your email in `.env.local` (next to `SUPABASE_URL` and `SUPABASE_SECRET_KEY`; several emails can be comma-separated) and run `npm run admin:add` (D-055):

```
ADMIN_EMAIL=you@example.com
```

Don't add `ADMIN_EMAIL` to Vercel, and never as `VITE_ADMIN_EMAIL`: the app doesn't use it, and `VITE_` values end up in the public site. Or, without the script, run this in the Supabase *SQL Editor* (replace the email):

```sql
insert into public.admins (user_id)
select id from auth.users where email = 'you@example.com';
```

Reload the site: admins get an **Admin** link in the navigation, which opens `/admin`. To remove an admin: `delete from public.admins where user_id = (select id from auth.users where email = 'you@example.com');`. The table can't be read or changed from the app, only here.

### 3. Vercel project

1. Sign in at vercel.com, choose *Add New → Project*, and import the GitHub repository. Vercel reads `vercel.json`; leave the settings as detected.
2. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` under *Settings → Environment Variables* (Production and Preview). Never add the secret key.
3. Enable Web Analytics once (*Analytics → Enable*; see below).
4. Deploy, then run the smoke test below.

## Updating

- **App changes:** work on a branch, open a pull request and merge it into `master`. Vercel builds and deploys `master` automatically; pull requests get preview deployments.
- **Question changes:** bump `BANK_VERSION`, then run `npm run publish:questions` and `npm run check:published`. **The live site only shows published questions**, and visitors get the new set on their next visit (it's cached in their browser by version).
- **Database changes:** add a new migration in `supabase/migrations/` and run `npm run db:push` before deploying app code that needs it.
- **User data is kept:** signed-in users' data is in Supabase with a copy in the browser, and guests' data is in their browser. Every stored shape is versioned and migrated (see `src/storage/`).

A deployment renames the page files and removes the old ones. If someone has CloudPrep open during it, opening a page their tab hasn't loaded yet reloads the site once, briefly showing "CloudPrep was updated. Loading the latest version…" (D-053). If the page still can't load (for example offline), "Something went wrong" appears with a **Reload** button. No data is lost either way.

## Smoke test after each deployment

1. Open the site signed out: you land on the sign-in page, with no errors in the browser console. "Continue as a guest" opens Learning mode.
2. Open `<your-url>/practice` and `<your-url>/settings` directly in a new tab, then refresh. Both must load (this checks the route fallback).
3. Open `<your-url>/does-not-exist`. You should see CloudPrep's "Page not found" page, not a Vercel 404.
4. As a guest, start a short practice session and check an answer. Reload: progress is kept, and the Review due card in Learning mode shows when the question comes back.
5. Sign in with Google: you return to the page you came from and your account shows in the navigation. If you have guest data, you're asked once whether to add it.
6. Start a timed exam, answer a question, reload the page: the exam resumes with the timer still running. Submit it and open the results.
7. Open the site in another browser and sign in: the exam appears in Exam history.
8. In Settings, export your data. The file downloads.
9. Optional: in strict practice, allow fullscreen, then leave it. A warning appears.

## Web Analytics (D-048)

1. In the Vercel project, open *Analytics* and choose *Enable* (Web Analytics; the free tier is enough for personal use).
2. Deploy as usual. The app loads Vercel's script only in production builds.
3. **Check:** open the live site and visit a few pages, then look at *Analytics* in the Vercel dashboard; visits appear within a minute or so. Ad blockers can block the script, so test in a normal window without one. In the browser's network panel, `/_vercel/insights/script.js` should load with status 200.

## Link previews (D-050)

The preview image's address comes from Vercel's `VERCEL_PROJECT_PRODUCTION_URL` during the build, so nothing needs setting while *Settings → Environment Variables → Automatically expose System Environment Variables* is on (the default). **Check:** paste the live link into a chat app (WhatsApp, Slack) or a preview checker such as opengraph.xyz; it should show the CloudPrep image and title. Apps cache previews, so a link shared before a change may show the old one for a while.

## Other static hosts

Any static host works if it can serve `index.html` for unknown paths and set the two `VITE_SUPABASE_*` variables at build time. Web Analytics only works on Vercel.
- **Netlify:** build `npm run build`, publish `dist`, and add `public/_redirects` containing `/*  /index.html  200`.
- **Cloudflare Pages:** build `npm run build`, output `dist`. Single-page-app fallback is automatic when there is no `404.html`.
- **GitHub Pages:** it has no fallback, so deep links would 404. It would need a hash router (D-004 option B); that isn't set up.

The site must be served from the domain root (`/`). Serving it from a sub-path would need Vite's `base` option and the router's `basename`. Any new address also needs adding to Supabase's redirect URLs.

## Checks before publishing

```bash
npm run check      # type check, lint, format, question validation, unit tests, build, E2E
npm run preview    # inspect the production build at http://localhost:4173
```

What to expect in the production build (`dist/`):
- **Keys:** only the public Supabase URL and publishable key. The secret key is never read by app code.
- **Network:** the app talks to its own files, the Supabase project and, in production, Vercel Web Analytics. Links to AWS documentation open in a new tab.
- **No test code:** the fake sign-in used by E2E builds is removed from production builds (D-045), and the bundle contains no questions; they're downloaded from Supabase (D-046).
- **Paths:** asset paths are absolute (`/assets/...`), which is correct for a root-domain deployment.
