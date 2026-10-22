# CloudPrep — Product Specification

> Status: **Draft for approval** · Last updated: 2026-10-21
> CloudPrep is an unofficial practice tool. It is not affiliated with, endorsed by, or sponsored by Amazon Web Services.

## 1. Purpose

CloudPrep is a browser-based practice simulator for the **AWS Certified Cloud Practitioner (CLF-C02)** exam. It is built for one person's preparation and is shared with a small group of friends as a static website. Each person's data stays in their own browser.

### 1.1 Goals

1. Simulate the real exam's format, length, timing and pressure as closely as a browser allows.
2. Help the learner find and fix weak areas by domain and task statement.
3. Teach through high-quality, original, source-cited explanations.
4. Work entirely in the browser: no account, no server, no cost.

### 1.2 Non-goals (v1)

- A backend, accounts, sync between devices, or leaderboards.
- A tamper-proof or certified exam environment.
- Reproducing AWS's scaled-scoring algorithm, which is proprietary.
- Using real, leaked or "dump" exam questions.
- AI-generated questions or explanations at runtime.
- Other AWS certifications. The data model leaves room for them, but they are not built.

## 2. Verified exam facts (source of truth)

Source: the official CLF-C02 exam guide, <https://docs.aws.amazon.com/aws-certification/latest/cloud-practitioner-02/>, checked on 2026-10-21.

| Fact | Value | How CloudPrep uses it |
|---|---|---|
| Total questions | 65 | A full mock has 65 questions |
| Scored / unscored | 50 scored, 15 unscored, not identified | All 65 are scored for practice. No question is labelled "unscored". |
| Duration | 90 minutes | Default timer is 90:00 |
| Multiple choice | 1 correct + 3 distractors (4 options) | Enforced by the validator |
| Multiple response | 2 or more correct out of 5 or more options | Enforced by the validator |
| Unanswered | Scored as incorrect; no penalty for guessing | Same rule |
| Result | Pass/fail; scaled score 100–1,000; passing is 700 | Not reproduced. We show an unofficial practice score (see §6). |
| Scoring model | Compensatory: you don't need to pass each section | Pass/fail uses only the overall practice score |
| Domain weights (of scored content) | D1 24% · D2 30% · D3 34% · D4 12% | Used to balance question selection (§5.3) |

### 2.1 Domains and task statements

| Domain | Task statements |
|---|---|
| **1. Cloud Concepts (24%)** | 1.1 Benefits of the AWS Cloud · 1.2 Design principles (Well-Architected) · 1.3 Migration benefits and strategies (CAF) · 1.4 Cloud economics |
| **2. Security and Compliance (30%)** | 2.1 Shared responsibility model · 2.2 Security, governance and compliance concepts · 2.3 Access management · 2.4 Security components and resources |
| **3. Cloud Technology and Services (34%)** | 3.1 Deploying and operating · 3.2 Global infrastructure · 3.3 Compute · 3.4 Database · 3.5 Network · 3.6 Storage · 3.7 AI/ML and analytics · 3.8 Other in-scope service categories |
| **4. Billing, Pricing, and Support (12%)** | 4.1 Pricing models · 4.2 Billing, budget and cost management · 4.3 Technical resources and AWS Support options |

> **Content freshness:** the current guide uses newer names such as *AWS Business Support+*, *AWS Unified Operations*, *Amazon SageMaker AI*, *Amazon Quick Sight* and *Amazon WorkSpaces Secure Browser*. Questions must use the names in the current guide and documentation, not older study material.

## 3. Users

| User | Needs |
|---|---|
| **Primary: the owner** | Realistic mocks, focused weak-area practice, progress over weeks |
| **Friends** | Open a link and practise immediately, with no setup or sign-up; their progress stays private |

Assumption: users have a modern evergreen browser (the latest two versions of Chrome, Edge, Firefox or Safari) on desktop, tablet or phone.

## 4. Feature scope

Priority: **Core** = required for v1 · **Optional** = v1.x if time allows · **Deferred** = not planned for v1.

### 4.1 Core

| Area | Feature |
|---|---|
| Onboarding | Welcome screen on first visit, an unofficial-tool disclaimer that must be acknowledged, and a short "how it works" |
| Dashboard | Readiness summary, per-domain accuracy, recent attempts, quick actions, and empty states for new users |
| Exam Mode | Instructions → 65-question timed session → review screen → submit → results |
| Exam Mode | Single-answer (radio) and multiple-response (checkbox, "Choose TWO" style) questions |
| Exam Mode | Question navigator grid, previous/next, flag for review, answered/unanswered/flagged states |
| Exam Mode | Timestamp-based 90-minute timer, low-time warnings, auto-submit at 0, one submission only |
| Exam Mode | Restores the in-progress exam after a refresh or crash, including when it expired while closed |
| Results | Practice score, pass/fail against the benchmark, per-domain breakdown, time used |
| Results | Question-by-question review with your answer, the correct answer, per-option explanations and source links |
| History | List of past attempts, comparison of two attempts, score trend |
| Learning Mode | Practice by domain or task statement, with immediate feedback and explanations |
| Learning Mode | Mistakes review (questions currently answered wrong), bookmarks, per-question progress |
| Settings | Practice pass benchmark, option shuffling, default practice session length, reduced motion |
| Data | Export to a JSON file; import a validated JSON file with a preview and confirmation; reset with confirmation |
| Quality | Responsive design, keyboard operable, WCAG 2.2 AA contrast, visible focus |
| Legal | About page with the disclaimer, sources and limitations of the practice score |

