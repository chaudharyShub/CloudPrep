# CloudPrep — Architecture

> Status: **Describes the code as built** (version 2.0.0) · Last updated: 2026-10-26
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
| Icons, font | `lucide-react`; Inter Variable via `@fontsource-variable/inter` (self-hosted) |
| Validation | Hand-written parsers (D-005); no schema library |
| Backend | `@supabase/supabase-js` (loaded in its own chunk), Supabase CLI for migrations |
| AI proctor | `@mediapipe/tasks-vision` with self-hosted models (D-043) |
| Analytics | `@vercel/analytics`, production builds only (D-048) |
| Tests | Vitest + jsdom + Testing Library; PGlite for the database schema; Playwright + axe |
| Lint / format | ESLint 9 (typescript-eslint, react-hooks, jsx-a11y) + Prettier |

## 3. Directory structure

```
/
├─ CLAUDE.md, README.md
├─ docs/                      # This folder
├─ public/                    # favicon, app icons, manifest, og-image; proctor/ is generated (git-ignored)
├─ scripts/                   # validate-questions, publish-questions, check-published, check-references,
│                             # check-duplicates, setup-proctor-assets, generate-brand-assets (.mjs)
├─ supabase/                  # config.toml, migrations/ (the schema), seed.sql
├─ src/
│  ├─ main.tsx                # Mounts <App>, global CSS, Vercel Analytics in production
│  ├─ app/
│  │  ├─ App.tsx              # Creates the auth client, question loader, stores; composes providers
│  │  ├─ routes.tsx           # Route table and guards
│  │  ├─ pages.tsx            # Lazy page imports (one chunk per page)
│  │  ├─ navigation.ts        # Sidebar / mobile navigation items
│  │  └─ layouts/             # RootLayout (watchers, theme), AppLayout (sidebar / drawer), ExamLayout
│  ├─ backend/                # Supabase adapters behind interfaces, row types and mappers, fakes
│  │                          # auth.ts, supabaseAuth.ts, questionSource.ts, contentRows.ts,
│  │                          # userDataRemote.ts, userRows.ts, fakeAuth.ts, fakeUserTables.ts, schema.test.ts
│  ├─ components/
│  │  ├─ ui/                  # Design-system primitives: Button, Card, Badge, Dialog, ConfirmDialog,
│  │  │                       # FormControls, Notice, ProgressBar, Skeleton, Toast, EmptyState, ExternalLink
│  │  ├─ layout/              # Sidebar, MobileNav, NavList, PageHeader, Brand, pageIcons
│  │  └─ brand/               # LogoMark, LogoTile, logoPaths, BrandLoading
│  ├─ content/questions/      # The authored bank (d1–d4 files, batches/, author.ts, refs.ts, index.ts)
│  ├─ domain/                 # Pure logic
│  │  ├─ exam-guide/clf-c02.ts  # Domains, weights, task statements, 65 questions, 90 minutes, EXAM_ID
│  │  ├─ questions/           # types, validate, evaluate, query, coverage
│  │  ├─ exam/                # blueprint, select, session (reducer), timer, attempt, scoring, config,
│  │  │                       # integrity (event types), proctor (rules and verdict)
│  │  ├─ practice/            # session (reducer), progress, review (schedule, D-052)
│  │  ├─ analytics/           # readiness, attemptInsights
│  │  └─ lib/random.ts        # Seeded PRNG and shuffle
│  ├─ features/               # One folder per area: auth, dashboard, practice, exam (+ integrity/,
│  │                          # proctor/, components/), results, history, progress, bookmarks,
│  │                          # settings, privacy, errors, dev (/__ui), shared (question rendering)
│  ├─ hooks/                  # useNow, useTheme, useDocumentTitle
│  ├─ lib/                    # theme, format, download, ids, cn
│  ├─ state/                  # Providers and hooks (§6)
│  ├─ storage/                # driver, envelope, areas, store, sync, account, transfer, questionCache
│  ├─ styles/index.css        # Tailwind import, design tokens (both themes), base styles
│  └─ test/                   # renderApp, fixtures, test bank, setup
└─ tests/e2e/                 # Playwright specs and fixtures
```

## 4. Routing

`createBrowserRouter` with a host fallback to `index.html` (D-004, D-038). Pages are lazy-loaded.

| Path | Page | Guard |
|---|---|---|
| `/` | Redirect to `/dashboard` | — |
| `/practice`, `/practice/session` | Learning mode setup and session | Questions loaded |
| `/bookmarks` | Bookmarks | Questions loaded |
| `/settings`, `/privacy` | Settings, privacy | — |
| `/sign-in`, `/auth/callback` | Sign-in and its return page | — |
| `/dashboard` | Dashboard | Signed in + questions |
| `/exam`, `/exam/check-in` | Exam entry, proctor check-in | Signed in + questions |
| `/exam/session`, `/exam/review` | Exam and final review (`ExamLayout`) | Signed in + questions + active exam |
| `/results/:attemptId`, `/results/:attemptId/review` | Results and answer review | Signed in + questions |
| `/history`, `/progress` | Exam history, progress | Signed in + questions |
| `/__ui` | Design-system page (development only) | — |
| `*` | Not found | — |

