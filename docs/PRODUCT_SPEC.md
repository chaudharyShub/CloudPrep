# CloudPrep — Product Specification

> Status: **Describes the app as built** (version 4.4.0) · Last updated: 2026-11-14
> CloudPrep is an unofficial practice tool. It is not affiliated with, endorsed by, or sponsored by Amazon Web Services.
>
> This replaces the first draft of 2026-10-21. What changed from that plan is in IMPLEMENTATION_PLAN.md ("Changes from the original plan") and the reasons are in DECISIONS.md.

## 1. Purpose

CloudPrep is a browser-based practice simulator for AWS certification exams: **AWS Certified Cloud Practitioner (CLF-C02)**, and, from version 4.0.0, **AWS Certified Solutions Architect – Associate (SAA-C03)** and **AWS Certified Developer – Associate (DVA-C03)** (D-066). It started as one person's preparation tool and is now a free, public product with its own landing page (non-commercial).

Every exam gets the same features: its own question bank, Learning mode with Review due, timed and proctored mock exams, results, answer review, history, progress and readiness, bookmarks and sync. All three are on the live site: CLF-C02 with 2,000 questions, SAA-C03 and DVA-C03 with 1,000 each (D-066, D-070, D-071).

### 1.1 Goals

1. Simulate the real exam's format, length, timing and pressure as closely as a browser allows.
2. Help the learner find and fix weak areas by domain and task statement.
3. Teach through high-quality, original, source-cited explanations.
4. Cost nothing to run: a static site on Vercel and a free-tier Supabase project, with no paid APIs.
5. Let anyone practise straight away as a guest, and let signed-in users keep their progress on every device.

### 1.2 Non-goals

- Leaderboards, sharing results, or any social features.
- A tamper-proof or certified exam environment.
- Reproducing AWS's scaled-scoring algorithm, which is proprietary.
- Using real, leaked or "dump" exam questions (D-042).
- AI-generated questions or explanations at runtime.
- Other AWS certifications beyond these three for now. Adding one is mostly content: an exam guide object in `src/domain/exam-guide/` and a question bank (D-066).

## 2. Verified exam facts (source of truth)

The facts live in code, one guide object per exam (`src/domain/exam-guide/`), and are tested (`examGuide.test.ts`).

| Exam | Questions | Time | Passing score | Domain weights | Guide checked |
|---|---|---|---|---|---|
| CLF-C02 Cloud Practitioner | 65 (50 scored) | 90 minutes | 700 | 24 / 30 / 34 / 12% | 2026-10-21 |
| SAA-C03 Solutions Architect – Associate | 65 (50 scored) | 130 minutes | 720 | 30 / 26 / 24 / 20% | 2026-11-05 (guide revision of 29 October 2026) |
| DVA-C03 Developer – Associate | 65 (50 scored) | 130 minutes | 720 | 30 / 26 / 22 / 22% | 2026-11-05 (replaces DVA-C02, whose last exam day is 30 November 2026) |

SAA-C03 domains: 1 Design Secure Architectures (tasks 1.1–1.3) · 2 Design Resilient Architectures (2.1–2.2) · 3 Design High-Performing Architectures (3.1–3.5) · 4 Design Cost-Optimized Architectures (4.1–4.4). DVA-C03 domains: 1 Development with AWS Services (1.1–1.3) · 2 Security (2.1–2.3, including AI services) · 3 Testing and Deployment (3.1–3.3) · 4 Troubleshooting and Optimization (4.1–4.3). Sources: <https://docs.aws.amazon.com/aws-certification/latest/solutions-architect-associate-03/solutions-architect-associate-03.html> and <https://docs.aws.amazon.com/aws-certification/latest/developer-associate-03/developer-associate-03.html>; exam times from the certification pages.

The rest of this section gives the CLF-C02 facts in detail. Source: the official CLF-C02 exam guide, <https://docs.aws.amazon.com/aws-certification/latest/cloud-practitioner-02/>, checked on 2026-10-21. The other two exams share the format rows (question types, unanswered, compensatory scoring).