### 4.2 Optional (v1.x)

- Light theme. The app is dark-first; light theme comes later.
- Exam time accommodation setting (+30 minutes), mirroring AWS's ESL accommodation. It is labelled as a preference.
- Keyboard shortcuts in the exam (next/previous/flag/select options), with a help sheet.
- Custom-length timed quizzes, for example 20 questions in 28 minutes, scaled to the real pace.
- Analytics by task statement.
- **Proctoring-lite** (opt-in): fullscreen reminder, logging when the tab is hidden or loses focus, and an integrity-event timeline on the results page.
- **AI-proctored exams** (opt-in, added in Phase 7, D-043): check-in, then a strict on-device AI proctor (camera and microphone) that warns twice and then ends the exam. Nothing is recorded or stored except event types and times.

### 4.3 Deferred

- Merging imported data into existing data (v1 import replaces it).
- Installable PWA / offline use.
- Spaced-repetition scheduling.
- An in-app editor for the question bank.
- Other certifications, i18n, cloud sync.

## 5. Exam Mode specification

### 5.1 Rules

- 65 questions and 90:00, using only questions with `review.status = "reviewed"`.
- No pause. The real exam has none, and the timer keeps running while the tab is closed.
- Answers save instantly. The learner can change answers until submission.
- No feedback, correctness hints or explanations until the exam is submitted.
- Unanswered questions count as incorrect.
- Multiple-response questions are all-or-nothing: the selection must match the correct set exactly. This is an assumption; the guide does not describe partial credit.
- Multiple-response UI states the required number ("Choose TWO") and stops more than that number being selected. It shows a hint if fewer are selected.
- Only one active exam at a time. Starting a new one while one is in progress asks whether to resume or abandon it.

### 5.2 Timer behaviour

- Timing is based on `endsAt = startedAt + duration` (epoch milliseconds), stored with the session.
- The time remaining is always `endsAt − now`. A 1-second interval only triggers re-renders and is never the source of truth.
- The timer recalculates on `visibilitychange`, `focus` and page load, so it handles background-tab throttling and sleep.
- Warnings appear at 10 minutes and 5 minutes. They are announced politely to screen readers once each, not every second.
- At 0 the exam auto-submits once. A status guard (`in_progress → submitted`) makes repeated submission impossible.
- On reload after `endsAt`, the exam is submitted with the saved answers and the reason `expired_while_away`. A notice explains what happened.
- Limitation, documented in the app: the timer trusts the device clock. Changing the system clock affects it. This is acceptable for a self-practice tool.

### 5.3 Question selection (blueprint)

The domain weights apply to the **50 scored** questions on the real exam. CloudPrep applies them to all 65 questions using the largest-remainder method:

| Domain | Weight | Exact share of 65 | Allocated |
|---|---|---|---|
| D1 Cloud Concepts | 24% | 15.6 | **16** |
| D2 Security & Compliance | 30% | 19.5 | **19** |
| D3 Technology & Services | 34% | 22.1 | **22** |
| D4 Billing, Pricing & Support | 12% | 7.8 | **8** |
| **Total** | 100% | 65 | **65** |

This is an approximation. The real distribution of the 15 unscored questions is unknown.

Inside each domain:
- Spread questions across task statements as evenly as the bank allows.
- Prefer questions the learner hasn't seen in exam mode, then the ones seen least recently.
- Include multiple-response questions where available. Their real share is not published, so CloudPrep targets roughly 10–20% as a practice assumption and does not enforce it.
- Shuffle question order, and option order if that setting is on, with a seeded random generator. The seed is stored so the session can be restored exactly.

**Bank too small:** if any domain has fewer reviewed questions than its quota, the full mock is disabled. The page explains why and shows per-domain counts. Learning Mode still works.

## 6. Scoring (unofficial)

- **Practice score** = correct ÷ total questions, shown as a percentage, for example "78% (51/65)".
- **Practice benchmark** = a configurable pass threshold. The default is **70%** and the range is 50–90%.
- **Per-domain accuracy** is shown as information only. Pass/fail ignores it, matching the compensatory model.
- Every result screen and the About page explain this:
  > "AWS reports a scaled score from 100–1,000 with 700 to pass, computed with a proprietary method across 50 scored questions. CloudPrep's practice score is simple percent-correct across all 65 questions. It is not a prediction of your real score."
