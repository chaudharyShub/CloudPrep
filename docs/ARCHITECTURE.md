# CloudPrep — Architecture

> Status: **Describes the code as built** (version 4.0.0) · Last updated: 2026-11-05
> This replaces the first draft of 2026-10-21. Reasons for each choice are in DECISIONS.md.

## 1. Overview

CloudPrep is a **single-page React app** hosted as static files on Vercel, with a **Supabase** backend (Postgres, Auth, Row Level Security) that the browser calls directly with the publishable key (D-044). There is no API server, SSR or Edge Function yet.

```
┌───────────────────────────────── Browser ─────────────────────────────────┐
│  UI: routes, layouts, feature pages (src/app, src/features, src/components)│
│        │ hooks                                                             │
│  State: providers + hooks (src/state)                                      │
│   AuthProvider · UserDataProvider · QuestionBankProvider · StoreProvider   │
│        │                          │                        │               │
│  Domain (src/domain): pure TS — exam engine, scoring, practice, validation │
│        │                          │                        │               │
│  Storage (src/storage): versioned areas,      Question cache (IndexedDB)   │
│  store, sync engine → localStorage                                         │
│        │                          │                        │               │
│  Backend adapters (src/backend): AuthClient, QuestionSource, UserDataRemote│
└────────┼──────────────────────────┼────────────────────────┼───────────────┘
         ▼                          ▼                        ▼
   Supabase Auth           Supabase Postgres (RLS): content tables + user tables
```

**Layering rules** (enforced by ESLint where possible):
- `src/domain/` is pure TypeScript: no React, no storage, no `features/` imports.
- Components never touch `localStorage`; they use hooks from `src/state/`, which use `src/storage/`.
- Features never import `@supabase/supabase-js`; they use `useAuth()` and the adapters in `src/backend/`.
- App code never imports `@/content/*` (the authored questions); it uses the loaded bank (D-046).
- Exam pages receive `ExamQuestionView`s without correct answers or explanations.

## 2. Technology stack

Exact versions are pinned in `package.json` (see also CLAUDE.md and D-020).

| Concern | Choice |
|---|---|
| Build | Vite 8 + `@vitejs/plugin-react` |
| UI | React 19 |
| Language | TypeScript 6 (`strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`); `any` is banned by lint |
| Styling | Tailwind CSS 4 (`@tailwindcss/vite`, CSS-first tokens in `src/styles/index.css`) |
| Routing | React Router 8, data router (`createBrowserRouter`, `RouterProvider` from `react-router/dom`) |
| Icons, font | `lucide-react`; Source Sans 3 (text) and Newsreader (headings), both variable, and IBM Plex Mono (answer sheet, numbers) via `@fontsource` (self-hosted, D-057) |
| Validation | Hand-written parsers (D-005); no schema library |
| Backend | `@supabase/supabase-js` (loaded in its own chunk), Supabase CLI for migrations |
| AI proctor | `@mediapipe/tasks-vision` with self-hosted models (D-043) |
| Analytics | `@vercel/analytics` (page views, D-048) and `@vercel/speed-insights` (Core Web Vitals, D-065), production builds only |
| Tests | Vitest + jsdom + Testing Library; PGlite for the database schema; Playwright + axe |
| Lint / format | ESLint 9 (typescript-eslint, react-hooks, jsx-a11y) + Prettier |

## 3. Directory structure

