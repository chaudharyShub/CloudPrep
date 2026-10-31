# CloudPrep — Test Plan

> Status: **Describes the tests as built** (version 3.1.0) · Last updated: 2026-10-29
> This replaces the first draft of 2026-10-21, which planned spec files and a fixture flag that were never created.

## 1. Strategy at a glance

| Layer | Tool | What it covers | Where |
|---|---|---|---|
| Unit | Vitest | Domain logic (blueprint, selection, session reducer, timer, scoring, attempts, practice, progress, review schedule, readiness, proctor rules, validator, PRNG), storage (envelope, areas, migrations, store, sync, transfer, account copy, question cache), backend mappers and adapters | `src/**/*.test.ts` |
| Content | Vitest + `validate:questions` | Every question in the real bank against the validator | `src/content/questions/bank.test.ts`, `scripts/validate-questions.mjs` |
| Database | Vitest + PGlite | Migrations, RLS, grants, constraints, publish rows and a real sync round trip | `src/backend/schema.test.ts` |
| Component | Vitest + jsdom + Testing Library + user-event | UI primitives and whole pages rendered through `renderApp` | `src/**/*.test.tsx` |
| End-to-end | Playwright (Chromium, WebKit, Pixel 7) | User journeys against a production-like build with a fake sign-in | `tests/e2e/*.spec.ts` |
| Accessibility | `@axe-core/playwright`, jsx-a11y lint | Every page in both themes, exam and dialog states, keyboard-only flows | E2E + lint |
| Static | `tsc -b`, ESLint, Prettier | Types, `any`, layering and import rules, formatting | `npm run check` |
| Content tools (manual) | Node scripts | Reference URLs still load; near-duplicate questions | `scripts/check-references.mjs`, `scripts/check-duplicates.mjs 0.3` |
| Published bank (manual) | Node script | The live bank equals the repo's | `npm run check:published` |

Test philosophy: test behaviour, not implementation. Query by role and label. No snapshot tests for UI. Never skip, delete or loosen a failing test to get a green build.

## 2. Test data and helpers

- **Test bank** (`src/test/bank.ts`, `src/test/fixtures/`): a small fixture bank for most unit and component tests. `FullExam.test.tsx` and `ExamUnavailable.test.tsx` swap in a generated or tiny bank with `vi.mock` (D-040).
- **`renderApp(path, options)`** (`src/test/renderApp.tsx`): renders the real routes with an in-memory store, a ready question bank, and a fake sign-in that is signed in by default. Pass `createFakeAuthClient()` for a guest, `admin` (`createFakeAdminClient({ admin: true, users })`) for the Admin page, a loader to test question loading, or `accounts` (`createAccountManager` with `createFakeUserTables`) to test sync and guest data.
- **E2E build:** `npm run test:e2e` builds `dist-e2e/` with `vite build --mode e2e`. That build uses the bundled questions and a fake sign-in that reads `cloudprep-e2e-auth` from `localStorage`; production builds contain neither (D-045, D-046).
- **E2E fixtures** (`tests/e2e/support/fixtures.ts`): import `test` / `expect` from here. Signed in by default; `test.use({ signedIn: false })` for guests; `test.use({ sync: true })` adds a fake server. Specs that seed storage while signed in use the `cloudprep-account:` keys.
- **AI proctor:** unit tests use fake readings and devices; E2E tests script the models through `window.__cloudprepProctorAnalyzer`, with Chromium's fake camera and a silent fake microphone (`tests/e2e/fixtures/silence.wav`).
- **Design tokens:** `src/styles/tokens.test.ts` reads `src/styles/index.css` as text (Vitest is set to load only that stylesheet; other CSS imports are empty in tests) and checks contrast for both themes (AC-V.1, D-057).
- **Randomness:** everything goes through the seeded PRNG in `src/domain/lib/random.ts`.
- **Time:** unit tests pass `now` explicitly; component tests use fake timers; E2E tests use Playwright's `page.clock`.

## 3. End-to-end specs

| Spec | Covers |
|---|---|
| `app-shell.spec.ts` | Every page passes axe (dark and light), not-found page, sidebar vs menu drawer, skip link, keyboard navigation, dialog focus |
| `admin.spec.ts` | Admin page: guests go to sign-in, non-admins see no data, admins see the user list (AC-A.1–A.3); only admins get the Admin link (AC-A.5) |
| `landing.spec.ts` | Landing page motion: entrance, demo answer, scroll reveals and bars end fully visible and pass axe; reduced motion shows everything at once (AC-V.9) |
| `auth.spec.ts` | Guests get the landing page at `/` (AC-V.7), are sent to sign-in from account-only pages and keep Learning mode; email link request; Google sign-in returns to the page; sign-out (AC-B.6–B.10) |
| `learning-mode.spec.ts` | Domain practice, checking answers, bookmarks, progress after reload, session summary, keyboard-only answers, phone layout, recovery from corrupt saved progress, old progress shown as review due (AC-R.7), the Review due "i" panel fitting a phone screen and passing axe (AC-I.5) |
| `exam.spec.ts` | Full exam (answer, flag, review, confirm, results), restore after reload with absolute timing, low-time warnings and auto-submit at zero, expired while closed, mobile layout |
| `integrity.spec.ts` | Strict practice (fullscreen, exit warning, neutral report); proctored check-in, warnings, ended by a phone; blocked copy and forced proctor restart after reload (AC-7.x); the real models load and analyse the camera (`@real-models`, its own project) |
| `data.spec.ts` | Settings persist; export, reset everything, import; malformed file rejected |
| `sync.spec.ts` | Progress saved to the account and shown on another device; guest data added on request; sign-out removes the copy (AC-B.18, B.20, B.21) |
| `update.spec.ts` | A deploy while the tab is open: the missing page file reloads the site once and opens the page; a file that keeps failing shows the error after one reload (AC-U.5) |
| `qa-journeys.spec.ts` | The QA pass journeys: first visit and empty states, Learning mode with both question types, old results after a new attempt, migrated old-format data and clearing one category, camera permission declined, strict-practice log, reduced motion, keyboard-only exam with visible focus, tablet layout with axe |

