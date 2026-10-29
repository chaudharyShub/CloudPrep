# CLAUDE.md — CloudPrep

CloudPrep is an unofficial AWS Certified Cloud Practitioner (CLF-C02) exam simulator. It is built with React + TypeScript (strict) + Vite + Tailwind v4 + React Router. It is moving to a Supabase backend (D-044). Sign-in works (D-045), questions load from the database (D-046), and signed-in users' data syncs to it from a local copy (D-047); guests keep using localStorage. It is a public product (non-commercial, on the owner's resume): a static site with a landing page for guests, not only a tool for friends; weigh product quality (first impressions, accessibility, scale, reliability) in suggestions.

**Read first:** `docs/PRODUCT_SPEC.md`, `docs/ARCHITECTURE.md`, `docs/IMPLEMENTATION_PLAN.md`, `docs/TEST_PLAN.md`, `docs/DECISIONS.md`.

## Current status

All user phases are built: Phases 1–6, the QA pass, release preparation (static deployment on Vercel), Phase 7 (AI proctoring) and steps 1–4 of Phase 8 (Supabase backend, D-044: schema, RLS, publish script; D-045: sign-in; D-046: questions from the database; D-047: progress in the database), plus analytics (D-048), the logo (D-050), the Review due schedule (D-052, spaced repetition in Learning mode), the admin page (D-054, `/admin`), the UI redesign with a landing page (D-057, 3.0.0) and a full review of the question bank (1,995 `checked`, 5 `unverified`; `docs/CONTENT_REVIEW.md`). The app version is in `package.json` (2.0.0 = the Supabase backend; 2.1.0 = Review due; 2.1.1 = reload once after a deploy, D-053; 2.2.0 = admin page, D-054; 2.3.0 = Admin link and `admin:add`, D-055; 2.4.0 = developer credit, D-056; 3.0.0 = UI redesign and landing page, D-057; 3.0.1 = headline highlight on the landing page, light default theme). See the Progress table in IMPLEMENTATION_PLAN.md. **Don't add new features without first discussing their value with the user.** **UI redesign (D-057):** merged into `master` (PR #15) and live; the old UI is kept on `archive/ui-v2` and tag `v2.4.0` (never delete or change them). See the redesign section in IMPLEMENTATION_PLAN.md. Deployment: `docs/DEPLOYMENT.md`. Limitations: `docs/KNOWN_LIMITATIONS.md`.

## Commands

```
npm run dev                 # local dev server
npm run build / preview     # production build / serve it
npm run typecheck           # tsc -b (type check only; the tsconfigs set noEmit)
npm run lint                # eslint
npm test                    # vitest (unit + component + question-bank validation)
npm run test:e2e            # playwright (builds dist-e2e/ via build:e2e, with a fake sign-in)
npm run validate:questions  # validate the question bank + coverage report
npm run publish:questions   # publish the bank to Supabase (-- --dry-run to only validate/count)
npm run check:published     # check the published bank matches the repo (public key)
npm run admin:add           # make the accounts in ADMIN_EMAIL (.env.local) admins (secret key)
npm run db:push             # apply supabase/migrations to the linked project (supabase link first)
npm run check               # typecheck, lint, format, validate, test, build, e2e — must pass

# First-time E2E setup: npx playwright install chromium webkit
```

