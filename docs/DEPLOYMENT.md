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