```
/
├─ CLAUDE.md, README.md
├─ LICENSE, LICENSE-CONTENT.md  # MIT for the code; CC BY-NC-SA 4.0 for the questions in src/content/ (D-061)
├─ docs/                      # This folder; images/ holds the README screenshots (D-060)
├─ public/                    # favicon, app icons, manifest, og-image; proctor/ is generated (git-ignored)
├─ scripts/                   # validate-questions, publish-questions, check-published, check-references,
│                             # check-duplicates, setup-proctor-assets, generate-brand-assets (.mjs)
├─ supabase/                  # config.toml, migrations/ (the schema), seed.sql
├─ src/
│  ├─ main.tsx                # Mounts <App>, global CSS, Vercel Analytics in production
│  ├─ app/
│  │  ├─ App.tsx              # Creates the auth client, question loader, stores; composes providers
│  │  ├─ routes.tsx           # Route table and guards
│  │  ├─ ExamScope.tsx        # /:examId routes: checks the exam, remembers it; old-address redirects (D-066)
│  │  ├─ paths.ts             # examPath / useExamPath: addresses under the exam id (D-066)
│  │  ├─ pages.tsx            # Lazy page imports (one chunk per page)
│  │  ├─ navigation.ts        # Sidebar / mobile navigation items
│  │  ├─ seo.ts               # robots.txt and sitemap.xml contents, written by the build (D-063)
│  │  ├─ developer.ts         # Developer credit (D-056), Frontend Interview Prep link (D-059), Shubham Works name (D-062)
│  │  └─ layouts/             # RootLayout (watchers, theme), AppLayout (sidebar / drawer), ExamLayout
│  ├─ backend/                # Supabase adapters behind interfaces, row types and mappers, fakes
│  │                          # auth.ts, supabaseAuth.ts, questionSource.ts, contentRows.ts,
│  │                          # userDataRemote.ts, userRows.ts, admin.ts (D-054), fakeAuth.ts, fakeAdmin.ts,
│  │                          # fakeUserTables.ts, schema.test.ts
│  ├─ components/
│  │  ├─ ui/                  # Design-system primitives: Button, Card, Badge, Dialog, ConfirmDialog,
│  │  │                       # FormControls, Notice, ProgressBar, Skeleton, Toast, EmptyState, ExternalLink
│  │  ├─ layout/              # Sidebar, MobileNav, NavList, ExamSwitcher (+ examSwitch.ts, D-066), PageHeader, Brand
│  │  └─ brand/               # LogoMark, LogoTile, logoPaths, BrandLoading, MakerMark (D-062)
│  ├─ content/                # The authored banks (D-066): banks.ts lists every exam's bank;
│  │  ├─ author.ts            # questionAuthor(prefix, refs): compact specs → questions, for every exam
│  │  ├─ questions/           # CLF-C02 (d1–d4 files, batches/, author.ts, refs.ts, index.ts)
│  │  ├─ saa-c03/             # SAA-C03 (batches/, index.ts; refs.ts and author.ts with its first batch)
│  │  └─ dva-c03/             # DVA-C03 (same layout)
│  ├─ domain/                 # Pure logic
│  │  ├─ exam-guide/          # types.ts (ExamGuide), clf-c02.ts, saa-c03.ts, dva-c03.ts, index.ts (EXAMS,
│  │  │                       # findExam, examForQuestionId): domains, weights, tasks, length, time, pass mark
│  │  ├─ questions/           # types, validate, evaluate, query, coverage
│  │  ├─ exam/                # blueprint, select, session (reducer), timer, attempt, scoring, config,
│  │  │                       # integrity (event types), proctor (rules and verdict)
│  │  ├─ practice/            # session (reducer), progress, review (schedule, D-052)
│  │  ├─ analytics/           # readiness, attemptInsights
│  │  ├─ admin/users.ts       # Admin overview: summary, last activity, sorting (D-054)
│  │  └─ lib/random.ts        # Seeded PRNG and shuffle
│  ├─ features/               # One folder per area: auth, dashboard, practice, exam (+ integrity/,
│  │                          # proctor/, components/), results, history, progress, bookmarks,
│  │                          # settings, privacy, admin (D-054), landing (D-057), errors, dev (/__ui),
│  │                          # shared (question rendering)
│  ├─ hooks/                  # useNow, useTheme, useDocumentTitle (adds the exam code on exam pages)
│  ├─ lib/                    # theme, format, download, ids, cn, reloadAfterUpdate (D-053)
│  ├─ state/                  # Providers and hooks (§6)
│  ├─ storage/                # driver, envelope, areas, store, sync, account, transfer, questionCache
│  ├─ styles/index.css        # Tailwind import, design tokens (both themes), base styles
│  └─ test/                   # renderApp, fixtures, test bank, setup
└─ tests/e2e/                 # Playwright specs and fixtures
```

## 4. Routing

`createBrowserRouter` with a host fallback to `index.html` (D-004, D-038). Pages are lazy-loaded.