- `RequireAuth` sends guests to `/sign-in?next=…`; `safeNextPath` only accepts paths on this site.
- `RequireQuestions` waits for the first bank download (branded loading screen) and shows "Try again" on failure; with a cached bank it never waits.
- `RootLayout` wraps everything: `ExamWatcher` (auto-submit on any page), `GuestDataPrompt`, theme and motion, scroll restoration. `AppLayout` has the sidebar from 1024 px and a top bar with a `<dialog>` drawer below that.

## 5. Questions

- **Authoring:** TypeScript modules in `src/content/questions/` (D-006), compact specs via `author.ts`, references from `refs.ts`. `validateBank()` runs in `npm test` and `npm run validate:questions`.
- **Publishing:** `npm run publish:questions` (secret key) upserts `exams`, `exam_domains`, `exam_topics`, `questions` (no answers), `question_keys` (answers, explanations, sources) and `question_revisions` (full content per revision), and sets `exams.bank_version` last. Drafts are never published, and published questions can't be deleted, only retired.
- **Loading (D-046):** `QuestionBankProvider` uses a `QuestionLoader`: it shows the IndexedDB copy at once (`cloudprep` / `questionBanks`, keyed by exam, with its version), checks `exams.bank_version`, and downloads the bank only when it changed. Rows are rebuilt and validated; invalid ones are left out. `buildQuestionBank` derives the practice and exam sets, lookups and the exam offer once per version.
- **Other sources:** E2E builds, and development without Supabase settings or with `VITE_QUESTIONS_SOURCE=local`, load the bundled bank as a separate chunk; production builds drop that branch.
- Hooks: `useQuestionBank()`, `usePracticeQuestions()`, `useExamQuestions()`.

## 6. State and data flow

No global state library (D-015).

| State | Lives in | Mechanism |
|---|---|---|
| Sign-in | `AuthProvider` (`useAuth()`) | `AuthClient` interface: Supabase, a fake in E2E builds, or "unavailable" |
| Which store is active | `UserDataProvider` | The guest store, or the signed-in account's copy (D-047); `useAppStore()` returns the active one |
| Preferences, progress, bookmarks, practice sessions, attempts, active exam, archive | `src/storage/store.ts` | In-memory snapshot over `localStorage`, read with `useSyncExternalStore` hooks (`useUserData`, `usePreferences`, `useActiveExam`, …); other tabs sync via the `storage` event |
| Exam session | The store's `activeExam` | Pure reducer in `domain/exam/session.ts`, saved on every action through `store.dispatchExam`; submit only through `useExamActions().submit` (idempotent) |
| Practice session | `PracticeSessionPage` | Local reducer, not restored after a reload (D-010); each checked answer is saved at once |
| Questions | `QuestionBankProvider` | See §5 |
| Current time | `useNow()` | Re-render tick only |
| UI state (filters, dialogs) | Component state / URL | |

### 6.1 Exam session

`in_progress → confirming → submitted` (finish dialog in between). The reducer ignores everything after `submitted`; edits at or after `endsAt` are refused. Exactly-once submission comes from the reducer's terminal state, `completeExam` storing an attempt id at most once, and clearing the active exam (D-028). `ExamWatcher` submits expired exams once sign-in and the bank have loaded; a found-expired exam gets `expired_while_away`, and a proctor verdict gets `proctor_ended`.

### 6.2 Sync (signed-in users, D-047)

- The account's copy lives under `cloudprep-account:` with an owner record `{userId, signedIn}`; guest data keeps `cloudprep:`.
- Every change made through a store method marks its records as pending (`sync:pending`, saved). `src/storage/sync.ts` sends them after 800 ms, retries with back-off (2 s to 60 s) and when the browser comes back online.
- Downloads (on sign-in, coming back online, or showing the tab after a minute) replace the copy only when nothing is pending, through `applyRemote` and the same parsers as storage. Last write per record wins.
- On sign-out, pending changes are sent (up to 5 s) and the copy is removed once saved.
- The question archive isn't synced; on a new device old attempts show the current wording with a note.

## 7. Data models

The main shapes (full definitions in the files named):

```ts
// src/domain/questions/types.ts
type ReviewStatus = 'draft' | 'unverified' | 'checked' | 'approved' | 'retired';
interface Question {
  id: string;                    // clf-d<n>-<nnnn>, never reused
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
}

// src/domain/exam/session.ts
interface ExamSession {
  id: string; kind: 'full' | 'short'; bankVersion: string; seed: number;
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
  id: string; kind; bankVersion; startedAt; endsAt; durationMs; submittedAt; submitReason;
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
```