- CloudPrep will **not** show a number out of 1,000. A fake scaled score would suggest accuracy it doesn't have. See DECISIONS.md, D-008.

## 7. Learning Mode specification

- **Setup:** pick all domains, one domain, or specific task statements; choose a length of 5, 10 or 20 questions or "all"; optionally restrict to unseen questions, mistakes or bookmarks.
- **Per question:** select answer(s) → **Check answer** → correct/incorrect state, the correct option(s) highlighted, the overall explanation, per-option explanations and source links → **Next**.
- **Bookmark** button on every question, in practice and in post-exam review.
- **Session summary:** score, list of missed questions, "Practise these again".
- **Mistakes:** a question is "in mistakes" when its most recent answer, in either practice or an exam, was incorrect. It leaves the list when answered correctly in practice.
- **Progress:** each question tracks attempts, number correct, last result and last answered time. Per-domain and per-task-statement accuracy are calculated from this.

## 8. Core user journeys

Each journey lists its main path and the states it must handle.

| # | Journey | Main path | Required states |
|---|---|---|---|
| J1 | First visit | `/` → Welcome (disclaimer + how it works) → "Get started" → Dashboard | Storage unavailable warning (app still works, nothing persists) |
| J2 | Start mock | Dashboard → "Full mock exam" → Instructions (rules, time, question types, no-pause) → "Start exam" | Bank too small (disabled + reason); existing in-progress exam (Resume / Abandon with confirmation) |
| J3 | Take exam | Answer → flag → navigate via grid → "Review" screen (all / unanswered / flagged filters) → Submit → confirm dialog (shows unanswered count) | Save failure toast; leave-page warning (`beforeunload`) |
| J4 | Time expires | Timer hits 0 → auto-submit → Results with a "Time expired" notice | Expired while tab hidden or browser closed (submitted on next load) |
| J5 | Review results | Results → per-question review (filter: all / incorrect / flagged / by domain) → Dashboard | Question removed from bank since attempt ("no longer available" placeholder) |
| J6 | Domain practice | Dashboard / Practice → choose domain or task → session → summary → "Review mistakes" | Domain with no questions; session interrupted (not restored in v1, by design) |
| J7 | Bookmarks | Bookmarks page → list by domain → "Practise bookmarks" | Empty state with a hint for adding bookmarks |
| J8 | History | History → list of attempts → select two → side-by-side comparison (score, per-domain, time) | Empty; only one attempt (comparison disabled with explanation) |
| J9 | Settings / data | Settings → change prefs (saves instantly) → Export (downloads `.json`) / Import (file → validate → preview → confirm replace) / Reset (type-to-confirm) | Invalid file, wrong app, newer schema version, file too large |
| J10 | Refresh mid-exam | Reload → session restored to the same question with answers, flags and remaining time | Corrupt saved session (keeps a backup copy, explains, offers to discard); expired session (J4) |

## 9. Acceptance criteria (product level)

- AC-P1: A new user can go from first visit to a started mock exam in 3 clicks or fewer, plus the disclaimer.
- AC-P2: A full mock always contains exactly 65 unique, reviewed questions in a 16/19/22/8 domain split.
- AC-P3: After a reload, the remaining time is within ±1 second of the expected value, and no answers are lost.
- AC-P4: Auto-submission happens exactly once, even if several triggers fire at the same time.
- AC-P5: No correctness information is visible anywhere in Exam Mode before submission, including in the DOM and in ARIA text.
- AC-P6: Every question in the bank passes automated validation, and the build fails if one doesn't.
- AC-P7: Every screen is fully operable by keyboard and passes automated axe checks with no serious or critical issues.
- AC-P8: Exported data can be imported into a fresh browser and reproduces history, bookmarks, progress and preferences.
- AC-P9: Corrupt or unavailable storage never crashes the app or causes silent data loss. Corrupt values are backed up before defaults are used.
- AC-P10: The unofficial-tool disclaimer appears on the Welcome page and the About page, and in the footer of the results page.

## 10. Content policy for questions

- Every question is original and written in CloudPrep's own words from public AWS documentation and the exam guide.
- Every question cites at least one `docs.aws.amazon.com` or `aws.amazon.com` URL.
- Every question has an overall explanation, and every incorrect option has its own explanation.
- Questions start as `draft`. A question becomes `reviewed` only after a human checks it against the cited sources, and only reviewed questions appear in exams. Drafts can appear in dev builds for authoring.
- No "all of the above" or "none of the above", because options are shuffled.
- Questions are added in reviewed batches. The bank is never padded to make the app look complete.
