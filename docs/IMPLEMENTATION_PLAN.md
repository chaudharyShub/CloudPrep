# CloudPrep — Implementation Plan

> Status: **In progress** · Last updated: 2026-10-21

## Progress

The user's phase prompts group the plan's phases differently (docs/DECISIONS.md D-021):

| User phase | Covers plan phases | Status |
|---|---|---|
| Phase 1: foundation & design system | P0, P1 | Done (awaiting review) |
| Phase 2: question bank & Learning Mode | P2 (questions, validation, practice logic), P3 (storage for progress, bookmarks, sessions), C1 (44 questions), P7 | Done (awaiting review) |
| Phase 3: timed practice exam | P2 exam parts (blueprint, selection, timer, exam reducer), P3 active exam + exam history, P5, most of P6 (results, answer review, basic history list) | Done (awaiting review) |
| Phase 4: results, review, history, readiness | Rest of P6 (scoring module, answer review page, history schema v2, question archive) and readiness analytics (/progress) | Done (awaiting review) |
| Phase 5: persistence, settings, export/import | P3 preferences, P8 (export/import, recovery, separate clear actions) | Done (awaiting review) |
| Phase 6: practice integrity | P10 "proctoring-lite" (focus, fullscreen, optional webcam via built-in FaceDetector, retired in Phase 7) and a privacy page | Done (awaiting review) |
| QA pass | Journeys A–G, responsive and accessibility checks, defect fixes | Done |
| Release preparation | P9: visual clean-up, Vercel configuration, performance review, README / DEPLOYMENT / KNOWN_LIMITATIONS | Done (deployment itself is a manual step) |
| Phase 7: AI proctoring | Strict AI-proctored exam mode replacing the built-in FaceDetector webcam option (D-043); acceptance criteria below | Done (awaiting review) |
| Phase 8: backend (Supabase, D-044) | Step 1: schema, RLS, publish script (acceptance criteria below). Steps 2–5 (auth, questions from the database, progress in the database, server scoring) not started | Step 1 done (awaiting review) |
| Not started | P4 (welcome/onboarding), attempt-to-attempt comparison view, C2–C3 content (more questions) | — |

Changes from the original plan so far:
- No tablet icon rail: the sidebar shows from 1024px; below that a drawer is used (simpler, no tooltips needed).
- No ExamLayout or Welcome page yet (they arrive with Exam Mode / P4).
- Storage validation is hand-written instead of Zod (D-005, interim).
- C1 has 44 questions (plan said 40) and is skewed to easy: 24 easy / 18 medium / 2 hard.
- Settings preferences are still not persisted; only practice progress, bookmarks and session summaries are.
- Phase 3: the full exam can't start until the bank has 16 / 19 / 22 / 8 questions; a shorter timed exam is offered meanwhile (D-025). No `beforeunload` leave-page warning: a reload restores the exam, so it isn't needed. Results show a basic history list; comparing two attempts is still to do (P6).

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

**Depends on:** P3, P6 (shared question rendering), C1

**Scope:** Practice setup (domain / task statement / length / filters); session with Check → feedback → Next; bookmark toggle; session summary; Mistakes page; Bookmarks page; "practise these" entry points.

**Acceptance criteria**
- AC-7.1 A session only contains questions matching the chosen filters. Empty filter results show an empty state, not an empty session.
- AC-7.2 "Check answer" is disabled until the required number of options is selected. After checking, the options are locked and feedback is announced to screen readers.
- AC-7.3 Answering updates progress immediately. A wrong answer adds the question to Mistakes, and a later correct answer in practice removes it.
- AC-7.4 Bookmarks persist across reloads and can be toggled from practice, review and lists.
- AC-7.5 Bookmarks and Mistakes have empty states with guidance.

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
2. **Auth:** email magic link and Google sign-in, profile, protected routes. Guests keep Learning mode only.
3. **Questions from the database:** the app loads one exam's bank from Supabase and caches it by `bank_version`; the bank leaves the bundle.
4. **Progress in the database:** remote repositories behind `src/storage/`, a local copy of the exam in progress, and a one-time import of local data on first sign-in.
5. **Later:** server scoring (lock `question_keys`), then the multi-exam UI.

Step 1 acceptance criteria (tests are tagged `AC-B.x`, because AC-8.x belongs to P8):
- AC-B.1 The migrations apply to a fresh Postgres and store the exam catalogue and published questions.
- AC-B.2 Each user can read and change only their own rows in every user table; guests can't read user data; a user can't attach rows to another user's attempt; constraints reject inconsistent progress; deleting an account deletes its data.
- AC-B.3 Guests and users read only published exams and questions with a visible status (not retired); revisions need sign-in and include retired questions; only the service role writes content.
- AC-B.4 Every publishable question converts to rows and back without loss; content rows hold no answers or explanations; drafts are never published.
- AC-B.5 Signing up creates a profile.

## P10 — Optional features (v1.x, pick à la carte)

| Feature | Notes |
|---|---|
| Light theme | Tokens already structured for a second palette |
| Exam time accommodation (+30 min) | Preference applied when the exam starts |
| Keyboard shortcuts + help sheet | Must not interfere with screen readers; can be turned off |
| Custom-length timed quiz | Reuses the exam engine with `n` and a proportional duration |
| Task-statement analytics | Derived from progress |
| Proctoring-lite | ARCHITECTURE §13; opt-in; neutral language |

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
