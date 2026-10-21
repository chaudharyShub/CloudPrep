# CloudPrep — Architecture

> Status: **Draft for approval** · Last updated: 2026-10-21

## 1. Overview

CloudPrep is a **static single-page app**. All logic runs in the browser and all user data lives in `localStorage`. The production build is a folder of static files that can be hosted on any static host.

```
┌──────────────────────────── Browser ────────────────────────────┐
│  UI layer (React components, routes, layouts)                   │
│        │ reads/writes through hooks                             │
│  State layer (Context + hooks; useSyncExternalStore; reducer)   │
│        │ calls                                                  │
│  Domain layer (pure TS: selection, scoring, timer, progress)    │
│        │ uses                         │ persists via            │
│  Content (typed question bank)   Storage layer (versioned repos)│
│                                       │                         │
│                                  localStorage                   │
└─────────────────────────────────────────────────────────────────┘
```

**Dependency rule:** arrows point down only.
- `domain/` imports nothing from React, `storage/` or `features/`.
- `storage/` knows schemas but nothing about React.
- Components never touch `localStorage` directly.

## 2. Technology stack

| Concern | Choice | Notes |
|---|---|---|
| Build | Vite (latest stable) + `@vitejs/plugin-react` | |
| UI | React (latest stable, 19.x expected) | |
| Language | TypeScript, `strict: true` plus `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride` | `any` is banned by lint; exceptions need a comment |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`, CSS-first `@theme` tokens) | No tailwind.config.js in v4 |
| Routing | React Router (v7, library/"declarative" mode) | No framework mode or SSR |
| Icons | `lucide-react` | |
| Runtime validation | **Zod** (proposed, see D-005) | For storage reads and imports |
| Font | `@fontsource-variable/inter` (proposed, see D-011) | Self-hosted; no Google Fonts request |
| Unit/component tests | Vitest + jsdom + React Testing Library + `@testing-library/user-event` + `@testing-library/jest-dom` | |
| E2E | Playwright (Chromium, WebKit, mobile viewport) + `@axe-core/playwright` | `page.clock` for timer tests |
| Lint/format | ESLint (flat config, typescript-eslint strict, react-hooks, jsx-a11y) + Prettier | |
| Package manager | npm (proposed, see D-002) | Node 24 / npm 11 are installed |

Exact versions are pinned in `package.json` when the project is set up, choosing the latest stable versions at that time.

## 3. Directory structure

```
/
├─ CLAUDE.md
├─ docs/                         # Planning docs (this folder)
├─ public/                       # favicon, robots.txt
├─ scripts/
│  └─ validate-questions.ts      # CLI wrapper around domain validator (npm run validate:questions)
├─ src/
│  ├─ main.tsx                   # Bootstraps React, imports global CSS
│  ├─ app/
│  │  ├─ App.tsx                 # Providers + RouterProvider
│  │  ├─ router.tsx              # Route table
│  │  ├─ providers.tsx           # Composes context providers
│  │  ├─ ErrorBoundary.tsx
│  │  └─ layouts/
│  │     ├─ AppLayout.tsx        # Sidebar (desktop) / top bar + drawer (mobile)
│  │     ├─ ExamLayout.tsx       # Focused, sidebar-free exam chrome
│  │     └─ OnboardingLayout.tsx
│  ├─ components/
│  │  └─ ui/                     # Design-system primitives (no business logic)
│  │     Button, IconButton, Card, Badge, Dialog (native <dialog>), ConfirmDialog,
│  │     ProgressBar, Stat, EmptyState, Alert, Toast, Tabs, SegmentedControl,
│  │     Switch, Select, Skeleton, VisuallyHidden, PageHeader, Kbd
│  ├─ features/                  # One folder per product area; pages + feature components
│  │  ├─ welcome/
│  │  ├─ dashboard/
│  │  ├─ exam/                   # InstructionsPage, ExamPage, ExamReviewPage
│  │  │  └─ components/          # QuestionPanel, AnswerOptions, QuestionNavigator,
│  │  │                          # ExamTimer, FlagToggle, SubmitDialog, ExamHeader
│  │  ├─ results/                # ResultsPage, AnswerReviewPage, DomainBreakdown
│  │  ├─ practice/               # PracticeSetupPage, PracticeSessionPage, PracticeSummary
│  │  ├─ mistakes/
│  │  ├─ bookmarks/
│  │  ├─ history/                # HistoryPage, CompareAttempts
│  │  ├─ settings/               # SettingsPage, DataManagement (export/import/reset)
│  │  ├─ about/
│  │  └─ shared/                 # Question rendering shared by exam/practice/review
│  │     QuestionStem, OptionList, ExplanationPanel, SourceLinks, DomainBadge
│  ├─ domain/                    # Pure, framework-free, 100% unit-tested
│  │  ├─ exam-guide/clf-c02.ts   # Domains, weights, task statements, duration, counts
│  │  ├─ questions/
│  │  │  ├─ types.ts             # Question model
│  │  │  ├─ validate.ts          # Bank validator (returns issue list)
│  │  │  └─ query.ts             # filter by domain/task/status, lookup by id
│  │  ├─ exam/
│  │  │  ├─ blueprint.ts         # Largest-remainder allocation
│  │  │  ├─ select.ts            # Builds a 65-question form from bank + history
│  │  │  ├─ session.ts           # ExamSession type + reducer (pure state machine)
│  │  │  ├─ timer.ts             # remainingMs(endsAt, now), warning thresholds
│  │  │  └─ scoring.ts           # isCorrect, scoreAttempt, domainBreakdown
│  │  ├─ practice/
│  │  │  ├─ session.ts           # Practice session reducer
│  │  │  └─ progress.ts          # Update progress, derive mistakes/accuracy
│  │  └─ lib/
│  │     ├─ random.ts            # Seeded PRNG (mulberry32) + shuffle
│  │     └─ time.ts              # Formatting helpers
│  ├─ content/
│  │  └─ questions/
│  │     ├─ d1-cloud-concepts.ts
│  │     ├─ d2-security-compliance.ts
│  │     ├─ d3-technology-services.ts
│  │     ├─ d4-billing-support.ts
│  │     └─ index.ts             # Exports QUESTION_BANK + BANK_VERSION
│  ├─ storage/
│  │  ├─ driver.ts               # Safe wrapper: get/set/remove, availability check, quota errors
│  │  ├─ envelope.ts             # { app, schemaVersion, savedAt, data } read/write + backup on corruption
│  │  ├─ schemas.ts              # Zod schemas for every persisted shape
│  │  ├─ migrations.ts           # Ordered migrations per key
│  │  ├─ repositories/           # preferences, history, progress, bookmarks, activeExam
│  │  ├─ store.ts                # In-memory cache + subscribe() for useSyncExternalStore
│  │  └─ transfer.ts             # Export/import bundle build + validation
│  ├─ state/
│  │  ├─ StoreProvider.tsx       # Injects store (real or in-memory for tests)
│  │  ├─ usePreferences.ts, useHistory.ts, useProgress.ts, useBookmarks.ts
│  │  └─ ExamSessionProvider.tsx # useReducer(session reducer) + persistence effect + timer
│  ├─ hooks/                     # Generic hooks: useNow, useMediaQuery, useBeforeUnload
│  ├─ styles/
│  │  └─ index.css               # @import "tailwindcss"; @theme tokens; base layer
│  └─ test/                      # Test utilities, fixtures (small fake bank), renderWithProviders
├─ tests/e2e/                    # Playwright specs
├─ index.html
├─ vite.config.ts, vitest.config.ts (or merged), playwright.config.ts
├─ tsconfig*.json, eslint.config.js, .prettierrc
└─ package.json
```

## 4. Routing

`createBrowserRouter`, or `createHashRouter` if the host is GitHub Pages (see D-004).

| Path | Page | Layout | Guard |
|---|---|---|---|
| `/` | Redirect | — | → `/welcome` if not onboarded, else `/dashboard` |
| `/welcome` | Welcome + disclaimer | Onboarding | |
| `/dashboard` | Dashboard | App | onboarded |
| `/exam` | Exam instructions / resume prompt | App | onboarded |
| `/exam/session` | Active exam | Exam | active session exists, else → `/exam` |
| `/exam/review` | Pre-submit review | Exam | active session exists |
| `/results/:attemptId` | Results summary | App | attempt exists, else not-found state |
| `/results/:attemptId/review` | Answer-by-answer review (`?q=n&filter=incorrect`) | App | |
| `/practice` | Practice setup | App | |
| `/practice/session` | Practice session (setup in router state) | App | setup present, else → `/practice` |
| `/mistakes` | Mistakes list | App | |
| `/bookmarks` | Bookmarks list | App | |
| `/history` | Attempts list + compare (`?a=&b=`) | App | |
| `/settings` | Settings + data management | App | |
| `/about` | Disclaimer, sources, scoring explanation | App | |
| `*` | Not found | App | |

Pages are lazy-loaded with `React.lazy` per feature. Because the question bank is in its own chunk, the shell renders quickly.

## 5. Component hierarchy (key screens)

```
App
└─ StoreProvider → PreferencesProvider → ToastProvider → RouterProvider
   ├─ OnboardingLayout → WelcomePage
   ├─ AppLayout (Sidebar | MobileTopBar + NavDrawer, <main>, skip link)
   │  ├─ DashboardPage
   │  │  ├─ ReadinessCard (latest score vs benchmark, trend)
   │  │  ├─ QuickActions (Full mock / Practice / Mistakes / Bookmarks)
   │  │  ├─ ResumeExamBanner (if active session)
   │  │  ├─ DomainProgressList (4 × DomainProgressRow with ProgressBar)
   │  │  └─ RecentAttempts
   │  ├─ ExamInstructionsPage (BankReadiness, Rules, StartButton | ResumeOrAbandon)
   │  ├─ ResultsPage (ScoreSummary, BenchmarkDisclaimer, DomainBreakdown, ReviewCTA)
   │  ├─ AnswerReviewPage (ReviewFilterBar, QuestionNavigator[review], ReviewedQuestion → shared/*)
   │  ├─ PracticeSetupPage → PracticeSessionPage (PracticeQuestion, FeedbackPanel, BookmarkToggle)
   │  ├─ MistakesPage, BookmarksPage (QuestionListItem…)
   │  ├─ HistoryPage (AttemptTable, CompareAttempts)
   │  └─ SettingsPage (PreferenceForm, DataManagement)
   └─ ExamLayout (ExamHeader: title · progress · ExamTimer · Review button)
      ├─ ExamPage
      │  ├─ QuestionPanel (QuestionStem, AnswerOptions[radio|checkbox], FlagToggle)
      │  ├─ ExamFooterNav (Previous · Next · Review)
      │  └─ QuestionNavigator (grid; drawer on mobile)
      └─ ExamReviewPage (ReviewSummary counts, filter, grid, SubmitDialog)
```

`features/shared/` renders a question in three modes: `exam` (no correctness), `practice` (after "Check answer"), and `review` (post-exam). Each mode shows only the data it is allowed to. In `exam` mode, the component is passed a stripped `ExamQuestionView`, without `correctOptionIds` or explanations, so answers can't leak into the DOM (AC-P5).

## 6. State management

No global state library.

| State | Lives in | Mechanism |
|---|---|---|
| Preferences, history, progress, bookmarks | `storage/store.ts` (one in-memory cache over repos) | `useSyncExternalStore` hooks, which re-render only subscribers to the changed slice and sync other tabs via the `storage` event |
| Active exam session | `ExamSessionProvider` | `useReducer(examSessionReducer)`; every state change is written to the `activeExam` repo synchronously |
| Practice session | `PracticeSessionPage` local `useReducer` | Not persisted in v1 (D-010) |
| Current time | `useNow(intervalMs)` | Re-render tick only; the domain calculates from `endsAt` |
| UI-only state (drawer open, filters) | Component state / URL search params | Filters in the URL so links and the back button work |

### 6.1 Exam session state machine

```
           start(seed, form)                 submit(reason) [guard: status==='in_progress']
  (none) ───────────────────► in_progress ─────────────────────────────────► submitted
                                 │  ▲                                          │
     answer / toggleFlag / goTo  └──┘                                          └─► attempt saved to history,
                                                                                   activeExam cleared
```

- The reducer is pure. Submission produces an `ExamAttempt` with a scoring snapshot in a pure function, and the provider persists it.
- **Exactly-once submission:** the status guard in the reducer, plus a `submittingRef` in the provider, plus an idempotent history write keyed by `attempt.id`.
- **Multi-tab:** if the `activeExam` key changes in another tab (`storage` event), the second tab becomes read-only and shows "This exam is open in another tab". See risk R-6.

## 7. Data models

```ts
// ---------- Exam guide ----------
type DomainId = 'D1' | 'D2' | 'D3' | 'D4';
type TaskStatementId =
  | '1.1' | '1.2' | '1.3' | '1.4'
  | '2.1' | '2.2' | '2.3' | '2.4'
  | '3.1' | '3.2' | '3.3' | '3.4' | '3.5' | '3.6' | '3.7' | '3.8'
  | '4.1' | '4.2' | '4.3';

// ---------- Questions (content) ----------
type QuestionType = 'single' | 'multiple';
type Difficulty = 'easy' | 'medium' | 'hard';
type ReviewStatus = 'draft' | 'reviewed' | 'retired';

interface AnswerOption {
  id: string;              // 'a' | 'b' | ... unique within question; stable across shuffles
  text: string;
  explanation?: string;    // REQUIRED for incorrect options (validator), optional for correct ones
}

interface SourceReference { title: string; url: string } // https, aws.amazon.com or docs.aws.amazon.com

interface Question {
  id: string;              // 'clf-d2-0007' — stable, never reused, even after retirement
  revision: number;        // bump on any content change affecting the answer
  type: QuestionType;
  stem: string;
  options: AnswerOption[]; // single: exactly 4; multiple: ≥5
  correctOptionIds: string[]; // single: exactly 1; multiple: ≥2 and < options.length
  explanation: string;     // why the correct answer(s) are correct
  domain: DomainId;
  taskStatement: TaskStatementId; // must belong to `domain`
  topics: string[];        // free tags, e.g. ['IAM', 'MFA']
  difficulty: Difficulty;
  references: SourceReference[]; // ≥1
  review: { status: ReviewStatus; lastVerified?: string /* YYYY-MM-DD */; notes?: string };
}

