# CloudPrep — Test Plan

> Status: **Draft for approval** · Last updated: 2026-10-21

## 1. Strategy at a glance

| Layer | Tool | What it covers | Where |
|---|---|---|---|
| Unit | Vitest | Pure domain logic: blueprint, selection, scoring, timer, reducers, progress, validator, migrations, envelope | `src/**/*.test.ts` |
| Content | Vitest + `validate:questions` | Every question in the real bank against the validator rules | `src/content/questions/bank.test.ts` |
| Component | Vitest + jsdom + RTL + user-event | UI primitives, feature components, hooks with an in-memory store | `src/**/*.test.tsx` |
| End-to-end | Playwright (Chromium, WebKit, mobile viewport) | User journeys J1–J10, timer and refresh behaviour, multi-tab, import/export | `tests/e2e/*.spec.ts` |
| Accessibility | `@axe-core/playwright` + jsx-a11y lint + manual | Every route, dialogs, exam flow | E2E + manual |
| Static | `tsc --noEmit`, ESLint, Prettier | Types, `any`, layering rules, a11y lint | CI / `npm run check` |

Test philosophy: test behaviour, not implementation. Query by role and label. Never use snapshot tests for UI. Never skip or loosen a failing test to get a green build; any intentional skip needs a linked reason in the test.

## 2. Test data

- **Fixture bank** (`src/test/fixtures/bank.ts`): about 30 clearly fake questions covering all 4 domains, all 19 task statements (at least one each), and both question types. It is used by all unit, component and E2E tests that don't specifically test the real bank. E2E runs inject it through a build-time flag (`VITE_USE_FIXTURE_BANK=1`), so tests stay stable as real content changes.
- **Large fixture generator**: creates N valid synthetic questions for selection and allocation tests (for example, 200 questions).
- **Storage fixtures**: valid v1 envelopes for each key, malformed JSON, wrong envelopes, a newer `schemaVersion`, and a v0 legacy shape for migration tests.
- **Seeded randomness**: all randomness goes through `domain/lib/random.ts` with an explicit seed, so tests are deterministic.
- **Time**: unit tests pass `now` explicitly. Component tests use `vi.useFakeTimers()` + `vi.setSystemTime()`. E2E tests use Playwright `page.clock.install()` / `fastForward()` / `setFixedTime()`.

## 3. Unit test matrix (domain)

| Module | Key cases |
|---|---|
| `blueprint` | 65 → 16/19/22/8; sum invariant for n = 1…200; ties resolved deterministically |
| `select` | Exact quotas; unique IDs; only `reviewed` questions; deterministic per seed; prefers unseen and then least recently seen; even task-statement spread; `insufficient` result with shortfalls |
| `scoring` | Single correct/incorrect/unanswered; multiple exact match, subset, superset, disjoint; per-domain breakdown; benchmark edges (69.9% vs 70%) |
| `timer` | remaining clamps at 0; warning thresholds at 10:00/5:00 boundaries; formatting `mm:ss` and `h:mm:ss` |
| `session` reducer | start; answer replaces (single) or toggles (multiple, capped at N); flag toggle; goTo bounds; visited tracking; post-submit actions are ignored; double submit does nothing |
| `practice` / `progress` | Attempts/correct counters; lastResult transitions; mistakes in and out; accuracy by domain/task; handles unknown question IDs |
| `validate` | One failing fixture per rule (about 15 rules) with stable error codes; an aggregate report lists all issues, not just the first |
| `random` | Same seed gives the same sequence; shuffle is a permutation and doesn't change its input |
| Storage `envelope` / `migrations` / `driver` / `transfer` | AC-3.1–3.5 and AC-8.4 cases; quota error; unavailable storage; backup-key pruning (keep 3) |

Coverage gates (Vitest, enforced in `test:coverage`): `src/domain/**` and `src/storage/**` need ≥ 95% lines and ≥ 90% branches. There is no global gate for UI; behaviour coverage comes from E2E tests.

## 4. Component tests