| Fact | Value | How CloudPrep uses it |
|---|---|---|
| Total questions | 65 | A full mock has 65 questions |
| Scored / unscored | 50 scored, 15 unscored, not identified | All 65 are scored for practice. No question is labelled "unscored". |
| Duration | 90 minutes | The timer is 90:00 |
| Multiple choice | 1 correct + 3 distractors (4 options) | Enforced by the validator |
| Multiple response | 2 or more correct out of 5 or more options | Enforced by the validator |
| Unanswered | Scored as incorrect; no penalty for guessing | Same rule |
| Result | Pass/fail; scaled score 100–1,000; passing is 700 | Not reproduced. CloudPrep shows an unofficial practice score (§6). |
| Scoring model | Compensatory: you don't need to pass each section | Pass/fail uses only the overall practice score |
| Domain weights (of scored content) | D1 24% · D2 30% · D3 34% · D4 12% | Used to balance question selection (§5.3) |

### 2.1 Domains and task statements

| Domain | Task statements |
|---|---|
| **1. Cloud Concepts (24%)** | 1.1 Benefits of the AWS Cloud · 1.2 Design principles (Well-Architected) · 1.3 Migration benefits and strategies (CAF) · 1.4 Cloud economics |
| **2. Security and Compliance (30%)** | 2.1 Shared responsibility model · 2.2 Security, governance and compliance concepts · 2.3 Access management · 2.4 Security components and resources |
| **3. Cloud Technology and Services (34%)** | 3.1 Deploying and operating · 3.2 Global infrastructure · 3.3 Compute · 3.4 Database · 3.5 Network · 3.6 Storage · 3.7 AI/ML and analytics · 3.8 Other in-scope service categories |
| **4. Billing, Pricing, and Support (12%)** | 4.1 Pricing models · 4.2 Billing, budget and cost management · 4.3 Technical resources and AWS Support options |

> **Content freshness:** the current guide uses newer names such as *AWS Business Support+*, *AWS Unified Operations*, *Amazon SageMaker AI*, *Amazon Quick Sight* and *Amazon WorkSpaces Secure Browser*. Questions use the names in the current guide and documentation, and note services AWS has closed or is ending (for example Snowball, and the Support plan changes on 1 January 2027).

## 3. Users

| User | Needs |
|---|---|
| **Primary: the owner** | Realistic mocks, focused weak-area practice, progress over weeks, on more than one device |
| **Learners** | Arrive on the landing page, practise immediately as a guest; sign in with Google for mock exams and synced progress; their data stays private |

Assumption: a current version of Chrome, Edge, Firefox or Safari on desktop, tablet or phone (KNOWN_LIMITATIONS.md lists what is tested).

## 4. Features

### 4.1 Guests and accounts

| | Guest | Signed in (Google; email links once SMTP is set up, D-045) |
|---|---|---|
| Learning mode, bookmarks | Yes, saved in this browser | Yes, saved to the account |
| Settings, privacy page | Yes | Yes |
| Dashboard, mock exams, results, exam history, progress | Sign-in required | Yes |
| Where data lives | `localStorage` in this browser | Supabase, with a copy in this browser that works offline (D-047) |

Pages that belong to an exam have its id in the address: `/clf-c02/practice`, `/saa-c03/exam`, `/dva-c03/results/:id` (D-066). An **Exam** picker at the top of the navigation (shown when more than one exam is offered) opens the same section of another exam, and the app remembers the exam used last; pages without an exam in the address (settings, privacy) and old addresses from before 4.0.0 (`/practice`, `/exam`, …) use it. Each exam has its own landing page (`/saa-c03`). Data is kept per exam: each exam's dashboard, Learning mode, Review due, bookmarks, history, results and progress show only that exam's questions and attempts. Settings are shared. Only one exam can be in progress at a time, across all exams.