// ---------- Persisted: preferences ----------
interface Preferences {
  onboardedAt: string | null;          // ISO; also means disclaimer acknowledged
  passBenchmarkPercent: number;        // 50–90, default 70
  shuffleOptions: boolean;             // default true
  practiceSessionLength: 5 | 10 | 20 | 'all'; // default 10
  reducedMotion: 'system' | 'reduce';
  theme: 'dark';                       // widened to 'light' | 'system' when optional theme ships
  extraTimeMinutes: 0 | 30;            // optional feature; default 0
}

// ---------- Persisted: active exam ----------
interface ExamSession {
  id: string;                          // crypto.randomUUID()
  bankVersion: string;
  seed: number;
  questionIds: string[];               // 65, in presented order
  optionOrder: Record<string, string[]>; // questionId → option ids in display order
  answers: Record<string, string[]>;   // questionId → selected option ids
  flagged: string[];
  visited: string[];
  currentIndex: number;
  startedAt: number;                   // epoch ms
  endsAt: number;                      // epoch ms — the source of truth for time
  status: 'in_progress' | 'submitted';
}

// ---------- Persisted: exam history ----------
type SubmitReason = 'manual' | 'time_expired' | 'expired_while_away';

interface AttemptQuestionRecord {
  questionId: string;
  revision: number;                    // revision at time of attempt
  domain: DomainId;                    // snapshot so breakdowns survive bank changes
  taskStatement: TaskStatementId;
  selectedOptionIds: string[];
  optionOrder: string[];
  flagged: boolean;
  isCorrect: boolean;                  // snapshot (see D-009)
}