Pages of one exam live under its id (D-066): `:exam` below is `clf-c02`, `saa-c03` or `dva-c03` (only launched exams in production builds). `ExamScope` checks the id (unknown → not found) and saves it as the `exam` preference. Every page reads its exam from the address with `useCurrentExam()` (shared pages fall back to the preference), and builds links with `useExamPath()` / `examPath()`.

| Path | Page | Guard |
|---|---|---|
| `/` | Landing page for guests, for the exam used last; signed-in users are redirected to its dashboard (`HomeRoute`, D-057). Outside `AppLayout`: own header and footer | — |
| `/:exam` | The exam's own landing page (same component, that exam's facts; D-066) | — |
| `/:exam/practice`, `/:exam/practice/session` | Learning mode setup and session | Questions loaded |
| `/:exam/bookmarks` | Bookmarks | Questions loaded |
| `/settings`, `/privacy` | Settings, privacy (shared by every exam) | — |
| `/sign-in`, `/auth/callback` | Sign-in and its return page | — |
| `/:exam/dashboard` | Dashboard | Signed in + questions |
| `/:exam/exam`, `/:exam/exam/check-in` | Exam entry, proctor check-in | Signed in + questions |
| `/:exam/exam/session`, `/:exam/exam/review` | Exam and final review (`ExamLayout`; an exam in progress of another exam redirects to its own address) | Signed in + questions + active exam |
| `/:exam/results/:attemptId`, `…/review` | Results and answer review | Signed in + questions |
| `/:exam/history`, `/:exam/progress` | Exam history, progress | Signed in + questions |
| `/dashboard`, `/practice`, `/exam`, `/results/:id`, … | Old addresses (before 4.0.0): redirect to the same page of the exam used last (`LegacyRedirect`, keeping search and router state); results go to their attempt's exam | — |
| `/admin` | Admin overview of signed-in users (D-054; linked in the navigation only for admins, D-055) | Signed in; the database returns data only to admins |
| `/__ui` | Design-system page (development only) | — |
| `*` | Not found | — |

One `AppLayout` route holds both the exam pages and the shared ones, so the sidebar stays mounted between them. The exam's landing page and exam screens sit in a second `:examId` branch without app chrome.

- `RequireAuth` sends guests to `/sign-in?next=…`; `safeNextPath` only accepts paths on this site.
- `RequireQuestions` waits for the first bank download (branded loading screen) and shows "Try again" on failure; with a cached bank it never waits.
- `RootLayout` wraps everything: `ExamWatcher` (auto-submit on any page), `GuestDataPrompt`, theme and motion, scroll restoration. `AppLayout` has the sidebar from 1024 px and a top bar with a `<dialog>` drawer below that.

## 5. Questions