| Component | Key behaviours |
|---|---|
| Button / IconButton | Variants render; disabled state; IconButton requires an accessible label (type-level + test) |
| Dialog / ConfirmDialog | Opens/closes; Esc; focus returns; confirm/cancel callbacks; type-to-confirm variant |
| AnswerOptions | Radio vs checkbox by type; "Choose N" cap with an accessible message; keyboard arrows (radio) and space (checkbox); no correctness classes in exam mode |
| QuestionNavigator | Shows answered/unanswered/flagged/current states with text, not colour alone; activating an item navigates |
| ExamTimer | Displays from `endsAt`; warning styles at thresholds; live region announces only at thresholds |
| ExplanationPanel | Shows the correct option(s), per-option explanations and links with `rel` attributes |
| Dashboard cards | Empty vs populated states from a fixture store |
| DataManagement | Import preview counts; error messages per failure type; reset requires the exact text |
| Storage banners | Unavailable / recovered / newer-schema notices render and can be dismissed |

## 5. End-to-end specs (Playwright)

| Spec | Journey | Highlights |
|---|---|---|
| `onboarding.spec` | J1 | First visit → welcome → dashboard; persists after reload; storage-blocked variant shows the banner |
| `exam-happy-path.spec` | J2, J3, J5 | Start → answer all (mixed types) → flag → review → submit → results → review explanations |
| `exam-timer.spec` | J4 | `page.clock` fast-forward to 10:00/5:00 warnings → 0 → single auto-submit → results notice |
| `exam-restore.spec` | J10 | Answer 5 questions, flag 2, reload → same question, answers and flags; remaining time ±1s |
| `exam-expired-away.spec` | J4/J10 | Close page, advance clock past `endsAt`, reopen → submitted as `expired_while_away` |
| `exam-double-submit.spec` | J3 | Double-click submit + timer expiry at the same moment → exactly 1 history entry |
| `exam-keyboard.spec` | J3 | Complete a short exam using only the keyboard |
| `exam-no-leak.spec` | J3 | The exam page HTML contains no correct-answer markers |
| `exam-multitab.spec` | J10 | A second tab with the same session becomes read-only |
| `practice.spec` | J6 | Domain practice → wrong answer → appears in Mistakes → correct → removed |
| `bookmarks.spec` | J7 | Bookmark from practice and review → list → practise bookmarks |
| `history-compare.spec` | J8 | Two attempts → compare → correct changes |
| `data-transfer.spec` | J9 | Export → new context → import → identical dashboard; invalid file rejected; reset flow |
| `responsive.spec` | All | Key pages at 375/768/1280: no horizontal overflow; nav pattern correct |
| `a11y.spec` | All | axe on every route (plus exam/review/dialog states): zero serious or critical issues |

Browsers: Chromium and WebKit run the full suite, and a mobile Chromium viewport runs the core flows. Firefox is optional because it is slower on Windows; add it if time allows.

## 6. Acceptance-criteria traceability

Every acceptance criterion in IMPLEMENTATION_PLAN.md is tagged in its test's title, for example `test('AC-5.5 creates exactly one attempt on double submit', …)`. Search for `AC-` to map criteria to tests. Criteria that can only be checked manually are listed in §7 with a recorded result in each phase report.

## 7. Manual QA checklist (each release)

- [ ] Screen reader smoke test (NVDA + Firefox/Chrome on Windows): welcome, start exam, answer single and multiple questions, flag, review, submit, read results.
- [ ] Keyboard-only full mock with no mouse.
- [ ] Zoom to 200% and 400% (reflow) on the exam page without losing content.
- [ ] Real-device mobile check: exam navigator sheet, timer visible, no accidental submit.
- [ ] Background tab for 10+ minutes during an exam; on return, the timer is correct.
- [ ] Laptop sleep during an exam; on wake, the timer is correct or the exam has auto-submitted.
- [ ] Safari private window: the storage-unavailable or limited behaviour is acceptable.
- [ ] Spot-check 10 random reviewed questions against their source links.
- [ ] Disclaimer text present on Welcome, About and Results.

## 8. Commands

| Command | Purpose |
|---|---|
| `npm test` | Unit + component (+ content validation) once |
| `npm run test:watch` | Watch mode |
| `npm run test:coverage` | With coverage gates |
| `npm run test:e2e` | Playwright (builds + previews first) |
| `npm run validate:questions` | Content validator with a readable report |
| `npm run check` | typecheck + lint + test + build + e2e |

## 9. Reporting

Each phase report states which commands were run and their results, including failures. It lists any manual checks performed and any criteria not yet verified. "Implemented" and "verified" are reported separately.
