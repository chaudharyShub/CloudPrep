# CloudPrep

An unofficial practice simulator for the **AWS Certified Cloud Practitioner (CLF-C02)** exam. Use Learning mode as a guest, or sign in with Google to take timed mock exams and keep your progress in sync across devices.

> CloudPrep is not affiliated with or endorsed by Amazon Web Services. Practice scores don't predict or guarantee an official result.

## What it does

- **Learning mode:** untimed practice by domain or topic, with instant feedback, an explanation for every option, and links to the AWS documentation each question is based on. You can bookmark questions, and **Review due** brings questions back on a schedule (1, 3, 7, 21, then 60 days) so missed ones come up again before you forget them.
- **Timed mock exam:** a 65-question / 90-minute exam that follows the CLF-C02 domain weightings, with flagging, a question grid, final review and automatic submission when time runs out.
- **Results:** a practice score, per-domain breakdown, answer review with explanations, exam history, and progress guidance across attempts.
- **Accounts and sync:** sign in with Google (email sign-in links can be switched on once custom email is set up). Signed-in users' progress, bookmarks, exam history, the exam in progress and settings are saved to their account and follow them to every device. The app keeps a copy in the browser, so it stays fast and works offline; changes are sent when you're back online. Progress made before signing in is added to the account only if you choose to.
- **Guests:** Learning mode, bookmarks and settings work without an account, saved in the browser only. The dashboard, mock exams, history and progress need sign-in.
- **Your data:** settings (theme, motion, benchmark, warnings), export/import to a file, automatic backups before risky changes, and separate "clear" actions. Signed in, clearing applies to the account on every device.
- **Optional practice integrity:** a strict mode that asks for fullscreen and logs tab and focus changes, without judging them.
- **AI-proctored exams (opt-in):** a check-in like an online proctored exam, then a strict AI proctor that runs on your device (MediaPipe face and object models plus microphone loudness). It watches your face, head, eyes and mouth, looks for phones, other people, books and screens, and blocks shortcuts. Two warnings, then the exam ends; a phone or another person ends it at once. Nothing is recorded or uploaded.
- **Admin page:** an `/admin` page lists every signed-in account with its activity (questions answered, sessions, exams, best score) and totals. Only accounts marked as admins in the database get any data; everyone else sees "No admin access". Admins get an **Admin** link in the navigation; nobody else sees it. Guests aren't recorded there.
- **Installable look:** CloudPrep has its own logo, home-screen icons ("Add to Home Screen") and a link preview with an image and description when the site is shared.

The bank has **2,000 original questions** (400 / 600 / 753 / 247 across the four domains), written from public AWS documentation and the official exam guide. 1,995 are `checked` against the AWS pages they cite and 5 are still `unverified` (see [docs/CONTENT_REVIEW.md](docs/CONTENT_REVIEW.md)); none has had a second, human sign-off (`approved`) yet. Read [docs/KNOWN_LIMITATIONS.md](docs/KNOWN_LIMITATIONS.md) before relying on it.

**Privacy in short:** accounts and synced data are stored with Supabase, and each user can read only their own data; the admin page shows the site owner a list of accounts with activity totals (never answers). The live site counts page views with Vercel Web Analytics (no cookies, no personal data). Details are on the in-app Privacy page.

## Tech stack