Deployment: static build in `dist/`; Vercel Web Analytics is mounted in `src/main.tsx` for production builds only (D-048); `vercel.json` sets the build, output, SPA fallback (everything except `/assets/*` and Vercel's `/_vercel/*`) and asset caching. `index.html` has a tiny inline script that applies the saved theme before first paint (no saved choice = Light, the default). Keep it in sync with `src/lib/theme.ts`, `DEFAULT_PREFERENCES` and the preferences storage key.

## Hard rules

- **Backend = Supabase only** (D-044): Postgres + Auth + RLS, called directly from the app with the publishable key. **No** separate API server, SSR, paid AI APIs, global state library or UI component library. Edge Functions only when server code is required.
- **The secret (service-role) key** is used only by scripts (`.env.local`), never with a `VITE_` prefix and never in app code.
- **No `any`** unless justified in a comment next to it. Strict TS flags stay on.
- **Layering:** `src/domain/` is pure TS with no React, no storage and no `features/` imports. Components never touch `localStorage`; use `src/storage/` repositories and hooks in `src/state/`.
- **Exam integrity in the UI:** Exam Mode components receive question views **without** correct answers or explanations. Never pass the full `Question` into exam-mode rendering.
- **Time:** exam time is always calculated from `endsAt - Date.now()`. Intervals only trigger re-renders.
- **Randomness:** always use the seeded PRNG in `src/domain/lib/random.ts`, never `Math.random()` in domain code.
- **Persistence:** every persisted shape has a versioned envelope, a hand-written parser (D-005) and a migration path. Never overwrite a value you failed to parse without making a backup copy first.
- **Native elements first:** radio/checkbox inputs, `<dialog>`, `<button>`, `<a>`. Every interactive element needs a visible focus style and an accessible name.
- **Design system:** use tokens from `src/styles/index.css` and primitives from `src/components/ui/`. No one-off colours, radii or shadows in feature code. The look is "study notes in aubergine" (D-057): rounded cards, pill buttons, Newsreader (`font-serif`) for titles, Source Sans 3 for text, IBM Plex Mono (`font-mono`) for numbers and the exam answer sheet, which keeps square cells. Use `accent` for readable text/links/borders, `highlight` + `on-highlight` for selected/active backgrounds, `primary` for main buttons, `meter` for progress fills, `flag` for flagged questions. `src/styles/tokens.test.ts` checks contrast; run it after changing a colour. Motion stays light and only on the landing page (`animate-rise`, `hover-lift`, `useReveal`); anything that moves must stop under reduced motion, and E2E axe scans wait for animations to finish.
- **Brand (D-050, D-057):** the logo is `LogoMark`/`LogoTile` (`src/components/brand/`), an aubergine tile. Page titles and navigation have no icons since D-057 (the old `PAGE_ICONS` were removed). The logo's shapes live in `src/components/brand/logoPaths.ts`; after changing them or the brand colours, update `public/favicon.svg` and `scripts/generate-brand-assets.mjs`, then run `npm run brand:assets` to redraw the PNG icons and link preview.

## Question content rules

- Original questions only, written from public AWS docs and the CLF-C02 exam guide. Never use real, leaked or "dump" questions.
- Use the **current** AWS service names from the exam guide (for example, Business Support+, Unified Operations, SageMaker AI, Quick Sight).
- Each question: stable never-reused ID (`clf-d<n>-<nnnn>`), at least one https AWS reference, an overall explanation, and an explanation for every incorrect option.
- Single answer = exactly 4 options; multiple response = 5 or more options with 2 or more correct. No "all/none of the above".
- Review statuses: `draft` → `unverified` (written from the cited pages, not yet re-checked; D-041) → `checked` (verified against the cited AWS pages) → `approved` (human sign-off) → `retired` (ID never reused). Only the user may set `approved`. Learning and Exam modes show `unverified`, `checked` and `approved`.
- Every option needs an explanation, correct ones included (D-022). Questions live in `src/content/questions/d<n>-*.ts` and `src/content/questions/batches/*.ts` (compact specs via `author.ts`, references from `refs.ts`); bump `BANK_VERSION` when they change, then publish them (`npm run publish:questions`): the live app only sees published questions. Run `node scripts/check-duplicates.mjs 0.3` after adding questions. When the bank size changes, also update `BANK_SIZE` in `src/features/landing/LandingPage.tsx` (the landing page's metrics strip).
- Note AWS's 2026–27 Support plan changes (Developer, Business and Enterprise On-Ramp end on 1 January 2027).
- Never import scraped, dump or paid question sets (D-042). New questions must be original and marked `unverified` until checked.

## Definition of done (every change: feature, fix or content)

1. The phase's acceptance criteria in IMPLEMENTATION_PLAN.md are met, with `AC-x.y` tagged in test names.
2. `npm run check` passes. Report the commands you ran and their results, including any failures.
3. Separate "implemented" from "verified" in the report. Never claim something works without running it.
4. Never skip, delete or loosen a test to get a green build.
5. Update `docs/DECISIONS.md` if a decision was made or changed.
6. **Update the docs in the same branch as the change.** The user asked for this on 2026-10-26. Check each document below and update every one the change affects, then say in the report which ones you updated and which needed nothing:

| Change                                     | Update                                                                                                                                                                                              |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Any change                                 | `docs/IMPLEMENTATION_PLAN.md` (Progress row, and a section with acceptance criteria for a feature or fix); `docs/DECISIONS.md` (new `D-0nn` entry and index row)                                    |
| What users see or can do                   | `docs/PRODUCT_SPEC.md` (features, pages, §4.3 "Not built"); `README.md` ("What it does"); `docs/KNOWN_LIMITATIONS.md` (new limits, or ones removed); the in-app Privacy page if stored data changes |
| Code structure, storage, routes, backend   | `docs/ARCHITECTURE.md` (folder map, routes, data models, storage keys and versions, backend, error handling)                                                                                        |
| Tests                                      | `docs/TEST_PLAN.md` (spec list, `AC-` tag prefixes)                                                                                                                                                 |
| Deploying, environment variables, database | `docs/DEPLOYMENT.md`; `.env.example`; README commands                                                                                                                                               |
| Questions                                  | `docs/CONTENT_REVIEW.md`; the bank numbers in README and KNOWN_LIMITATIONS                                                                                                                          |
| Version                                    | `package.json` and `package-lock.json` (patch for a fix, minor for a feature); the version in the status lines of PRODUCT_SPEC, ARCHITECTURE and TEST_PLAN, and in this file                        |
| Workflow, rules, commands, gotchas         | this file (`CLAUDE.md`)                                                                                                                                                                             |

7. **After the user merges and it's deployed**, update the status text that changes with it: the IMPLEMENTATION_PLAN Progress row ("Done, merged and live"), and any note such as "needs the migration before deploying". Put this on a small docs branch for the user to merge.

## Exam engine

- Pure logic in `src/domain/exam/`: `blueprint` (allocation), `select` (question choice), `session` (state machine reducer), `timer`, `attempt` (build + score).
- Exam state lives in the store (`activeExam`) and is saved on every action via `store.dispatchExam`. Submit only through `useExamActions().submit`, which is idempotent.
- Exam UI receives `ExamQuestionView` (no correct answers or explanations). `OptionList` takes `type` + `options`, never a whole `Question`.
- `ExamWatcher` (root layout) auto-submits expired exams on any page. `ExamLayout` redirects to results once the exam is recorded.

## Backend (Supabase)

- `supabase/migrations/` is the schema; add a new timestamped migration for every change, never edit an applied one. After adding one, delete `node_modules/.vitest-cache` before running tests (Vitest caches the `import.meta.glob` file list, D-052), and apply it with `npm run db:push` before deploying app code that uses it. Every table has RLS; user tables limit rows to `auth.uid()`; content is written only by `publish:questions`.
- Questions are authored in the repo and published; never edit them in the database. **The app loads them at runtime** (D-046): use `useQuestionBank()` / `usePracticeQuestions()` / `useExamQuestions()` on pages under `RequireQuestions`; never import `@/content/*` in app code (lint enforces it). After changing questions: bump `BANK_VERSION`, `npm run publish:questions`, `npm run check:published`. Answers live in `question_keys`, apart from `questions`, so they can be locked for server scoring.
- Every table carries `exam_id` for future exams; the app is still CLF-C02 only (`EXAM_ID`).
- Sign-in (D-045): the app uses `AuthClient` (`src/backend/auth.ts`) through `useAuth()` from `src/state/AuthProvider.tsx`; never import `@supabase/supabase-js` in features. Signed-in-only routes sit under `RequireAuth` in `src/app/routes.tsx`; guests keep Learning mode, bookmarks, settings and privacy. Redirect targets go through `safeNextPath`. Email sign-in shows only when `VITE_EMAIL_SIGN_IN=true` (off until custom SMTP is set up); Google is always on.
- Tests: `renderApp(path, { auth })` is signed in by default (pass `createFakeAuthClient()` for a guest). E2E specs import `test`/`expect` from `tests/e2e/support/fixtures.ts` (signed in by default; `test.use({ signedIn: false })` for guests).
- Admin (D-054): `/admin` gets data only from `admin_user_overview()`, which checks `public.admins` in the database; never decide admin access in app code, and never add a client-side password or a `VITE_` admin email. `useIsAdmin()` (asks `is_admin()`) only shows or hides the Admin nav link (D-055). Add an admin with `npm run admin:add` (`ADMIN_EMAIL` in `.env.local`) or the SQL editor (`docs/DEPLOYMENT.md`). Tests pass `admin: createFakeAdminClient({ admin: true, users })` to `renderApp`; E2E sets `window.__cloudprepE2EAdmin` to rows.
- Row types and mappers: `src/backend/`. `src/backend/schema.test.ts` checks the migrations in PGlite; extend it with every schema change.

## Storage

- All persistence goes through `src/storage/`: one store (`store.ts`), one area definition per key, and `decodeArea` (version check, migrations, parse), used by both storage and imports.
- Never write question text into attempts; use the question archive (D-031).
- Settings: read `data.preferences` (effective values) and write with `store.setPreferences`. Defaults live in `DEFAULT_PREFERENCES` (D-034).
- Record parsers must skip unsafe keys (`isSafeKey`).
- Two stores share localStorage (D-047): guest data under `cloudprep:`, the signed-in account's copy under `cloudprep-account:` (owner record, removed on sign-out once synced). `UserDataProvider` swaps the store behind `useAppStore()`; keep using it. Every change made through a store method is synced by `src/storage/sync.ts`; data from the server goes through `applyRemote` and the same parsers. A new synced area needs entries in `SYNCED_AREAS`/`ITEMS` (sync.ts), mappers in `src/backend/userRows.ts`, push/pull in `userDataRemote.ts`, and a schema test.
- Tests: `renderApp` uses one store for guests and accounts; pass `accounts` (`createAccountManager` with `createFakeUserTables`) to test sync or guest data. E2E specs that seed storage while signed in use `cloudprep-account:` keys; `test.use({ sync: true })` adds a fake server.

## Practice integrity

- Monitoring is opt-in. Strict practice (`focus`) lives in `src/features/exam/integrity/` and never judges events.
- The AI proctor (`proctored` mode, D-043): rules and verdict in `src/domain/exam/proctor.ts` (pure), engine and UI in `src/features/exam/proctor/`. The verdict (warnings, `proctor_ended`) is always derived from the saved log, and `ExamWatcher` ends the exam. Proctor-ended attempts are void (`benchmarkMet` false, left out of readiness).
- Store only `{type, at}`: never frames, audio or images. Always stop media tracks on cleanup. The models and runtime are self-hosted in `public/proctor/` (created by `scripts/setup-proctor-assets.mjs`).
- E2E tests replace the models through `window.__cloudprepProctorAnalyzer`.

## Statistics

Learning-mode stats are question-level: "answered" = unique questions; accuracy uses each question's latest answer. Attempt counts are stored but not used for accuracy. Recording is idempotent per session (D-019, D-023).

Review due (D-052): the schedule is pure logic in `src/domain/practice/review.ts`; `recordAnswer` keeps each question's `reviewLevel`. Levels only move up when a question was due. Progress saved without a level (old browser data, exports, server rows) gets `legacyReviewLevel`.

## Conventions

- Feature folders in `src/features/<area>/`; shared question rendering in `src/features/shared/`.
- Filenames: components `PascalCase.tsx`, everything else `camelCase.ts`; tests next to the code as `*.test.ts(x)`; E2E tests in `tests/e2e/`.
- Import alias `@/` → `src/`.
- Test queries by role or label (RTL). No snapshot tests for UI.
- Keep code comments short and useful.

## Platform notes

Windows 11 dev machine; PowerShell is the default shell (Git Bash is also available). Node 24, npm 11.
Versions: React 19.3, React Router 8 (`RouterProvider` from `react-router/dom`), Vite 8, Tailwind 4.3, TypeScript 6.0, ESLint 9, Vitest 5, Playwright 1.64 (see D-020).
In accessible names, avoid `<span className="sr-only"> text</span>` with a leading space; the space is dropped. Use `aria-label` instead.