`/` is the landing page for guests ("Sit the exam before you sit the exam.", an example question with explained answers, what's covered, the two ways to study, "Start practising" into Learning mode, and "Sign in"); signed-in users go straight to the dashboard (D-057). Pages that need an account send guests to the sign-in page, which offers "Continue as a guest". After signing in on a browser with guest data, the user is asked once whether to add it to the account; Settings offers it again later. Guest data is never changed by this. Signing out asks for confirmation and says whether everything is saved yet.

### 4.2 Pages

| Page | What it does |
|---|---|
| Landing (`/`, and each exam's own page such as `/saa-c03`; guests only) | "Sit the exam before you sit the exam.", an example question with explained answers, "Choose your exam" (when more than one is offered; choosing one keeps the scroll position), what's covered (domain weights), the two ways to study (Learning mode and mock exam), links into Learning mode and sign-in; signed-in users are sent to the dashboard (D-057). `/` shows the exam used last (CLF-C02 for new visitors); each exam's page shows its own facts, example question and fee (D-066) |
| Dashboard (`/:exam/dashboard`) | Latest mock exam, recent attempts, practice by domain and quick actions, with empty states for new users |
| Learning mode (`/:exam/practice`) | Practice by domain, topic (task statement) and difficulty, 5 / 10 / 20 / all questions, optionally unanswered only; "Review due", "Practise mistakes" and "Practise bookmarks" |
| Mock exam (`/:exam/exam`) | Rules, scoring explanation (with the exam's own passing score), integrity mode, start / resume / abandon; full exam (65 questions; 90 minutes for CLF-C02, 130 for SAA-C03 and DVA-C03). An exam in progress in another exam is offered for resuming instead |
| Check-in (`/:exam/exam/check-in`) | AI-proctored exams only: rules, camera and microphone, room check, calibration (§9) |
| Exam session and review (`/:exam/exam/session`, `/:exam/exam/review`) | The exam itself and the final review before submitting; the top bar shows the exam's code |
| Results (`/:exam/results/:id`) | Practice score, benchmark outcome, domain performance, weak areas, recommended next steps, integrity log |
| Answer review (`/:exam/results/:id/review`) | Every question with your answer, the correct answer, explanations and sources; filters: all, correct, incorrect, unanswered |
| Exam history (`/:exam/history`) | All submitted attempts of the exam, including shorter and proctor-ended ones |
| Progress (`/:exam/progress`) | Practice readiness (D-033), recent exam scores, domain strengths and weaknesses, frequently missed topics, questions you keep missing, practice coverage |
| Bookmarks (`/:exam/bookmarks`) | Bookmarked questions of the exam, with practice from the list |
| Settings (`/settings`) | Preferences, account, data management (§8) |
| Privacy (`/privacy`) | What is stored, what is monitored, analytics and page-speed measurement (D-065), how to delete records, who runs CloudPrep (D-056; a Shubham Works project, D-062) and a link to Frontend Interview Prep (D-059), the licences (questions all rights reserved, D-072) and how the questions were made (D-061) |
| Sign-in (`/sign-in`, `/auth/callback`) | Google sign-in (and email links when enabled), return to the requested page |
| Admin (`/admin`) | Admins only (D-054); admins get an **Admin** link in the navigation, nobody else sees it (D-055): totals (users, active in the last 7 days, questions answered, exams taken) and every signed-in account with name, email, sign-in method, sign-up date, last activity, questions answered, practice sessions, exams and best score. Others see "No admin access"; guests go to sign-in |

### 4.3 Not built

- An onboarding flow and an About page. The landing page at `/` introduces CloudPrep to guests (D-057); signed-in users can't open it. The unofficial-tool note and the shared Shubham Works footer (D-062: the maker mark, "A Shubham Works project", the developer credit "Made by Shubham Chaudhary" linking to his portfolio, D-056, and "Also: Frontend Interview Prep" linking to his frontend interview practice site, https://frontend-interview-prepare.vercel.app/, D-059) are in the sidebar, the mobile menu and the landing page footer; the scoring explanation is on the exam and results pages.
- Comparing two attempts side by side.
- Exam time accommodation (+30 minutes), keyboard shortcuts, custom-length quizzes.
- Installable offline app (PWA): icons and "Add to Home Screen" exist, but there's no service worker.
- An in-app question editor, other languages, and certifications other than CLF-C02, SAA-C03 and DVA-C03.
- Two exams in progress at once (one at a time, like a test centre), and settings per exam (they are shared).
- Server-side scoring (Phase 8 step 5: answers are still downloaded with the questions).
- Deleting your own account from inside the app ("Reset everything" deletes its data).

## 5. Exam Mode

### 5.1 Rules

- 65 questions, timed by the exam's guide (90:00 for CLF-C02, 130:00 for SAA-C03 and DVA-C03), using questions with status `unverified`, `checked` or `approved` (D-041).
- No pause (D-013). The timer keeps running while the tab is closed.
- Answers save instantly, in the browser and to the account. The learner can change answers until submission.
- No feedback, correctness hints or explanations until the exam is submitted. Exam pages receive question views without correct answers or explanations.
- Unanswered questions count as incorrect.
- Multiple-response questions are all-or-nothing (D-012). The question says how many to select ("Select two"), more than that can't be selected, and a partly answered question is shown as such (D-027).
- Flag questions, move with previous/next or the question grid, and review all, answered, unanswered, partly answered or flagged questions before submitting. The finish dialog shows how many are unanswered.
- Only one exam at a time, across all exams (D-066). Starting a new one while one is in progress offers to resume it or abandon it (with confirmation); another exam's Mock exam page names the exam in progress and links to it.
- If the bank can't supply a full exam, a shorter timed exam at the real pace is offered instead (D-025). With the current bank this doesn't happen.

### 5.2 Timer

- The session stores `startedAt`, `endsAt` and `durationMs`. Time remaining is always `endsAt − now`; a 1-second interval only triggers re-renders (D-028).
- It recalculates on `visibilitychange` and `focus`, so background-tab throttling and sleep don't matter.
- Low-time warnings at 10 and 5 minutes (can be turned off in Settings), announced to screen readers once each.
- At 0 the exam is submitted once, on any page, by the app-wide `ExamWatcher`. An exam found expired when the app opens is submitted with reason `expired_while_away`, once sign-in and questions have loaded.
- The timer trusts the device clock.

### 5.3 Question selection

The domain weights apply to the **50 scored** questions on the real exam. CloudPrep applies them to all 65 with the largest-remainder method (D-007):

| Domain | Weight | Exact share of 65 | Allocated |
|---|---|---|---|
| D1 Cloud Concepts | 24% | 15.6 | **16** |
| D2 Security & Compliance | 30% | 19.5 | **19** |
| D3 Technology & Services | 34% | 22.1 | **22** |
| D4 Billing, Pricing & Support | 12% | 7.8 | **8** |
| **Total** | 100% | 65 | **65** |

Other exams use their own weights the same way: SAA-C03 30 / 26 / 24 / 20% gives **19 / 17 / 16 / 13**, DVA-C03 30 / 26 / 22 / 22% gives **20 / 17 / 14 / 14** (`blueprint.test.ts`).

Within each domain, questions not used in earlier exams come first, spread across task statements by round-robin. Question order and option order (if that setting is on) are shuffled with a seeded generator, and the seed is stored with the session (D-026).

## 6. Scoring (unofficial)

- **Practice score** = correct ÷ total questions, shown as a percentage.
- **Practice benchmark** = a pass threshold, 70% by default, 50–90% in steps of 5 in Settings. The benchmark in effect at submission is stored with the attempt.
- **Per-domain results** are information only; pass/fail ignores them, like the compensatory model.
- The exam and results pages explain that AWS reports a scaled score from 100 to 1,000 (700 to pass CLF-C02, 720 for SAA-C03 and DVA-C03) with an unpublished method, and that CloudPrep's score is simple percent-correct. CloudPrep never shows a number out of 1,000 (D-008).
- Attempts ended by the AI proctor are void: they never meet the benchmark and are left out of readiness, but keep their score for review (D-043).
- **Readiness** (Progress page) uses explicit criteria over the last three exams and never says "ready" (D-033).

## 7. Learning Mode

- **Setup:** domain, topic (task statement), difficulty, length 5 / 10 / 20 / all (default from Settings), optionally unanswered only. Or practise mistakes, bookmarks, or one domain from the dashboard.
- **Per question:** select answer(s) → **Check answer** (enabled once the required number is selected) → correct/incorrect, the correct option(s), the overall explanation, an explanation for every option, source links and, for `unverified` and `checked` questions, a note on how they were checked → **Next**.
- **Bookmark** on every question, in practice and in answer review.
- **Session summary:** score, missed questions, "Retry incorrect". Sessions aren't restored after a reload (D-010), but every checked answer is saved.
- **Mistakes:** questions whose latest answer, in practice or an exam, was incorrect. A correct answer clears them.
- **Review due (D-052):** answered questions come back on a schedule. Each has a review level from 0 to 4, due again 1, 3, 7, 21 or 60 days (local calendar days) after its latest answer. A wrong answer sets level 0 (due the next day); a correct answer moves it up a level, but only when it was due, so a retry in the same sitting doesn't count. "Review due questions (n)" starts a session of the most important due questions (lowest level, then longest overdue), up to the default practice length. The dashboard's quick actions show the count and start the same session. Progress saved before this feature gets an estimated level. Random practice, Mistakes and exams are unchanged. An "i" button beside "Review due" (Learning mode card and dashboard quick action) explains the schedule in a small panel that opens on click or tap and closes on Escape or a click outside (D-058).
- **Statistics** are question-level: "answered" counts unique questions, and accuracy uses each question's latest answer (D-019, D-023). Submitted exams add their answered questions (D-029).

## 8. Settings and data

- **Preferences:** theme (light by default, or dark or system), motion (system, reduce), practice benchmark, low-time warnings, option shuffling, default practice length. Only changed values are saved (D-034).
- **Account:** who is signed in, whether changes are saved or waiting, sign out, add guest data.
- **Export / import:** a JSON file of all data except the exam in progress. Import checks the file strictly (5 MB limit, same parsers as storage), shows a preview, and then merges or replaces. A full backup is made first (D-035).
- **Recovery:** backups and copies of unreadable data can be downloaded, restored (full backups) or deleted.
- **Clear:** exam in progress, learning progress, exam history, or everything (type RESET). Signed in, these delete the data from the account on every device.

## 9. Practice integrity (opt-in)

Chosen per exam on the exam page (D-036, D-043):

- **Standard:** nothing is monitored.
- **Strict practice:** asks for fullscreen and logs tab, focus and fullscreen changes. It never judges and can be stopped at any time.
- **AI-proctored:** a check-in like an online proctored exam, then an on-device proctor (MediaPipe face and object models, microphone loudness) watching the face, head, eyes and mouth, phones, other people, books and screens, the pointer, shortcuts and extra displays. Two warnings, then the third strike ends the exam; a phone, another person, a second display or a lost camera or microphone ends it at once.

Only `{type, at}` events are stored, never frames, audio or images. The results page shows the log.

## 10. Core user journeys

| # | Journey | Main path | States handled |
|---|---|---|---|
| J1 | First visit | Link → sign-in page → "Continue as a guest" (Learning mode) or "Continue with Google" | Sign-in not set up; storage unavailable (works, nothing saved); questions downloading or failed ("Try again") |
| J2 | Start mock | Mock exam → rules and integrity mode → start (or check-in for proctored) | Exam in progress (resume / abandon); browser can't proctor (mode disabled) |
| J3 | Take exam | Answer → flag → grid → review → finish dialog (unanswered count) → submit | Save failure notice; offline (saved locally, synced later) |
| J4 | Time expires | Timer hits 0 → submitted → results with "Time ran out" | Expired while closed (submitted on next load) |
| J5 | Review results | Results → answer review (filters) → bookmark questions | Question changed since the attempt (archived wording, or current with a note) |
| J6 | Domain practice | Learning mode → setup → session → summary → "Retry incorrect" | No matching questions (empty state); reload (answers kept, session not restored) |
| J7 | Bookmarks and mistakes | Bookmarks page or Learning mode cards → practise them | Empty states with hints |
| J8 | History and progress | Exam history → attempt; Progress → readiness and weak areas | No exams yet; fewer than three exams (readiness explains) |
| J9 | Settings and data | Preferences (save instantly) → export / import (preview, merge or replace) / clear | Invalid file, wrong app, newer format, too large |
| J10 | Refresh mid-exam | Reload → same question, answers, flags, remaining time | Corrupt saved exam (backed up, explained); proctored exam (strike, proctor restart) |
| J11 | Second device | Sign in elsewhere → same progress, history and exam in progress | Offline changes on the first device (sent later; last change per record wins) |

## 11. Product requirements

- R-1: A full mock always has exactly 65 unique, eligible questions in a 16 / 19 / 22 / 8 split.
- R-2: After a reload the remaining time is correct and no answers are lost.
- R-3: An exam is submitted exactly once, even if several triggers fire at once.
- R-4: No correctness information is in the exam pages before submission, including the DOM and ARIA text.
- R-5: Every question passes automated validation; `npm test` and `npm run validate:questions` fail otherwise.
- R-6: Every page is keyboard operable and passes axe with no serious or critical issues, in both themes.
- R-7: Exported data imports into a fresh browser and reproduces history, bookmarks, progress and settings.
- R-8: Corrupt or unavailable storage never crashes the app or loses data silently; unreadable values are backed up first.
- R-9: Each user can read and change only their own data (Row Level Security); the secret key never reaches the app.
- R-10: The unofficial-tool note is visible on every app page (sidebar or mobile menu), and the scoring explanation on the exam and results pages.

TEST_PLAN.md says which tests cover these.

## 12. Content policy for questions

- Every question is original and written in CloudPrep's own words from public AWS documentation and the exam guide. No imported, scraped or dump questions (D-042).
- Every question cites at least one https `docs.aws.amazon.com` or `aws.amazon.com` page (`scripts/check-references.mjs` checks they still load and haven't been retired into a redirect).
- Every question has an overall explanation and an explanation for every option, correct ones included (D-022).
- Single answer = exactly 4 options; multiple response = 5 or more options with 2 or more correct. No "all of the above" or "none of the above".
- Statuses: `draft` (never shown) → `unverified` (written from the cited pages, not yet re-checked) → `checked` (verified against the cited pages) → `approved` (human sign-off; only the owner sets it) → `retired` (ID never reused). Learning and Exam modes show `unverified`, `checked` and `approved`, and Learning mode notes with the feedback when a question is `unverified` or only `checked`.
- Questions live in the repo and are published to Supabase; the live app only sees published questions.

## Look and feel (D-057)

"Study notes in aubergine": soft lilac-grey paper with white rounded cards in light mode, true black with grey cards in dark mode, aubergine for actions and selection, a Newsreader serif for titles and Source Sans 3 for text. The answer sheet in mock exams and Learning mode keeps an exam-paper look (square cells, monospace numbers, an ink border); in Learning mode its cells also show which answers were right or wrong. The dashboard marks the weakest practice domain once two domains have 20 or more answers, and Recent attempts show the time used. The old interface is kept on the `archive/ui-v2` branch and tag `v2.4.0`.