## 8. Storage

### 8.1 Browser keys

Guest data uses the `cloudprep:` prefix; a signed-in account's copy uses the same names under `cloudprep-account:`.

| Area (key name) | Content | Version | Limit |
|---|---|---|---|
| `preferences` | Changed settings only | 2 | |
| `progress` | Per-question practice progress (v2 adds the review level, D-052) | 2 | |
| `bookmarks` | Bookmarked question ids | 1 | |
| `practiceSessions` | Practice session summaries | 1 | 50 |
| `examAttempts` | Submitted exams, newest first | 2 | 100 |
| `activeExam` | The exam in progress | 1 | |
| `questionArchive` | Question content per `id@revision` used by attempts (D-031) | 1 | Pruned |
| `backup:<key>:<ts>`, `backup:snapshot:<ts>` | Raw copies of unreadable values; full backups before imports | | 3 per key |

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

- **Schema:** `supabase/migrations/` (the initial schema, plus `review_level` on `question_progress`, D-052). Content: `exams`, `exam_domains`, `exam_topics`, `questions`, `question_keys`, `question_revisions`. User data: `profiles` (created on sign-up), `user_preferences`, `question_progress`, `bookmarks`, `practice_sessions`, `exam_attempts` + `exam_attempt_questions`, `active_exams`. Every table has `exam_id`.
- **Security:** RLS on every table. User tables are limited to `auth.uid()`; deleting an account deletes its data. Guests and users read only published content; only the service role writes it. Grants are set explicitly on top of RLS.
- **Answers:** `question_keys` is readable for now, because scoring is in the browser. Keeping answers in their own table lets server scoring lock it later (Phase 8 step 5).
- **Adapters:** `AuthClient` (`auth.ts`, `supabaseAuth.ts`), `QuestionSource` (`questionSource.ts`, `contentRows.ts`), `UserDataRemote` (`userDataRemote.ts`, `userRows.ts`). Each has a fake for tests.
- **Tests:** `src/backend/schema.test.ts` applies the migrations to PGlite with the Supabase roles stubbed and checks RLS, grants, constraints and a sync round trip.

## 10. Design system

- **Tokens:** colours, radii and shadows are CSS variables in `src/styles/index.css`, defined for the dark and light themes and exposed to Tailwind with `@theme`. Feature code uses only these tokens and the primitives in `src/components/ui/`. Contrast is checked against WCAG 2.2 AA in both themes (D-024).
- **Theme:** dark, light or system, applied before first paint by an inline script in `index.html` (D-039) and then by `src/lib/theme.ts`; keep the two in sync.
- **Brand:** `LogoMark` / `LogoTile` (`src/components/brand/`), page icons from `PAGE_ICONS` (D-050).
- **Layout:** sidebar from 1024 px, otherwise a top bar and drawer; content up to the `max-w-content` width. The exam layout has no sidebar: a header with the timer, then the exam page with "Question n of 65", the question grid and a link to the final review.
- **Controls:** native radio and checkbox inputs in a `<fieldset>`, native `<dialog>` with `showModal()`, native buttons and links (D-014). Every interactive element has a visible focus style and an accessible name.
- **Motion:** short colour and opacity transitions, off under `prefers-reduced-motion` or the setting.

## 11. Error handling

- A route `errorElement` shows a friendly page with Reload. In-progress exam data is safe because it's saved after every action.
- Storage problems show notices, never crashes (§8.2). Question download failures show "Try again".
- A question missing from the bank renders a "no longer available" placeholder; an attempt is reviewed with its archived wording when available.

## 12. Security and privacy

- The browser only has the publishable key; RLS protects every row. The secret key is used only by scripts in `.env.local`.
- Network: the app's own files, Supabase, and Vercel Web Analytics in production (page views only, no cookies).
- External links use `rel="noopener noreferrer"`. Imported files and server data are untrusted: parsed strictly, rendered as text, never with `dangerouslySetInnerHTML`.
- Integrity logs store only `{type, at}`. Camera and microphone data are analysed in memory and never stored or sent.

## 13. Practice integrity and AI proctor

- **Strict practice** (`focus` mode, `src/features/exam/integrity/`): fullscreen request, tab, focus and fullscreen events. It never judges (D-036).
- **AI proctor** (`proctored` mode, D-043): the rules and the verdict are pure functions in `src/domain/exam/proctor.ts`, always derived from the saved log. The engine and UI are in `src/features/exam/proctor/` (check-in, calibration, MediaPipe analysis, microphone loudness, warnings). `ExamWatcher` ends the exam on a verdict. Proctor-ended attempts are void.
- The models and runtime are self-hosted in `public/proctor/`, created by `scripts/setup-proctor-assets.mjs` with pinned hashes, and loaded only for a proctored exam. Every media track is stopped on cleanup.
- `webcam` is a retired mode kept so old logs still load.