Projects: `chromium`, `webkit` and `mobile` (Pixel 7) run everything except `@real-models`; `real-models` runs that test in Chromium.

## 4. Where the main requirements are tested

| Requirement (PRODUCT_SPEC §11) | Tests |
|---|---|
| R-1 Full mock: 65 unique questions, 16 / 19 / 22 / 8 | `blueprint.test.ts`, `select.test.ts`, `FullExam.test.tsx` |
| R-2 Correct time and answers after a reload | `timer.test.ts`, `exam.spec.ts` (restore after reload) |
| R-3 Submitted exactly once | `session.test.ts`, `Exam.test.tsx` ("submits once…", auto-submit, expired while closed) |
| R-4 No answers in exam pages | `session.test.ts` (no correct answers in the session), `Exam.test.tsx` ("never puts correct answers or explanations in the page…") |
| R-5 Every question valid | `validate.test.ts` (one case per rule), `bank.test.ts`, `npm run validate:questions` |
| R-6 Keyboard and axe | `app-shell.spec.ts`, keyboard tests in `learning-mode.spec.ts` and `qa-journeys.spec.ts`, jsx-a11y lint |
| R-7 Export / import round trip | `transfer.test.ts`, `DataManagement.test.tsx`, `data.spec.ts` |
| R-8 Corrupt or unavailable storage | `storage.test.ts`, `driver.test.ts`, `examStorage.test.ts`, `historyStorage.test.ts`, `learning-mode.spec.ts` (corrupt progress) |
| R-9 Users see only their own data | `schema.test.ts` (RLS and grants, AC-B.2, B.3; only admins list users, AC-A.2) |
| R-10 Disclaimer and scoring note | No automated test; checked by hand (§6) |

## 5. Acceptance-criteria tags

Criteria from Phase 7 (AI proctoring, `AC-7.x`), Phase 8 (backend, `AC-B.x`), Review due (`AC-R.x`, D-052) reloading after a deploy (`AC-U.x`, D-053) the admin page and its link (`AC-A.x`, D-054, D-055) the developer credit (`AC-D.x`, D-056, `PrivacyPage.test.tsx`) the "i" explanation (`AC-I.x`, D-058: `InfoTip.test.tsx`, the Learning mode and dashboard page tests, and `learning-mode.spec.ts` on a phone screen with axe) and the UI redesign (`AC-V.x`, D-057: colour contrast of every token pair in `src/styles/tokens.test.ts`, `weakestDomain` and `formatMinutes`, the dashboard, the Learning mode answer sheet, and the landing page and its motion in `LandingPage.test.tsx`, `motion.test.ts`, `landing.spec.ts` and `auth.spec.ts`) are tagged in test titles, for example `it('AC-B.4 content rows hold no answers or explanations', …)`; search for `AC-` to find them. The earlier phases (P0–P9 in IMPLEMENTATION_PLAN.md) were verified by the tests above without tags, and old tests weren't renamed after the fact (D-051). New acceptance criteria are tagged.

## 6. Manual checks (each release)

- [ ] Screen reader smoke test (NVDA with Chrome or Firefox): sign in, start an exam, answer single and multiple-response questions, flag, review, submit, read the results. Not done yet (KNOWN_LIMITATIONS.md).
- [ ] Zoom to 200% and 400% on the exam page without losing content.
- [ ] Real phone: exam navigator, timer visible, no accidental submit.
- [ ] Background tab for 10+ minutes during an exam, and laptop sleep: on return the timer is correct or the exam was submitted.
- [ ] Safari private window: storage-unavailable behaviour is acceptable.
- [ ] Two devices signed in to the same account: progress and history appear on both.
- [ ] A proctored exam with a real camera and microphone.
- [ ] After a question change: `npm run publish:questions`, `npm run check:published`.
- [ ] Occasionally: `node scripts/check-references.mjs` (every cited page loads) and `node scripts/check-duplicates.mjs 0.3`.
- [ ] The unofficial-tool note shows in the sidebar and mobile menu, and the scoring explanation on the exam and results pages.
- [ ] The deployment smoke test in DEPLOYMENT.md.

## 7. Commands

| Command | Purpose |
|---|---|
| `npm test` | Unit, component, content and database tests once |
| `npm run test:watch` | Watch mode |
| `npm run test:coverage` | With a coverage report (v8). No minimum is enforced |
| `npm run test:e2e` | Builds `dist-e2e/` and runs Playwright |
| `npm run validate:questions` | Validator with a coverage report per task statement |
| `npm run check` | typecheck, lint, format check, validate, unit tests, build, E2E. Must pass before merging |

First-time E2E setup: `npx playwright install chromium webkit`. Time limits are sized for a parallel run on a 4-core machine (D-049); close other dev servers while `npm run check` runs.

## 8. Reporting

Each change report states which commands were run and their results, including failures, lists any manual checks, and keeps "implemented" separate from "verified".