- **App:** React 19, TypeScript (strict), Vite 8, Tailwind CSS 4, React Router 8, lucide-react icons and the Inter font. A static single-page app hosted on Vercel.
- **Backend:** [Supabase](https://supabase.com) only: Postgres with Row Level Security, and Supabase Auth (Google). The app calls it directly with the public (publishable) key; there is no separate API server.
- **Data:** questions are published from this repo to the database and loaded at runtime, then cached in IndexedDB. User data goes through a versioned storage layer (`src/storage/`) in `localStorage` and, for signed-in users, is synced to Supabase.
- **Tests:** Vitest with Testing Library (including the database schema and security rules run in PGlite), and Playwright with axe for end-to-end and accessibility checks.

## Getting started

Requires **Node.js 22 or newer** (`.nvmrc` pins 24) and npm.

```bash
npm install
npm run dev            # http://localhost:5173
```

The first `npm run dev` or `npm run build` also prepares the AI proctor's files in `public/proctor/`, downloading two MediaPipe models once.

**Without Supabase settings**, the dev server uses the questions bundled in the repo and runs in guest mode (sign-in shows as not set up). To use your own Supabase project, copy `.env.example` to `.env.local` and fill it in:

| Variable                                             | Used by                     | Notes                                                                               |
| ---------------------------------------------------- | --------------------------- | ----------------------------------------------------------------------------------- |
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` | The app                     | Public values, safe in the browser                                                  |
| `SUPABASE_URL`, `SUPABASE_SECRET_KEY`                | `npm run publish:questions` | The secret key bypasses security rules: never commit it or give it a `VITE_` prefix |
| `VITE_EMAIL_SIGN_IN=true`                            | The app (optional)          | Shows email sign-in links; only once custom SMTP is set up in Supabase              |

Setting up the database, Google sign-in and redirect URLs is covered step by step in [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Commands

| Command                           | What it does                                                                                                |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `npm run dev`                     | Development server with hot reload                                                                          |
| `npm run build`                   | Type-checks and builds the production site into `dist/`                                                     |
| `npm run preview`                 | Serves the production build at http://localhost:4173                                                        |
| `npm run typecheck`               | TypeScript checks                                                                                           |
| `npm run lint`                    | ESLint (zero warnings allowed)                                                                              |
| `npm run format` / `format:check` | Prettier                                                                                                    |
| `npm test`                        | Unit and component tests (Vitest), including question-bank validation and database schema checks            |
| `npm run test:watch`              | Unit and component tests in watch mode                                                                      |
| `npm run test:coverage`           | Unit and component tests with a coverage report (no minimum is enforced)                                    |
| `npm run test:e2e`                | End-to-end tests in Chromium, WebKit and a phone viewport (Playwright), against a build with a fake sign-in |
| `npm run validate:questions`      | Validates the question bank and prints a coverage report                                                    |
| `npm run check`                   | Everything above, in order. This must pass before a change is merged                                        |
| `npm run publish:questions`       | Publishes the question bank to Supabase (`-- --dry-run` to only validate and count)                         |
| `npm run check:published`         | Confirms the published questions match the repo                                                             |
| `npm run admin:add`               | Makes the account(s) in `ADMIN_EMAIL` (`.env.local`) admins; each must have signed in once                  |
| `npm run db:push`                 | Applies `supabase/migrations/` to the linked Supabase project (run `supabase link` first)                   |
| `npm run setup:proctor`           | Prepares the AI proctor's files in `public/proctor/` (also runs before `dev` and `build`)                   |
| `npm run brand:assets`            | Redraws the PNG app icons and link-preview image from the logo                                              |

First-time setup for end-to-end tests: `npx playwright install chromium webkit`.

**Tip:** `npm run check` runs many tests in parallel. Close other heavy programs (other dev servers, builds) while it runs, or tests may time out.

## Deployment

CloudPrep is a static site on Vercel, deployed automatically from `master`. `vercel.json` sets the build (`npm run build`), the output (`dist`), a fallback to `index.html` so deep links work, and asset caching. Vercel needs `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`; Web Analytics has to be enabled once in the Vercel project (Analytics → Enable). Supabase setup, Google sign-in, analytics and link-preview checks are in [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Updating the question bank

Questions live in `src/content/questions/`: one file per domain (`d<n>-*.ts`) and the larger set in `batches/`, written as compact specs (`author.ts`) with references from `refs.ts`. Each question needs:

- A stable ID such as `clf-d3-0012`. IDs are never reused.
- Four options for single answer, or five or more with at least two correct for multiple response. No "all/none of the above".
- An explanation for every option, correct ones included, and an overall explanation.
- At least one https AWS reference.
- A review status: `draft` → `unverified` (written, not yet re-checked) → `checked` → `approved` (human sign-off) → `retired`.

After editing:

1. Bump `BANK_VERSION` in `src/content/questions/index.ts`.
2. Run `npm run validate:questions` and `node scripts/check-duplicates.mjs 0.3`, and fix what they report.
3. Run `npm run check`.
4. Publish: `npm run publish:questions`, then `npm run check:published`. **The live app only sees published questions**; visitors get the new set on their next visit.

Saved attempts keep the exact wording you answered (question archive), so editing a question never rewrites history. If a question changes in substance, increase its `revision`. Full rules are in `CLAUDE.md`, and the review checklist is in `docs/CONTENT_REVIEW.md`.

## Documentation

- `docs/PRODUCT_SPEC.md`: what CloudPrep does and why
- `docs/ARCHITECTURE.md`: code structure, storage, backend and routing
- `docs/IMPLEMENTATION_PLAN.md`: phases, progress and acceptance criteria
- `docs/DECISIONS.md`: decision log
- `docs/TEST_PLAN.md`: test strategy
- `docs/DEPLOYMENT.md`: Vercel and Supabase setup
- `docs/KNOWN_LIMITATIONS.md`: what it can't do
- `docs/CONTENT_REVIEW.md`: question review checklist