interface ExamAttempt {
  id: string;
  bankVersion: string;
  startedAt: number;
  submittedAt: number;
  durationMs: number;                  // allowed time
  submitReason: SubmitReason;
  benchmarkPercent: number;            // benchmark in effect at submission
  questions: AttemptQuestionRecord[];
  // Derived on read, not stored: score, percent, passed, per-domain breakdown, timeUsed.
}

// ---------- Persisted: progress & bookmarks ----------
interface QuestionProgress {
  attempts: number;
  correct: number;
  lastResult: 'correct' | 'incorrect';
  lastAnsweredAt: number;
  lastSource: 'practice' | 'exam';
}
type ProgressMap = Record<string /* questionId */, QuestionProgress>;
type Bookmarks = Record<string /* questionId */, { addedAt: number }>;
// Derived: mistakes = questionIds where lastResult === 'incorrect'; domain accuracy, etc.
```

## 8. Storage strategy

### 8.1 Keys

Each area has its own key, so corruption in one area can't take down the others.

| Key | Content | Approx. size |
|---|---|---|
| `cloudprep:preferences` | `Preferences` | < 1 KB |
| `cloudprep:activeExam` | `ExamSession \| null` | ~6 KB |
| `cloudprep:history` | `ExamAttempt[]` (newest first, capped at 100) | ~8 KB each |
| `cloudprep:progress` | `ProgressMap` | ~100 B per question |
| `cloudprep:bookmarks` | `Bookmarks` | small |
| `cloudprep:backup:<key>:<ts>` | Raw string of a value that failed to parse or validate | as-is, keep newest 3 |

### 8.2 Envelope and versioning

```json
{ "app": "cloudprep", "key": "history", "schemaVersion": 1, "savedAt": "2026-10-21T10:00:00Z", "data": [ ... ] }
```

Read pipeline: `raw → JSON.parse → envelope check → migrate(schemaVersion → current) → Zod validate → data`.

- **Malformed JSON or failed validation:** copy the raw value to a backup key, use the defaults, and show a dismissible notice. Never silently overwrite without a backup.
- **`schemaVersion` newer than the app** (for example, a friend opens an old cached build): don't write to that key. The app runs read-only for that area and tells the user to refresh.
- **Migrations** are pure functions `vN → vN+1`, each with a unit test and a fixture from the previous version.
- **Storage unavailable** (private mode, disabled, `SecurityError`): `driver.ts` falls back to an in-memory map, and a persistent banner says progress won't be saved.
- **Quota exceeded:** the write fails gracefully and a toast suggests exporting and pruning old history. History is capped at 100 attempts.

### 8.3 Export / import

- Export is a bundle file `{ app: "cloudprep", format: 1, exportedAt, data: { preferences, history, progress, bookmarks } }`. The active exam is excluded on purpose.
- Import: file size ≤ 5 MB → parse → Zod validate → migrate each part → preview (counts, date range) → typed confirmation → replace all areas in one go. All areas are validated before any is written.
- No webcam data, secrets or keys are ever stored or exported.

## 9. Timer design

```ts
remainingMs(endsAt: number, now: number): number   // Math.max(0, endsAt - now)
isExpired(endsAt, now): boolean
warningLevel(remainingMs): 'none' | 'low' (≤10 min) | 'critical' (≤5 min)
```

- `useNow(1000)` drives re-renders. On `visibilitychange` and `focus` it reads `Date.now()` immediately.
- `ExamSessionProvider` runs an effect: if `isExpired`, it dispatches `submit('time_expired')` once.
- On mount with a stored session where `now ≥ endsAt`, it submits with `'expired_while_away'` before rendering the exam.
- The visible timer is `aria-hidden` while ticking. A separate `aria-live="polite"` region announces only the threshold warnings, and a button lets the user hear the remaining time on demand.

## 10. Design system

### 10.1 Tokens (Tailwind v4 `@theme` in `styles/index.css`)

| Token group | Values (dark, initial) |
|---|---|
| Surfaces | `--color-bg` #0B0D10 · `--color-surface` #12151A · `--color-surface-2` #181C22 · `--color-surface-3` #20252D |
| Borders | `--color-border` #262C35 · `--color-border-strong` #343B46 |
| Text | `--color-fg` #E6E9EE · `--color-fg-muted` #A3ABB8 · `--color-fg-subtle` #7D8796 (large text/meta only) |
| Accent (restrained blue) | `--color-accent` #4C8DFF · hover #6BA1FF · `--color-accent-subtle` rgba(76,141,255,.12) · `--color-on-accent` #0B0D10 |
| Status | success #3FB27F · warning #E0A43A · danger #E5604D · info = accent (each with a `-subtle` background) |
| Radius | `--radius-sm` 6px (inputs, badges) · `--radius-md` 10px (buttons) · `--radius-lg` 14px (cards, dialogs) |
| Shadow | One soft elevation for dialogs/popovers only; cards use borders |
| Spacing | Tailwind's 4px scale; page gutter 16 / 24 / 32px; section gap 24–32px |
| Type | Inter Variable; scale 12/14/16/18/20/24/30; body 16px on exam stems, 14px in dense UI; tabular numbers for timers and scores |
| Icons | Lucide, 16px inline, 20px in nav/buttons, stroke 1.75 |
| Motion | 120–180ms ease-out on colour/opacity only; disabled under `prefers-reduced-motion` or the setting |
| Focus | 2px accent outline, 2px offset, on every interactive element (`:focus-visible`) |

All text/background pairs are checked against WCAG 2.2 AA (4.5:1 body, 3:1 large text and UI parts) during Phase 1.

### 10.2 Layout

- **Desktop (≥1024px):** a fixed 248px sidebar (logo, nav, "Resume exam" pill when active, disclaimer link at the bottom) and content up to 1120px wide.
- **Tablet (640–1023px):** the sidebar collapses to icons (64px) with tooltips.
- **Mobile (<640px):** a top bar with a menu button opens a drawer (native `<dialog>`). The main destinations are also reachable from the dashboard.
- **Exam layout:** no sidebar. A slim header has the exam name, "Question 12 of 65", the timer and a Review button. The question sits in one centred column (max 760px). The navigator is a right rail on desktop and a bottom sheet on mobile. Footer buttons are Previous / Flag / Next.

### 10.3 Controls

- Answer options are real `<input type="radio">` / `<input type="checkbox">` elements inside a `<fieldset>` with a `<legend>` (the question). Each is styled as a full-width card label, so native keyboard behaviour is kept.
- Dialogs use the native `<dialog>` element with `showModal()`, which provides focus trapping, `Esc` and an inert background without a library.
- No custom ARIA widgets where a native element exists.

## 11. Error handling

- A top-level `ErrorBoundary` and a per-route `errorElement` show a friendly page with "Reload" and "Go to dashboard". In-progress exam data is safe because it is persisted after every action.
- Storage errors appear as toasts or banners (§8.2) and never as crashes.
- A missing question ID in an attempt renders a "no longer available" placeholder.

## 12. Security & privacy

- No network calls at runtime other than loading the static assets. No analytics.
- External source links use `rel="noopener noreferrer"`.
- Imported JSON is treated as untrusted: it is schema-validated and its text is rendered as text, never with `dangerouslySetInnerHTML`.
- Question content is plain text with a small, safe formatting subset (paragraphs, inline code), rendered by our own components.

## 13. Proctoring-lite (optional, later)

- Opt-in toggle on the instructions page.
- Fullscreen request with reminder banners when fullscreen is exited.
- `visibilitychange` and `blur`/`focus` events are stored as `{type, at}` in the session and copied to the attempt.
- The results page shows a neutral integrity timeline, for example "Tab hidden 2× (total 41s)". It never says "cheating detected".
- Webcam face-presence is **deferred**. If built, it runs locally (on-device detection only), stores no frames, is never required, and works with a declined permission.
- Documented limitations: browsers can't see other devices, second monitors or virtual machines; focus events have false positives (notifications, OS dialogs).
