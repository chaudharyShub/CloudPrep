# Deployment

CloudPrep is a static single-page app: `npm run build` produces plain HTML, CSS, JavaScript and fonts in `dist/`. There is no server, database, API key or environment variable to configure.

## Vercel (recommended)

The repository includes `vercel.json`:

| Setting | Value |
|---|---|
| Framework preset | Vite |
| Build command | `npm run build` (type check, then `vite build`) |
| Output directory | `dist` |
| Node.js | 22 or newer (Vercel's default is fine) |
| Rewrites | Every path except `/assets/*` falls back to `/index.html`, so links like `/results/<id>/review` work when opened directly or refreshed |
| Headers | `/assets/*` files have content hashes in their names, so they are cached for a year (`immutable`) |

Vercel serves real files first, so `/favicon.svg` and the files in `/assets/` are never rewritten. A missing `/assets/` file returns a 404 instead of the HTML page.

### AI proctor files

`npm run build` (and `npm run dev`) first runs `scripts/setup-proctor-assets.mjs`. It copies the MediaPipe WebAssembly runtime from `node_modules` and downloads the two models, checked against pinned SHA-256 hashes, into `public/proctor/`. They end up in `dist/proctor/` (about 36 MB; a browser downloads about 25 MB of it). The first build therefore needs internet access to download the models. `public/proctor/` is git-ignored because it is recreated on every build. These files keep the default caching (revalidated on each visit), because their names don't change when MediaPipe is upgraded.

### Steps you need to do

1. **Put the code in a Git repository.** This folder isn't one yet:
   ```bash
   git init
   git add .
   git commit -m "CloudPrep"
   ```
   Then push it to a new GitHub, GitLab or Bitbucket repository. `.gitignore` already excludes `node_modules/`, `dist/`, test output and `.env` files.
2. **Import the project in Vercel.** Sign in at vercel.com, choose *Add New → Project*, and select the repository. Vercel reads `vercel.json`; leave the settings as detected. No environment variables are needed.
3. **Deploy**, then open the URL Vercel gives you and run the smoke test below.

Alternative without Git: install the Vercel CLI (`npm i -g vercel`), run `vercel` in this folder to create a preview deployment, then `vercel --prod`.

### Smoke test after each deployment

1. Open the site: the dashboard loads, with no errors in the browser console.
2. Open `<your-url>/exam` and `<your-url>/settings` directly in a new tab, then refresh. Both must load (this checks the route fallback).
3. Open `<your-url>/does-not-exist`. You should see CloudPrep's "Page not found" page, not a Vercel 404.
4. Start a short practice session and check an answer. Reload: progress is kept.
5. Start a timed exam, answer a question, reload the page: the exam resumes with the timer still running. Submit it and open the results.
6. In Settings, export your data. The file downloads.
7. Optional: in strict mode, allow fullscreen, then leave it. A warning appears.

### Updating

Push to the repository's main branch; Vercel rebuilds and deploys automatically. Users keep their data because it lives in their own browser, and storage formats are versioned and migrated (see `src/storage/`).

If someone has CloudPrep open during a deployment, opening a page that hasn't loaded yet may show "Something went wrong". **Reload** fixes it, and no data is lost.

## Supabase (backend, D-044)

The app uses Supabase for sign-in (D-045) and loads its questions from there (D-046); progress moves there in a later step. **The live site only shows published questions**, so publish after every question change. To set up the database:

1. **Keys:** copy `.env.example` to `.env.local` and fill in the project URL and keys from the Supabase dashboard (*Project Settings → API keys*). `.env.local` is git-ignored. Never commit the secret key or give it a `VITE_` prefix.
2. **Link the project:** `npx supabase login`, then `npx supabase link --project-ref <project-ref>` (it asks for the database password).
3. **Create the tables:** `npm run db:push` applies `supabase/migrations/`.
4. **Publish the questions:** `npm run publish:questions -- --dry-run` to check, then `npm run publish:questions`. Run it again whenever questions change (after bumping `BANK_VERSION`), then `npm run check:published` to confirm the app receives exactly the repo's questions. Visitors get the new set on their next visit.
5. **Check:** in the dashboard's Table Editor, `exams` has one row (`clf-c02`, `is_published` true, `bank_version` set) and `questions` has every non-draft question.

### Sign-in setup

1. **Vercel environment variables** (*Settings → Environment Variables*, Production and Preview): `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. They're built into the app, so **redeploy** after adding or changing them. Never add the secret key. Without them the site still works for guests and says sign-in isn't set up.
2. **Redirect URLs** (Supabase: *Authentication → URL Configuration*): Site URL = your live URL (e.g. `https://<app>.vercel.app`). Redirect URLs: `https://<app>.vercel.app/**`, `http://localhost:5173/**` and `http://localhost:4173/**`. Add preview URLs too if you sign in on preview deployments.
3. **Google** (optional): in Google Cloud Console create an OAuth client (*Web application*) with the authorised redirect URI `https://<project-ref>.supabase.co/auth/v1/callback`. Enter its client ID and secret in Supabase under *Authentication → Sign In / Providers → Google* and enable it.
4. **Email for magic links (off by default):** the sign-in page shows only Google unless `VITE_EMAIL_SIGN_IN=true` is set in Vercel. Supabase's built-in email only reaches your project team's addresses, a few per hour, so first set up custom SMTP under *Authentication → Emails → SMTP Settings* (for example Resend or Brevo with a sender on a domain you own), then add the variable and redeploy.
5. **Check:** on the live site, sign in with Google and with an email link; you return to the page you came from, and your name or email shows in the navigation.

Note: free-tier projects pause after about a week without activity; resume them from the dashboard.

### Web Analytics (D-048)

1. In the Vercel project, open *Analytics* and choose *Enable* (Web Analytics; the free tier is enough for personal use).
2. Deploy as usual (merge the PR). The app loads Vercel's script only in production builds.
3. **Check:** open the live site and visit a few pages, then look at *Analytics* in the Vercel dashboard; visits appear within a minute or so. Ad blockers can block the script, so test in a normal window without one. In the browser's network panel, `/_vercel/insights/script.js` should load with status 200.

### Link previews (D-050)

The preview image's address comes from Vercel's `VERCEL_PROJECT_PRODUCTION_URL` during the build, so nothing needs setting while *Settings → Environment Variables → Automatically expose System Environment Variables* is on (the default). **Check:** paste the live link into a chat app (WhatsApp, Slack) or a preview checker such as opengraph.xyz; it should show the CloudPrep image and title. Apps cache previews, so a link shared before the change may show the old one for a while.

## Other static hosts

Any static host works if it can serve `index.html` for unknown paths:
- **Netlify:** build `npm run build`, publish `dist`, and add `public/_redirects` containing `/*  /index.html  200`.
- **Cloudflare Pages:** build `npm run build`, output `dist`. Single-page-app fallback is automatic when there is no `404.html`.
- **GitHub Pages:** it has no fallback, so deep links would 404. It would need a hash router (D-004 option B); that isn't set up.

The site must be served from the domain root (`/`). Serving it from a sub-path would need Vite's `base` option and the router's `basename`.

## Checks before publishing

```bash
npm run check      # type check, lint, format, question validation, unit tests, build, E2E
npm run preview    # inspect the production build at http://localhost:4173
```

What the production build was checked for:
- No local development URLs. The only `localhost` strings are React Router's internal placeholder base URLs.
- No API keys or secrets: the app uses none.
- No backend calls: the app makes no network requests apart from its own files. Links to AWS documentation open in a new tab.
- Asset paths are absolute (`/assets/...`), which is correct for a root-domain deployment.
