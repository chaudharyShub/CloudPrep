# CloudPrep — Implementation Plan

> Status: **In progress** · Last updated: 2026-10-26
>
> The phase sections below (P0–P10, C1–C3) are the original plan from 2026-10-21, kept for history; the Progress table and "Changes from the original plan" say what was actually built. For how the app works today, see PRODUCT_SPEC.md and ARCHITECTURE.md.

## Progress

The user's phase prompts group the plan's phases differently (docs/DECISIONS.md D-021):

| User phase | Covers plan phases | Status |
|---|---|---|
| Phase 1: foundation & design system | P0, P1 | Done, merged and live |
| Phase 2: question bank & Learning Mode | P2 (questions, validation, practice logic), P3 (storage for progress, bookmarks, sessions), C1 (44 questions), P7 | Done, merged and live |
| Phase 3: timed practice exam | P2 exam parts (blueprint, selection, timer, exam reducer), P3 active exam + exam history, P5, most of P6 (results, answer review, basic history list) | Done, merged and live |
| Phase 4: results, review, history, readiness | Rest of P6 (scoring module, answer review page, history schema v2, question archive) and readiness analytics (/progress) | Done, merged and live |
| Phase 5: persistence, settings, export/import | P3 preferences, P8 (export/import, recovery, separate clear actions) | Done, merged and live |
| Phase 6: practice integrity | P10 "proctoring-lite" (focus, fullscreen, optional webcam via built-in FaceDetector, retired in Phase 7) and a privacy page | Done, merged and live |
| QA pass | Journeys A–G, responsive and accessibility checks, defect fixes | Done |
| Release preparation | P9: visual clean-up, Vercel configuration, performance review, README / DEPLOYMENT / KNOWN_LIMITATIONS | Done (deployment itself is a manual step) |
| Phase 7: AI proctoring | Strict AI-proctored exam mode replacing the built-in FaceDetector webcam option (D-043); acceptance criteria below | Done, merged and live |
| Phase 8: backend (Supabase, D-044–D-047) | Step 1: schema, RLS, publish script. Step 2: sign-in. Step 3: questions from the database, cached in IndexedDB. Step 4: signed-in users' data synced to the database. Step 5 (server scoring) not started | Steps 1–4 done, merged and live |
| Extras (2026-10-24 and 25) | Vercel Web Analytics (D-048), reliable test runs (D-049), logo, icons and link preview (D-050), sign-out confirmation (AC-B.25) | Done, merged and live |
| Content review | All 2,000 questions checked against their cited AWS pages: 1,995 `checked`, 5 left `unverified` (CONTENT_REVIEW.md), published as bank `2026-10-25.2` | Done; `approved` needs the user's sign-off |
| Docs audit (D-051) | Docs brought in line with the app; version 2.0.0 | Done, merged and live |
| Review due (D-052) | Spaced-repetition review schedule in Learning mode and on the dashboard; version 2.1.0; acceptance criteria below | Done, merged and live (database migration applied 2026-10-26) |
| Reload after a deploy (D-053) | A tab opened before a deploy reloads once instead of showing "Something went wrong"; version 2.1.1; acceptance criteria below | Done, merged and live |
| Admin page (D-054) | Hidden `/admin` page listing signed-in accounts and their activity, for admins only (checked in the database); version 2.2.0; acceptance criteria below | Done, merged and live (database migration applied 2026-10-29) |
| Admin link and `admin:add` (D-055) | Admin link in the navigation for admins only (checked with `is_admin()` in the database); `npm run admin:add` adds the accounts in `ADMIN_EMAIL` from `.env.local`; version 2.3.0; acceptance criteria below | Done and merged (PR #13) |
| UI redesign (D-057) | "Study notes in aubergine" with an exam-paper answer sheet and a true-black dark mode; landing page at `/`; old UI kept on `archive/ui-v2` (tag `v2.4.0`); version 3.0.0 | Implemented on branch `ui/redesign`; to be merged into `master` by pull request after the user approves (old UI stays on `archive/ui-v2` / `v2.4.0`) |
| Developer credit (D-056) | "Made by Shubham Chaudhary" with a portfolio link in the sidebar and mobile menu, and a "Who runs CloudPrep" section on the Privacy page; version 2.4.0; acceptance criteria below | Done and merged (PR #14) |
| Not started | P4 welcome/onboarding and About page, attempt-to-attempt comparison view, Phase 8 step 5 (server scoring, then multi-exam UI) | — |

Changes from the original plan:
- **No backend was planned;** one was added in Phase 8 (D-044–D-047). Guests keep Learning mode, bookmarks and settings in the browser; the dashboard, mock exams, results, history and progress need sign-in.
- **No welcome page, onboarding or About page** (P4). `/` opens the dashboard (or sign-in for guests); the unofficial-tool note is in the sidebar and mobile menu, and the scoring explanation is on the exam and results pages.
- **No Mistakes page:** the Learning mode page has a Mistakes card ("Practise mistakes"), and Progress lists the questions you keep missing.
- **No attempt comparison** (AC-6.4): exam history is a list, and Progress shows recent scores and per-domain results.
- No tablet icon rail: the sidebar shows from 1024px; below that a drawer is used.
- Storage validation is hand-written instead of Zod (D-005).
- Light and system themes were built in Phase 1 (D-017 superseded).
- Settings are saved, storing only changed values (D-034).
- The bank grew from 44 questions (C1) to 2,000 (D-041) instead of the C2–C3 batches, with a new `unverified` status; the review statuses are `draft` → `unverified` → `checked` → `approved` → `retired`, not `reviewed`.
- The full exam is available; a shorter timed exam is offered only if the bank is too small (D-025). No `beforeunload` leave-page warning: a reload restores the exam, so it isn't needed. No multi-tab read-only guard: tabs share the same exam and stay in sync.
- Proctoring-lite (P10) became strict practice, and the webcam option became the AI proctor (Phase 7, D-043).
- **Test tags:** only Phase 7, Phase 8, Review due and reload-after-deploy criteria are tagged in test names (`AC-7.x`, `AC-B.x`, `AC-R.x`, `AC-U.x`); P0–P9 criteria were verified by the tests listed in TEST_PLAN.md, without tags (D-051).

## Principles

- Each phase is small, ends in a working app, and is approved before the next starts.
- **Definition of done (every phase):** `npm run typecheck`, `npm run lint`, `npm test` and `npm run build` pass, and the phase's E2E specs pass. Any manual checks are listed in the phase report. Docs are updated if a decision changed. A git commit is made if you want one.
- Domain logic is built test-first wherever practical.
- Content (questions) is a separate track. Features are built against a small **test fixture bank** so they don't wait on content.

## Phase map

```
P0 Scaffold ─► P1 Design system & shell ─► P2 Domain core ─► P3 Persistence
                                                │                │
                         C1 Content batch 1 ◄───┘                ▼
                                │                  P4 Welcome & Dashboard
                                ▼                                │
                         C2 Content batch 2           P5 Exam Mode ─► P6 Results & History
                                │                                │
                                ▼                       P7 Learning Mode (needs C1)
                         C3 Content batch 3                      │
                                                        P8 Settings & Data
                                                                 │
                                                        P9 Hardening & release
                                                                 │
                                                  P10 (optional) Proctoring-lite, light theme…
```

---

## P0 — Project scaffold and tooling

**Scope**
- `git init`, `.gitignore`, `.editorconfig`, `.nvmrc` (Node 24).
- Vite + React + TypeScript app with strict tsconfig flags (ARCHITECTURE §2).
- Tailwind v4 via `@tailwindcss/vite`; React Router; lucide-react; Zod and Inter, if approved.
- ESLint flat config (typescript-eslint strict-type-checked, react-hooks, jsx-a11y, `no-explicit-any: error`) + Prettier.
- Vitest (jsdom) + RTL + jest-dom + user-event; Playwright (Chromium, WebKit, Pixel-sized mobile) + axe.
- Scripts: `dev`, `build`, `preview`, `typecheck`, `lint`, `format`, `test`, `test:watch`, `test:coverage`, `test:e2e`, `validate:questions`, `check` (runs everything).
- Path alias `@/` → `src/`.

**Acceptance criteria**
- AC-0.1 `npm run check` passes on a clean clone after `npm ci`.
- AC-0.2 One sample Vitest unit test, one RTL test and one Playwright test (the home page loads and has no axe violations) all pass.
- AC-0.3 Using `any` in a source file fails lint.
- AC-0.4 `npm run build` outputs a static `dist/` that `npm run preview` serves correctly.

---

## P1 — Design system and app shell

**Depends on:** P0

**Scope**
- Design tokens in `styles/index.css` (ARCHITECTURE §10.1); base typography; focus styles; reduced motion.
- UI primitives in `components/ui/`: Button (primary / secondary / ghost / danger; sm/md), IconButton, Card, Badge, Alert, ProgressBar, Stat, EmptyState, Dialog, ConfirmDialog, Toast, Switch, SegmentedControl, Select, Skeleton, PageHeader, Kbd, VisuallyHidden.
- `AppLayout` (sidebar / icon rail / mobile drawer, skip link), `ExamLayout` and `OnboardingLayout`.
- Route table with placeholder pages, NotFound, and ErrorBoundary.
- A dev-only `/__ui` page showing every primitive in every state, for visual QA. It is excluded from production builds.

**Acceptance criteria**
- AC-1.1 Every route in ARCHITECTURE §4 renders a placeholder inside the correct layout.
- AC-1.2 At 375px, 768px and 1280px there is no horizontal scroll, and the nav pattern matches §10.2.
- AC-1.3 Every primitive is reachable and operable by keyboard with a visible focus ring. Dialog traps focus, closes on Esc, and returns focus to the element that opened it.
- AC-1.4 Token colour pairs meet WCAG AA, with a contrast table recorded in DECISIONS.md.
- AC-1.5 axe reports no serious or critical issues on all placeholder routes.
- AC-1.6 Component tests cover Button, Dialog/ConfirmDialog, Switch and SegmentedControl.

---

## P2 — Domain core (pure logic)

**Depends on:** P0

**Scope**
- `exam-guide/clf-c02.ts`: domains, weights, task statements, 65 questions, 90 minutes.
- Question types plus `validateBank()` with every rule from PRODUCT_SPEC §10 and the question validation list:
  unique IDs; valid type; option counts (single = 4, multiple ≥ 5); unique option IDs; correct IDs exist; single has exactly 1 correct; multiple has ≥ 2 correct and fewer than the total options; non-empty stem, explanation and incorrect-option explanations; valid domain, task statement belonging to that domain, difficulty and status; ≥ 1 https AWS reference; no "all/none of the above".
- `scripts/validate-questions.ts` + a Vitest test that runs the validator over the real bank, so a bad question fails CI.
- Seeded PRNG + shuffle; blueprint allocation (largest remainder); `selectExamForm(bank, history, seed)`.
- Scoring: `isCorrect`, `scoreAttempt`, `domainBreakdown`, `passed(benchmark)`.
- Timer math; exam session reducer (start / answer / toggleFlag / goTo / submit) with the exactly-once guard.
- Practice reducer; progress update; derived mistakes and accuracy.
- Test fixture bank of about 30 questions covering all domains and both types. It is clearly fake ("Fixture question …") and lives only in `src/test/`.

**Acceptance criteria**
- AC-2.1 Allocation for 65 questions returns 16/19/22/8, and the totals always add up for any `n`, verified by a property-style test over n = 1…200.
- AC-2.2 `selectExamForm` returns unique IDs that match the quota and are deterministic for a given seed. It prefers unseen questions. If the bank is too small it returns a typed `insufficient` result with per-domain shortfalls.
- AC-2.3 The validator rejects one fixture for each rule. Each case has a test with the expected error code.
- AC-2.4 For multiple-response questions, scoring is exact-set match and unanswered counts as incorrect.
- AC-2.5 After `submit`, the session reducer ignores every action. A second `submit` doesn't change anything.
- AC-2.6 Coverage of `src/domain/` is ≥ 95% of lines and ≥ 90% of branches.
- AC-2.7 `domain/` has no imports from React, `storage/` or `features/`, enforced by an ESLint `no-restricted-imports` rule.

---

## P3 — Persistence layer

**Depends on:** P2 (types)

**Scope**
- `driver.ts` (availability probe, in-memory fallback, quota handling), `envelope.ts`, Zod `schemas.ts`, `migrations.ts` framework (v1 baseline).
- Repositories for preferences, activeExam, history (cap 100), progress and bookmarks.
- `store.ts` with subscribe/getSnapshot, plus cross-tab `storage` event handling.
- React hooks (`usePreferences`, `useHistory`, `useProgress`, `useBookmarks`), `StoreProvider`, and an in-memory store for tests.
- Non-blocking storage notices: unavailable, corrupt value recovered, newer schema.

**Acceptance criteria**
- AC-3.1 Malformed JSON, the wrong envelope or a schema-invalid value each produce defaults, a backup key with the raw value, and a notice. Nothing throws.
- AC-3.2 With `localStorage` throwing on access, the app runs normally in memory and shows the "not saved" banner.
- AC-3.3 A `QuotaExceededError` on write leaves the existing stored value intact and shows a toast.
- AC-3.4 A sample v0 → v1 migration test proves the pipeline works, including a fixture of the old shape.
- AC-3.5 A value with a newer `schemaVersion` is never overwritten.
- AC-3.6 A change made in tab A appears in tab B (Playwright, two pages, same context).

---

## C1 / C2 / C3 — Question bank content (parallel track)

> **Replaced:** C1 shipped 44 questions; the bank then grew to 2,000 (D-041) and was reviewed in full on 2026-10-25 (CONTENT_REVIEW.md). Statuses are now `unverified` / `checked` / `approved` instead of `reviewed`.

**Depends on:** P2 (types and validator)

Process for each question: write it from the cited AWS documentation → run the validator → **human review** (you) checks facts against the sources → set `review.status = 'reviewed'` and `lastVerified`.

| Batch | Target reviewed questions | D1 | D2 | D3 | D4 | Unlocks |
|---|---|---|---|---|---|---|
| C1 | 40 | 10 | 12 | 13 | 5 | Learning Mode is useful |
| C2 | +45 → 85 | 20 | 25 | 28 | 12 | First full mock (needs ≥ 16/19/22/8) with some variety |
| C3 | +45 → 130 | 31 | 39 | 44 | 16 | Several mocks with little repetition |

Each batch covers **every** task statement, includes about 15% multiple-response questions, and mixes difficulty (about 30% easy / 50% medium / 20% hard).

**Acceptance criteria (per batch)**
- AC-C.1 `npm run validate:questions` passes.
- AC-C.2 Each question cites at least one AWS URL, and the cited page supports the answer.
- AC-C.3 You sign off on the batch. Until then, its questions stay `draft` and don't appear in production exams.
- AC-C.4 A coverage report (questions per task statement and type) is generated and included with the batch.

---

## P4 — Welcome and Dashboard

> **Built in part:** the dashboard exists; the Welcome page, onboarding redirect and About page were not built.

**Depends on:** P1, P3

**Scope:** Welcome page (value proposition, disclaimer acknowledgement, "Get started"); onboarding redirect logic; Dashboard (readiness card, quick actions, resume-exam banner, per-domain progress, recent attempts) with full empty states; About page.

**Acceptance criteria**
- AC-4.1 A first visit always lands on `/welcome`. After acknowledging, `/` goes to `/dashboard`, and this persists across reloads.
- AC-4.2 A brand-new user sees helpful empty states and no zeros shown as if they were real data.
- AC-4.3 With seeded history and progress, the dashboard numbers match domain-function outputs (component test with a fixture store).
- AC-4.4 The disclaimer is visible on Welcome and About.

---

## P5 — Exam Mode

**Depends on:** P2, P3, P4

**Scope:** Instructions page (rules, bank readiness, start / resume / abandon); ExamSessionProvider; exam page (question panel, radio/checkbox options, "Choose N" guard, flag, prev/next, navigator grid / mobile sheet); header timer with warnings; review screen with filters; submit confirmation; auto-submit; refresh restore; expired-while-away handling; leave-page warning; multi-tab read-only guard.

**Acceptance criteria**
- AC-5.1 Starting an exam creates a session with 65 questions in a 16/19/22/8 split, and `endsAt = startedAt + 90 min`.
- AC-5.2 Answers, flags and the current question survive a reload, and the timer resumes within ±1 second (Playwright + `page.clock`).
- AC-5.3 Fast-forwarding the clock to 0 auto-submits exactly once and navigates to results with a "time expired" notice.
- AC-5.4 Closing the page, advancing the clock past `endsAt` and reopening submits with `expired_while_away`.
- AC-5.5 Submitting twice quickly (double-click, Enter + click, timer + manual) creates exactly one history entry.
- AC-5.6 Multiple-response questions block selecting more than N options and say so accessibly.
- AC-5.7 The exam DOM contains no correct-answer data, verified by a test that searches the rendered HTML for correctness markers.
- AC-5.8 The whole exam can be completed with the keyboard only (Playwright keyboard-only spec).
- AC-5.9 The review screen counts answered, unanswered and flagged questions correctly, and jumping to a question returns to the exam at that question.
- AC-5.10 With an insufficient bank, Start is disabled and the per-domain shortfall is shown.

---

## P6 — Results, answer review and history

**Depends on:** P5

**Scope:** Results summary (score, benchmark, pass/fail label, domain breakdown, time used, the unofficial-score explanation); answer review with filters and a navigator; bookmarking from review; history list; two-attempt comparison; progress updated from exam results.

**Acceptance criteria**
- AC-6.1 Results values equal `scoreAttempt()` for the stored attempt (fixture-based test).
- AC-6.2 Review shows, for each question, your selection, the correct answer(s), the overall explanation, per-option explanations and source links, in the original presented order.
- AC-6.3 The "Incorrect only" filter shows exactly the incorrect and unanswered questions.
- AC-6.4 Comparing two attempts shows the score and per-domain change with correct signs. With fewer than 2 attempts, comparison is disabled and an explanation is shown.
- AC-6.5 An attempt that references a removed question still renders, with a placeholder.
- AC-6.6 Exam answers update question progress, so incorrect answers appear in Mistakes.

---

## P7 — Learning Mode

> These criteria are numbered `AC-L.x`, because `AC-7.x` is used by Phase 7 (AI proctoring) below (D-051). Built without a separate Mistakes page: the Learning mode page has a Mistakes card with "Practise mistakes".

**Depends on:** P3, P6 (shared question rendering), C1

**Scope:** Practice setup (domain / task statement / length / filters); session with Check → feedback → Next; bookmark toggle; session summary; Mistakes page; Bookmarks page; "practise these" entry points.

**Acceptance criteria**
- AC-L.1 A session only contains questions matching the chosen filters. Empty filter results show an empty state, not an empty session.
- AC-L.2 "Check answer" is disabled until the required number of options is selected. After checking, the options are locked and feedback is announced to screen readers.
- AC-L.3 Answering updates progress immediately. A wrong answer adds the question to Mistakes, and a later correct answer in practice removes it.
- AC-L.4 Bookmarks persist across reloads and can be toggled from practice, review and lists.
- AC-L.5 Bookmarks and Mistakes have empty states with guidance.

---

## P8 — Settings and data management

**Depends on:** P3, P7

**Scope:** Preferences form (benchmark slider/select, shuffle options, practice length, reduced motion); export; import with validation, preview and confirmation; reset all data, or per area, with a type-to-confirm dialog.

**Acceptance criteria**
- AC-8.1 Preferences save instantly and apply to new sessions only. A running exam is unaffected.
- AC-8.2 Export downloads `cloudprep-export-YYYY-MM-DD.json`, which matches the bundle schema.
- AC-8.3 Importing that file into an empty browser recreates identical history, progress, bookmarks and preferences (Playwright round-trip).
- AC-8.4 Invalid JSON, the wrong `app`, a newer format, a file over 5 MB and schema-invalid content are each rejected with a specific message, and existing data is untouched.
- AC-8.5 Reset requires typing `RESET`, and afterwards the app returns to the Welcome flow.

---

## P9 — Hardening and release

**Depends on:** P4–P8

**Scope:** Full a11y pass (axe on every route, plus a manual screen-reader smoke test with NVDA, and with VoiceOver if available); responsive QA at 375/768/1024/1440px; performance (lazy routes, bank chunk); error-boundary checks; final copy and disclaimer review; static hosting config (SPA fallback or hash router); README for friends.

**Acceptance criteria**
- AC-9.1 axe finds no serious or critical issues on every route in dark mode.
- AC-9.2 Lighthouse on the production build scores ≥ 95 for Accessibility and Best Practices, and ≥ 90 for Performance on desktop. This is a target, and any shortfall will be explained.
- AC-9.3 The full E2E suite passes on Chromium and WebKit, and the core flows also pass at mobile viewport.
- AC-9.4 Deep-linking to any route on the deployed site works after a refresh.
- AC-9.5 The manual QA checklist in TEST_PLAN.md §7 is completed and recorded.

---

## Phase 7 — AI-proctored exams

Acceptance criteria (tests are tagged with these IDs):

- **AC-7.1 Check-in.** Choosing "AI-proctored exam" leads to a check-in: agree to every rule, allow the camera and microphone (with clear errors for denial, busy devices and failed model loads), load the models, pass a live room check for 3 seconds (lighting, one face, eyes open, no phone, other person, books or screens, quiet room, single display, no virtual camera), and calibrate. Only then can the exam start, in fullscreen. The mode is disabled where the browser lacks camera, fullscreen or WebAssembly support.
- **AC-7.2 Camera and microphone rules.** Sustained conditions become violations: no face (2 s), more than one face (1 s), camera covered (1.5 s), head turned (2 s), eyes off the screen (2 s), eyes closed (3 s), lips moving, voice or noise above the check-in level, and a phone, extra person or book/screen in 2 of 3 object checks. Each episode counts once and must clear before it counts again. Head and eye rules are relative to calibration.
- **AC-7.3 Browser rules.** Tab hidden, window blur, fullscreen exit, the pointer leaving the page, blocked shortcuts (copy, cut, paste, context menu, print, save, find, developer tools, screenshots; logged at most once a second) and a second display are recorded. Blocked shortcuts are prevented; ordinary keys are not.
- **AC-7.4 Verdict.** Strikes within 3 s count as one incident. Strikes 1 and 2 show warnings (the second is the final warning); the third ends the exam. A phone, another person or face, a second display, or a lost camera or microphone ends it at once. The verdict is derived from the saved log, so it survives reloads, and the exam is submitted with reason `proctor_ended` on any page.
- **AC-7.5 Interruptions.** Reopening a proctored exam logs "Exam interrupted" (a strike) and hides the questions until the learner restarts the proctor (camera, microphone, 2-second calibration, fullscreen). Outside fullscreen, the questions are hidden until fullscreen returns. The timer keeps running.
- **AC-7.6 Results.** A proctor-ended attempt is void: it never meets the benchmark, is marked "Ended by proctor" in history, is left out of readiness, and its results page explains why. The proctor report shows each event and what the proctor did (warning, final warning, same incident, exam ended).
- **AC-7.7 Privacy.** Only `{type, at}` is stored. Frames and audio are analysed in memory. Every camera and microphone track, timer and model is released when the exam ends, check-in is left, or loading fails. The privacy page describes the proctor.
- **AC-7.8 Retired webcam option.** The built-in-FaceDetector webcam mode is no longer offered. Logs saved with it still load and display, and an exam in progress with it continues with focus monitoring.

## Phase 8 — Backend (Supabase)

Decision: D-044. Steps:
1. **Foundation (done):** Supabase CLI and `supabase/` folder, schema migration with RLS and grants, `npm run publish:questions`.
2. **Auth (done):** email magic link and Google sign-in, account in the navigation and Settings, signed-in-only pages. Guests keep Learning mode, bookmarks and settings.
3. **Questions from the database (done):** the app loads one exam's bank from Supabase and caches it by `bank_version`; the bank leaves the bundle.
4. **Progress in the database (done, D-047):** signed-in users' data syncs from a local copy, kept apart from guest data; guest data is added to the account on request.
5. **Later:** server scoring (lock `question_keys`), then the multi-exam UI.

Step 1 acceptance criteria (tests are tagged `AC-B.x`, because AC-8.x belongs to P8):
- AC-B.1 The migrations apply to a fresh Postgres and store the exam catalogue and published questions.
- AC-B.2 Each user can read and change only their own rows in every user table; guests can't read user data; a user can't attach rows to another user's attempt; constraints reject inconsistent progress; deleting an account deletes its data.
- AC-B.3 Guests and users read only published exams and questions with a visible status (not retired); revisions need sign-in and include retired questions; only the service role writes content.
- AC-B.4 Every publishable question converts to rows and back without loss; content rows hold no answers or explanations; drafts are never published.
- AC-B.5 Signing up creates a profile.

Step 2 acceptance criteria:
- AC-B.6 Guests can use Learning mode, bookmarks, settings and the privacy page. The dashboard, every mock-exam page, results, history and progress send them to sign-in, which returns them to the requested page afterwards.
- AC-B.7 "Email me a sign-in link" requires a plausible email address, sends a link that returns through `/auth/callback` to the requested page, confirms where it was sent and says to open it in the same browser, and shows errors (including rate limits).
- AC-B.8 "Continue with Google" starts Google sign-in with the same return address and shows any failure.
- AC-B.9 The callback page finishes sign-in and opens the requested page; only paths on this site are accepted; a failed or expired link is explained with a way to try again.
- AC-B.10 The signed-in account is shown in the navigation and in Settings. Signing out works from both, and signed-in-only pages then need sign-in again. A signed-in visitor to `/sign-in` goes straight on.
- AC-B.11 Without Supabase settings the site works for guests and says sign-in isn't set up. The Supabase library is loaded once, in its own chunk; production builds contain no fake sign-in.

Step 3 acceptance criteria:
- AC-B.12 The app loads the exam's questions from Supabase, every page of results, rebuilding and validating each row; invalid rows are left out. The production bundle contains no questions.
- AC-B.13 The bank is cached per exam with its version. Later visits start from the cache and download again only when the published version changes. Unreadable cache entries are discarded; without IndexedDB the app still works.
- AC-B.14 Pages that use questions wait for the first download and show an error with "Try again" if it fails. With a cached bank they keep working when the download fails. Without a question source the site says so; settings still open.
- AC-B.15 An exam is only submitted (including an expired one found on load) once the questions are loaded, and it records the loaded bank's version.
- AC-B.16 `npm run check:published` confirms that the published questions match the repo.

Step 4 acceptance criteria:
- AC-B.18 Signed-in users' practice progress, bookmarks, practice sessions, exam attempts (with integrity logs), the exam in progress and settings are saved to their account: changes are sent shortly after they happen (bursts together), and signing in on another device shows the same data.
- AC-B.19 Changes that can't be sent (offline, server errors) are kept, also across reloads, retried, and sent later. A download never overwrites changes that aren't on the server yet.
- AC-B.20 Guest data and the account's copy are kept apart: signed in, pages show the account's data; after signing out they show the guest's again, and the copy is removed once everything is saved (otherwise kept, without being shown). Another user's copy is never shown.
- AC-B.21 After signing in on a browser with guest data, the user is asked once whether to add it to the account; "Add to my account" merges it, "Not now" adds nothing and Settings offers it again. Guest data is left as it is. Guests, and browsers without guest data, aren't asked.
- AC-B.22 For signed-in users, Settings explains that data is saved to the account and shows whether changes are saved or waiting; clearing and resetting delete the data from the account on every device.
- AC-B.23 Data read from the server is validated like browser storage, and invalid rows are left out. The rows sync writes are accepted by the database schema and read back unchanged.
- AC-B.24 The exam in progress is saved in the browser on every action and to the account, and removed from the account once submitted. Signing out sends unsaved changes first.

Follow-up to step 2 (D-045):
- AC-B.17 Email sign-in is offered only when `VITE_EMAIL_SIGN_IN` is `true`; otherwise the sign-in page offers Google alone.
- AC-B.25 Signing out (navigation or Settings) asks for confirmation first; Cancel keeps the user signed in. The question says whether everything is already saved to the account.

## Review due (spaced repetition, D-052)

Agreed with the user on 2026-10-26: answered questions come back on a schedule, so missed and shaky questions are practised again before they're forgotten. Nothing is hidden: random practice, Mistakes and exams are unchanged.

Acceptance criteria (tests are tagged `AC-R.x`):
- AC-R.1 Every answered question has a review level from 0 to 4, due again 1, 3, 7, 21 or 60 local calendar days after its latest answer. A wrong answer sets level 0; a first correct answer sets level 1; a correct answer moves up one level only if the question was due, so an early answer (such as a retry in the same sitting) doesn't skip ahead. Exam answers count like practice answers.
- AC-R.2 The review queue holds only available questions that are due, ordered by lowest level first, then longest overdue.
- AC-R.3 Progress saved before review levels (browser storage, exported files, and server rows) gets an estimated level: 0 if the latest answer was wrong, one level per correct answer if never wrong (up to 4), otherwise 1. Invalid levels are rejected like other invalid progress.
- AC-R.4 The database stores the level (`question_progress.review_level`, 0–4 or null), rejects other values, and the app estimates a level for rows without one; a wrong latest answer always reads as level 0.
- AC-R.5 Learning mode has a "Review due" card: how many questions are due today, or when the next review is, or how to start the schedule. "Review due questions (n)" starts a session of the most important due questions, up to the default practice length.
- AC-R.6 The dashboard's quick actions show how many questions are due and start the same session; with nothing due, the action opens Learning mode.
- AC-R.7 In the browser, progress saved before the upgrade shows up as due and can be practised.

## Reload after a deploy (D-053)

Reported by the user on 2026-10-26: a tab opened before a deploy showed "Failed to fetch dynamically imported module" when moving to a page it hadn't loaded yet.

Acceptance criteria (tests are tagged `AC-U.x`):
- AC-U.1 A page file that failed to load is recognised from the messages of Chromium, Firefox, WebKit and Vite; other errors are not.
- AC-U.2 The site reloads at most once per 30 seconds for this reason (guard in `sessionStorage`); without `sessionStorage` it doesn't reload by itself.
- AC-U.3 Vite's `vite:preloadError` event starts the reload, also for files loaded outside the routes, without cancelling the error. Files cancelled because the page is navigating away (`beforeunload`, `pagehide`) never start one.
- AC-U.4 The route error page shows "CloudPrep was updated. Loading the latest version…" while reloading. If the guard blocks a reload, it shows the error with Reload and says the user may be offline or the site may have been updated. Other errors never reload by themselves.
- AC-U.5 In the browser, a deploy while the tab is open reloads once and opens the requested page; a file that keeps failing shows the error after one reload, with no loop.

## Admin page (D-054)

Requested by the user on 2026-10-29: a page, in the same app on its own route, to see who uses CloudPrep, only for an admin. Agreed scope: signed-in users with their activity; guests stay anonymous (Vercel Analytics); access by marking the user's Google account as admin in the database, not a password in the app.

Acceptance criteria (tests are tagged `AC-A.x`):
- AC-A.1 `/admin` is under `RequireAuth` (guests go to sign-in) and isn't in the navigation.
- AC-A.2 Only accounts in `public.admins` get data: `admin_user_overview()` raises `42501` for everyone else and can't be called by guests; `admins` can't be read or written through the API, even by admins. A signed-in non-admin sees "No admin access" and no user data.
- AC-A.3 An admin sees totals (users, active in the last 7 days, questions answered, exams taken) and one row per account (name, email, sign-in method, sign-up date, last activity, questions answered, practice sessions, exams, best score without proctor-ended attempts), most recently active first. Load errors show a message with "Try again".
- AC-A.4 Rows from the server go through a hand-written parser; malformed rows are skipped and bad numbers fall back safely.

## Admin link and admin script (D-055)

Requested by the user on 2026-10-29: a button to reach the admin page, and the admin email kept in an env file. Agreed design: the email lives in `.env.local` (never `VITE_`, so never in the public site) and a script adds that account to `public.admins`; the database still decides who is an admin.

Acceptance criteria (tests are tagged `AC-A.x`):
- AC-A.1 (changed) `/admin` is under `RequireAuth` (guests go to sign-in) and isn't in the navigation for guests or non-admins.
- AC-A.5 Signed-in admins see an **Admin** link (sidebar and mobile menu) that opens `/admin`; non-admins and guests don't. The app asks `is_admin()`; errors count as "not an admin".
- AC-A.6 `npm run admin:add` reads `ADMIN_EMAIL` (one or more, comma-separated), `SUPABASE_URL` and `SUPABASE_SECRET_KEY`, adds each matching account to `public.admins` (never removes any), prints the admins, and fails with a clear message if a setting is missing or an email has no account yet. Checked by hand (no automated test: it needs the live project).

## Developer credit (D-056)

Requested by the user on 2026-10-29: show the developer's name and portfolio link in the app.

Acceptance criteria (tests are tagged `AC-D.x`):
- AC-D.1 The sidebar and mobile menu show "Made by Shubham Chaudhary" under the unofficial note; the name links to https://shubhamworks.vercel.app/ in a new tab (`rel="noopener noreferrer"`).
- AC-D.2 The Privacy page has a "Who runs CloudPrep" section with the same link.

## UI redesign (D-057)

Requested by the user on 2026-10-29: make CloudPrep look like a product made by a person, add a landing page, keep the current UI until the new one has been tested in production. Direction chosen from mockups: "Study notes in aubergine" (B2), with the exam's question grid in the "exam paper" style (A), and a true-black dark mode.

Branches: `archive/ui-v2` and tag `v2.4.0` keep the old UI (both on GitHub, never changed). All five steps were built together on `ui/redesign`, which goes into `master` as 3.0.0 through a pull request the user merges, after testing it on the branch's Vercel preview. (The `redesign` integration branch from the original plan isn't needed.)

| Step | Scope | Status |
|---|---|---|
| 1 | Tokens (both palettes, colour roles, radii), fonts (Source Sans 3, Newsreader, IBM Plex Mono), shared components (`Button` pills, `Card`, serif `CardHeader` and `Dialog` titles, `Badge`, `Notice`, `ProgressBar`, `Switch`, `SegmentedControl`, logo tile), brand icons and link preview | Implemented |
| 2 | Sidebar (pill navigation, no icons), mobile menu, account block, serif page headers, exam header (logo, pill timer, progress line) | Implemented |
| 3 | Pages: dashboard (with a "weakest" domain tag and the time used in Recent attempts), Learning mode, exam (answer sheet in the exam-paper style) and results, then the rest | Implemented |
| 4 | Landing page at `/` for guests; signed-in users go to the dashboard | Implemented |
| 5 | Product wording in CLAUDE.md, PRODUCT_SPEC and README; version 3.0.0 | Implemented |

Acceptance criteria (tests are tagged `AC-V.x`):
- AC-V.1 Every text colour token is at least 4.5:1 on `bg`, `surface` and `surface-2`, every on-fill pair (on-accent, on-highlight, on-primary, on-danger, on-flag) is at least 4.5:1, and control borders, meters, focus, ink and the flag border are at least 3:1 against what they sit on, in both themes (`src/styles/tokens.test.ts`).
- AC-V.2 Every page still passes axe with no serious or critical issues in both themes, and all existing tests pass unchanged (behaviour is not changed by a restyle).
- AC-V.3 Fonts are Source Sans 3, Newsreader and IBM Plex Mono, self-hosted (no third-party font requests); cards are rounded, buttons and badges are pills; the exam's answer sheet keeps square cells and mono numbers.
- AC-V.4 Static brand files (favicon, app icons, link preview, manifest, `theme-color`) use the new palette, and `brandAssets.test.ts` still passes.
- AC-V.5 The dashboard tags the weakest practice domain only once at least two domains have 20 answers each; it is the one with the lowest accuracy (`weakestDomain`).
- AC-V.6 Recent attempts on the dashboard show the time used, in whole minutes rounded up.
- AC-V.8 Learning mode sessions show an answer sheet like the exam's: one cell per question marked correct, incorrect, chosen but not checked, or not answered (each with its own icon and label), the current question, a summary and a legend; selecting a cell opens that question.
- AC-V.9 The landing page animates lightly (hero entrance, the demo question picking an answer and counting down, sections and domain bars revealing on scroll, hover lift), ends with everything visible and passing axe, and shows everything at once with no movement under reduced motion.
- AC-V.10 The default theme is System (follows the device); a saved choice (Dark or Light) still wins, both in the app and in `index.html`'s before-paint script; both themes pass axe.
- AC-V.7 Guests opening `/` see the landing page (one h1, "Start learning" to `/practice`, "Sign in", the unofficial note) and it passes axe; signed-in users are sent to `/dashboard`.

## P10 — Optional features (v1.x, pick à la carte)

| Feature | Notes | Status |
|---|---|---|
| Light theme | Tokens already structured for a second palette | Built (dark, light, system) |
| Exam time accommodation (+30 min) | Preference applied when the exam starts | Not built |
| Keyboard shortcuts + help sheet | Must not interfere with screen readers; can be turned off | Not built |
| Custom-length timed quiz | Reuses the exam engine with `n` and a proportional duration | Not built (only the automatic shorter exam, D-025) |
| Task-statement analytics | Derived from progress | Built in part (Progress: frequently missed topics, practice coverage) |
| Proctoring-lite | Opt-in; neutral language | Built as strict practice (D-036), plus the AI proctor (D-043) |

Deferred features are listed in PRODUCT_SPEC §4.3.

## Rough effort

| Phase | Relative size |
|---|---|
| P0 | S |
| P1 | M |
| P2 | M |
| P3 | M |
| P4 | S |
| P5 | L |
| P6 | M |
| P7 | M |
| P8 | S–M |
| P9 | M |
| C1–C3 | Ongoing; review time is the bottleneck |
