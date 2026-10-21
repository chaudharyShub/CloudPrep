# Known limitations

CloudPrep is a personal practice tool. Please read this before relying on it.

## Practice scores

- **Not an official score.** CloudPrep shows the percentage of questions answered correctly, with unanswered questions counted as incorrect. AWS reports a scaled score from 100 to 1,000 (700 to pass) using a method it doesn't publish. CloudPrep never estimates that number, and a practice result can't guarantee an exam result.
- **Unscored questions.** The real exam has 15 unscored questions among its 65. CloudPrep scores all 65 because there's no way to know which ones AWS doesn't score.
- **Readiness guidance** is based on simple, published criteria (three or more recent exams at or above your benchmark, in every domain). It never says you are "ready".
- **Question difficulty and style** are CloudPrep's own. Questions are original and written from public AWS documentation, so they may be easier or harder than the real exam.

## Question bank

- The bank currently has **44 questions** (10 / 12 / 15 / 7 across the four domains).
- The **full 65-question exam is unavailable** until there are at least 16 / 19 / 22 / 8 questions. Until then, a shorter balanced exam (currently 41 questions in 57 minutes) is offered at the same pace. Because the bank is small, repeated exams reuse questions.
- All questions are `checked` against the cited AWS pages, but **none is `approved`** (signed off by a second person). See `docs/CONTENT_REVIEW.md`.
- AWS services and support plans change. Each question records the date it was checked. AWS Support plan changes taking effect on 1 January 2027 will need a content review.

## Your data

- Everything is stored in **this browser on this device** (`localStorage`). It isn't synced between devices or browsers.
- **Clearing browser data, private/incognito windows, and some browser storage-cleanup policies remove it.** Safari may delete site data after a period without use. Export your data regularly from Settings.
- Storage is limited (usually about 5 MB per site). CloudPrep warns you if a save fails.
- If two tabs are open, they share the same data and stay in sync. Taking the same exam in two tabs at once works, but isn't recommended.
- Imported files are checked strictly. Files from a newer version of CloudPrep can't be imported into an older one.

## Timer

- The timer counts down to a fixed end time, so it keeps running when the tab is closed and survives reloads. It **trusts the device clock**: changing the system clock changes the remaining time.
- Practice (Learning mode) sessions don't resume after a reload, but every checked answer is saved.

## Practice integrity ("strict mode")

- It's **opt-in, local and imperfect.** It can't see phones, second screens, notes, other people, or other devices.
- **Fullscreen doesn't block other apps** or prevent switching windows. Browsers may refuse fullscreen (some phones and iPhones don't support it for web pages), and CloudPrep says so when that happens.
- Tab and focus events have innocent causes: notifications, system dialogs, or clicking the browser's address bar. CloudPrep never labels an event as cheating and never produces a verdict or score from them.
- **Webcam checks need the browser's built-in face detector** (the Shape Detection API), which standard Chrome, Edge, Firefox and Safari **don't enable by default**. Where it's missing, the webcam option is shown as unavailable with the reason. No face-detection library is bundled (see D-037). Webcam checks only detect face presence (none / one / more than one). They don't identify anyone or analyse expressions, and nothing is recorded or uploaded.
- It isn't remote proctoring and doesn't reproduce AWS's exam security.

## Browser support

- **Tested automatically:** Chromium (Chrome and Edge), WebKit (the Safari engine) and a Pixel 7 phone viewport, all through Playwright.
- **Expected to work:** current versions of Chrome, Edge, Firefox and Safari. The styles need roughly Chrome/Edge 111+, Safari 16.4+ and Firefox 128+.
- **Not tested:** Firefox (no automated runs), real iPhones and Android phones, and tablets other than a 768 px viewport.
- JavaScript and `localStorage` are required. If storage is blocked, CloudPrep still works for the session but warns that nothing will be saved.

## Accessibility

- Automated checks (axe, WCAG 2.2 AA rules) pass on every page in light and dark themes. The checks also cover keyboard-only exam and practice flows, visible focus, dialog focus handling and reduced motion.
- **Not yet tested with a real screen reader** (NVDA, JAWS, VoiceOver or TalkBack).

## Not built

- First-visit onboarding or a welcome tour.
- A side-by-side comparison of two exam attempts.
- Sync, accounts or sharing results with others.
- Offline install (PWA). After the first visit the browser caches files, but offline use isn't guaranteed.