- **Authoring:** TypeScript modules per exam (D-006, D-066): `src/content/questions/` (CLF-C02), `src/content/saa-c03/`, `src/content/dva-c03/`, listed in `src/content/banks.ts` with each `BANK_VERSION`. Compact specs via `questionAuthor(prefix, refs)` (`src/content/author.ts`), references from each exam's `refs.ts`. Question ids carry the exam (`clf-`, `saa-`, `dva-`); `validateQuestion()` takes the exam from the prefix and checks domain and task statement against that guide. `validateBank()` runs in `npm test` (`banks.test.ts`, every exam) and `npm run validate:questions`.
- **Publishing:** `npm run publish:questions` (secret key) publishes every exam: `exams`, `exam_domains` and `exam_topics` always (user rows reference `exams`), then, for an exam with questions, `questions` (no answers), `question_keys` (answers, explanations, sources) and `question_revisions` (full content per revision), and sets its `exams.bank_version` and `is_published` last. An exam without questions stays unpublished. Drafts are never published, and published questions can't be deleted, only retired.
- **Loading (D-046, D-066):** `QuestionBankProvider` keeps one bank per exam and loads one when a page first needs it (`useExamBankState(examId)`), through a `QuestionLoader` per exam (`loaderFor`): it shows the IndexedDB copy at once (`cloudprep` / `questionBanks`, keyed by exam, with its version), checks `exams.bank_version`, and downloads the bank only when it changed. Rows are rebuilt and validated; invalid ones are left out. `buildQuestionBank(questions, version, exam)` derives the practice and exam sets, lookups and the exam offer once per version.
- **Other sources:** E2E builds, and development without Supabase settings or with `VITE_QUESTIONS_SOURCE=local`, load the bundled banks (`src/content/banks.ts`) as a separate chunk; production builds drop that branch.
- Hooks: `useQuestionBank()`, `usePracticeQuestions()`, `useExamQuestions()` (current exam); `useExamBankState(examId)` for another exam (the exam watcher and submit use the active exam's own bank).

## 6. State and data flow

No global state library (D-015).

| State | Lives in | Mechanism |
|---|---|---|
| Sign-in | `AuthProvider` (`useAuth()`) | `AuthClient` interface: Supabase, a fake in E2E builds, or "unavailable" |
| Which store is active | `UserDataProvider` | The guest store, or the signed-in account's copy (D-047); `useAppStore()` returns the active one |
| Preferences, progress, bookmarks, practice sessions, attempts, active exam, archive | `src/storage/store.ts` | In-memory snapshot over `localStorage`, read with `useSyncExternalStore` hooks; other tabs sync via the `storage` event. One store holds every exam's data, each item tagged with its exam (D-066): `useUserData()` returns the current exam's progress, bookmarks, sessions and attempts (`scopeToExam`); `useAllUserData()` returns everything (settings, export); `usePreferences()` and `useActiveExam()` are shared |
| Current exam | The address | `useCurrentExam()`: the exam in the address (`useAddressExam`), else the `exam` preference, else the first available exam (D-066) |
| Exam session | The store's `activeExam` | Pure reducer in `domain/exam/session.ts`, saved on every action through `store.dispatchExam`; submit only through `useExamActions().submit` (idempotent) |
| Practice session | `PracticeSessionPage` | Local reducer, not restored after a reload (D-010); each checked answer is saved at once |
| Questions | `QuestionBankProvider` | See §5 |
| Current time | `useNow()` | Re-render tick only |
| UI state (filters, dialogs) | Component state / URL | |

### 6.1 Exam session

`in_progress → confirming → submitted` (finish dialog in between). Only one exam is in progress at a time, whichever exam it belongs to (`startExam` refuses a second; D-066). The reducer ignores everything after `submitted`; edits at or after `endsAt` are refused. Exactly-once submission comes from the reducer's terminal state, `completeExam` storing an attempt id at most once, and clearing the active exam (D-028). `ExamWatcher` submits expired exams once sign-in and the bank have loaded; a found-expired exam gets `expired_while_away`, and a proctor verdict gets `proctor_ended`.

### 6.2 Sync (signed-in users, D-047)

- The account's copy lives under `cloudprep-account:` with an owner record `{userId, signedIn}`; guest data keeps `cloudprep:`.
- Every change made through a store method marks its records as pending (`sync:pending`, saved). `src/storage/sync.ts` sends them after 800 ms, retries with back-off (2 s to 60 s) and when the browser comes back online.
- Downloads (on sign-in, coming back online, or showing the tab after a minute) replace the copy only when nothing is pending, through `applyRemote` and the same parsers as storage. Last write per record wins.
- On sign-out, pending changes are sent (up to 5 s) and the copy is removed once saved.
- The question archive isn't synced; on a new device old attempts show the current wording with a note.
- Every exam syncs together (D-066): rows are written with their item's `exam_id` (from the question id prefix for progress and bookmarks, from `examId` for sessions, attempts and the active exam) and downloads read all exams, with the session and attempt limits applied per exam. Server rows from before D-066 get their exam from `exam_id`. When an exam session is replaced or cleared, every other exam's `active_exams` row is deleted, and a download with several rows uses the newest.

## 7. Data models

The main shapes (full definitions in the files named):

```ts
// src/domain/questions/types.ts
type ReviewStatus = 'draft' | 'unverified' | 'checked' | 'approved' | 'retired';
interface Question {
  id: string;                    // <exam prefix>-d<n>-<nnnn> (clf-, saa-, dva-), never reused
  revision: number;              // bumped when the answer could change
  type: 'single' | 'multiple';
  stem: string;
  options: { id: string; text: string; explanation: string }[];  // every option explained
  correctOptionIds: string[];
  explanation: string;
  domain: DomainId; taskStatement: TaskStatementId;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  references: { title: string; url: string }[];
  review: { status: ReviewStatus; lastVerified: string; notes?: string };
}

// src/storage/preferencesArea.ts (only changed values are stored, D-034)
interface Preferences {
  theme: 'dark' | 'light' | 'system'; reducedMotion: 'system' | 'reduce';
  benchmarkPercent: number;      // 50–90, default 70
  examTimeWarnings: boolean; shuffleOptions: boolean;
  practiceSessionLength: '5' | '10' | '20' | 'all';
  exam: string;                  // the exam used last (D-066), default 'clf-c02'
}

// src/domain/exam-guide/types.ts (D-066)
interface ExamGuide {
  id: string; code: string; name: string; shortName: string; level: 'Foundational' | 'Associate';
  questionPrefix: string; guideUrl: string; verified: string;
  questionCount: number; scoredQuestionCount: number; durationMinutes: number;
  passingScore: number; feeUsd: number; launched: boolean;
  domains: { id: 'D1' | 'D2' | 'D3' | 'D4'; number; name; weightPercent; taskStatements }[];
}

// src/domain/exam/session.ts
interface ExamSession {
  id: string; examId: string;    // examId: D-066; missing in older data = 'clf-c02'
  kind: 'full' | 'short'; bankVersion: string; seed: number;
  startedAt: number; endsAt: number; durationMs: number;   // endsAt is the source of truth
  questionIds: string[]; optionOrder: Record<string, string[]>;
  requiredSelections: Record<string, number>;
  answers: Record<string, string[]>;                         // selections only, never answers
  flagged: string[]; currentIndex: number;
  status: 'in_progress' | 'confirming' | 'submitted';
  submittedAt: number | null;
  submitReason: 'manual' | 'time_expired' | 'expired_while_away' | 'proctor_ended' | null;
  integrity: IntegrityLog;       // { mode, events: {type, at}[] }, capped at 1,000 events
}

// src/domain/exam/attempt.ts (schema v2, D-032)
interface ExamAttempt {
  id: string; examId: string;    // D-066; missing in older data = 'clf-c02'
  kind; bankVersion; startedAt; endsAt; durationMs; submittedAt; submitReason;
  timeUsedMs: number; benchmarkPercent: number; benchmarkMet: boolean;
  summary: ScoreSummary;          // totals and per-domain breakdown, recomputed and repaired on read
  questions: { questionId; revision; domain; taskStatement; selectedOptionIds;
               optionOrder; flagged; outcome }[];             // never question text (D-031)
  unavailableQuestionIds: string[];
  integrity: IntegrityLog;
}

// src/domain/practice/progress.ts — per question: attempts, correct, last result and time (D-019),
//   and the review level (0–4) that src/domain/practice/review.ts schedules (D-052)
// src/storage/areas.ts — Bookmarks = Record<questionId, { addedAt }>; practice session summaries
//   (with examId, D-066)
```

## 8. Storage

### 8.1 Browser keys

Guest data uses the `cloudprep:` prefix; a signed-in account's copy uses the same names under `cloudprep-account:`.

| Area (key name) | Content | Version | Limit |
|---|---|---|---|
| `preferences` | Changed settings only | 2 | |
| `progress` | Per-question practice progress (v2 adds the review level, D-052) | 2 | |
| `bookmarks` | Bookmarked question ids | 1 | |
| `practiceSessions` | Practice session summaries, each with its `examId` | 1 | 50 per exam |
| `examAttempts` | Submitted exams, newest first, each with its `examId` | 2 | 100 per exam |
| `activeExam` | The exam in progress (one, of any exam) | 1 | |
| `questionArchive` | Question content per `id@revision` used by attempts (D-031) | 1 | Pruned |
| `backup:<key>:<ts>`, `backup:snapshot:<ts>` | Raw copies of unreadable values; full backups before imports | | 3 per key |

Adding `examId` (D-066) didn't change the schema versions: each parser reads an item without `examId` as CLF-C02 and drops items of unknown exams, so browser data, import files and server rows from before 4.0.0 all read the same way. Progress, bookmarks and the archive are keyed by question id, which carries the exam.

Also: `cloudprep-account:owner`, `cloudprep-account:sync:pending`, `cloudprep-import-asked` (accounts already asked about guest data), and `cloudprep-e2e-auth` (E2E builds only). The question bank is in IndexedDB, not `localStorage`.

### 8.2 Envelope and versioning

Every value is `{ app: "cloudprep", schemaVersion, savedAt, data }`. `decodeArea` (used by storage, imports and sync downloads) checks the envelope, runs the migrations one version at a time, then the area's hand-written parser (D-005), which drops invalid entries one by one and skips unsafe keys (`isSafeKey`).

- **Unreadable or partly invalid:** the raw value is backed up first, the valid part (or the default) is used, and a notice explains it.
- **Newer `schemaVersion`:** the value is used if readable but never overwritten.
- **Storage unavailable:** an in-memory driver is used and a banner says nothing will be saved.
- **Quota exceeded:** the write fails without touching the stored value, and a notice is shown.

### 8.3 Export / import

`{ app, kind: 'export', format: 1, exportedAt, areas: { <area>: { schemaVersion, data } } }`, without the exam in progress. Import: 5 MB limit, `JSON.parse` only, every area decoded like storage, preview, then merge or replace after a full backup (D-035).

## 9. Backend (Supabase)

- **Schema:** `supabase/migrations/` (the initial schema, `review_level` on `question_progress` (D-052), and the admin overview (D-054)). Content: `exams`, `exam_domains`, `exam_topics`, `questions`, `question_keys`, `question_revisions`. User data: `profiles` (created on sign-up), `user_preferences`, `question_progress`, `bookmarks`, `practice_sessions`, `exam_attempts` + `exam_attempt_questions`, `active_exams`. Every user-data table has `exam_id`, which the app fills per item since D-066 (no schema change was needed: progress and bookmarks are keyed by question id, `active_exams` by user and exam, `user_preferences` by user). Admin: `admins` (no API access at all) and two security-definer functions, `is_admin()` and `admin_user_overview()`, which raises error `42501` unless the caller is in `admins`.
- **Security:** RLS on every table. User tables are limited to `auth.uid()`; deleting an account deletes its data. Guests and users read only published content; only the service role writes it. Grants are set explicitly on top of RLS.
- **Answers:** `question_keys` is readable for now, because scoring is in the browser. Keeping answers in their own table lets server scoring lock it later (Phase 8 step 5).
- **Adapters:** `AuthClient` (`auth.ts`, `supabaseAuth.ts`), `QuestionSource` (`questionSource.ts`, `contentRows.ts`), `UserDataRemote` (`userDataRemote.ts`, `userRows.ts`), `AdminClient` (`admin.ts`, RPCs to `admin_user_overview` and `is_admin`, provided by `AdminProvider`; `useIsAdmin()` shows the Admin link, D-055). Each has a fake for tests.
- **Tests:** `src/backend/schema.test.ts` applies the migrations to PGlite with the Supabase roles stubbed and checks RLS, grants, constraints and a sync round trip.

## 10. Design system

- **Tokens:** colours, radii and shadows are CSS variables in `src/styles/index.css`, defined for the dark and light themes and exposed to Tailwind with `@theme`. Feature code uses only these tokens and the primitives in `src/components/ui/`. `InfoTip` is the "i" button for short explanations (D-058): a toggletip, not a hover tooltip; its panel is `position: fixed` and kept 16px inside the screen, so it never widens the page on a phone. `CardHeader` takes it as `info`, beside the heading rather than inside it. Contrast is checked against WCAG 2.2 AA in both themes (D-024): `src/styles/tokens.test.ts` checks every token pair, and axe runs in the E2E tests.
- **Look (D-057, "study notes in aubergine"):** rounded cards (`rounded-lg`, 18px), pill buttons, badges and nav items (`rounded-full`), Source Sans 3 for text, Newsreader (`font-serif`) for page, card and dialog titles, IBM Plex Mono (`font-mono`, tabular numbers) for numbers and the exam's answer sheet, which keeps the exam-paper look (square cells, `ink` hairline). Colour roles: `accent` (aubergine: text, links, borders, fills under `on-accent`), `highlight` / `on-highlight` (soft tint for selected and active states), `primary` / `on-primary` (main buttons), `meter` (progress fills), `flag` / `flag-border` / `on-flag` (flagged questions, orange), `ink` (answer-sheet hairlines), blue `focus`. Dark mode is true black (`#000000`) with neutral grey layers and a lighter aubergine.
- **Theme:** light (the default since 3.0.1, D-057), dark or system, applied before first paint by an inline script in `index.html` (D-039) and then by `src/lib/theme.ts`; keep the two in sync.
- **Brand:** `LogoMark` / `LogoTile` (`src/components/brand/`), an aubergine tile (D-050, D-057). Navigation and page titles have no icons since D-057. The Shubham Works `MakerMark` (D-062, the "Dial") appears only in the footer credit (`MadeBy`), coloured with the `maker` token; it is shared with the developer's other sites (`docs/SHUBHAM_WORKS.md`).
- **Layout:** sidebar from 1024 px, otherwise a top bar and drawer; content up to the `max-w-content` width. The exam layout has no sidebar: a header with the timer, then the exam page with "Question n of 65", the question grid and a link to the final review.
- **Controls:** native radio and checkbox inputs in a `<fieldset>`, native `<dialog>` with `showModal()`, native buttons and links (D-014). Every interactive element has a visible focus style and an accessible name.
- **Motion:** short colour and opacity transitions, off under `prefers-reduced-motion` or the setting. The landing page alone adds `animate-rise`, `hover-lift` (utilities in `index.css`) and `useReveal` / `useExamDemo` (`src/features/landing/motion.ts`); the reduce-motion rules also remove animation delays and the hover lift.

## 11. Error handling

- A route `errorElement` shows a friendly page with Reload. In-progress exam data is safe because it's saved after every action.
- **After a deploy (D-053):** a page file that fails to load (the old name is gone) reloads the site once, from Vite's `vite:preloadError` event (`src/main.tsx`) or the route error page. `src/lib/reloadAfterUpdate.ts` keeps a 30-second guard in `sessionStorage`, so a file that fails again shows the error page instead of reloading in a loop.
- Storage problems show notices, never crashes (§8.2). Question download failures show "Try again".
- A question missing from the bank renders a "no longer available" placeholder; an attempt is reviewed with its archived wording when available.

## 12. Security and privacy

- The browser only has the publishable key; RLS protects every row. The secret key is used only by scripts in `.env.local`.
- Admin access (D-054) is decided in the database, not the app: the `/admin` page's code is public like the rest of the site, but `admin_user_overview()` returns other users' details only to accounts listed in `admins`, which is changed only with the secret key: `npm run admin:add` (adds the accounts in `ADMIN_EMAIL` from `.env.local`, D-055) or the Supabase SQL editor. `is_admin()` only decides whether the navigation shows the Admin link; hiding it protects nothing, and the page shows no data to a non-admin anyway. The admin email is never in the app or its env (`VITE_` values are public).
- Network: the app's own files, Supabase, and in production Vercel Web Analytics (page views) and Speed Insights (page-speed timings); no cookies.
- External links use `rel="noopener noreferrer"`. Imported files and server data are untrusted: parsed strictly, rendered as text, never with `dangerouslySetInnerHTML`.
- Integrity logs store only `{type, at}`. Camera and microphone data are analysed in memory and never stored or sent.

## 13. Practice integrity and AI proctor

- **Strict practice** (`focus` mode, `src/features/exam/integrity/`): fullscreen request, tab, focus and fullscreen events. It never judges (D-036).
- **AI proctor** (`proctored` mode, D-043): the rules and the verdict are pure functions in `src/domain/exam/proctor.ts`, always derived from the saved log. The engine and UI are in `src/features/exam/proctor/` (check-in, calibration, MediaPipe analysis, microphone loudness, warnings). `ExamWatcher` ends the exam on a verdict. Proctor-ended attempts are void.
- The models and runtime are self-hosted in `public/proctor/`, created by `scripts/setup-proctor-assets.mjs` with pinned hashes, and loaded only for a proctored exam. Every media track is stopped on cleanup.
- `webcam` is a retired mode kept so old logs still load.
