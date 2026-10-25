# Known limitations

CloudPrep is a personal practice tool. Please read this before relying on it.

## Practice scores

- **Not an official score.** CloudPrep shows the percentage of questions answered correctly, with unanswered questions counted as incorrect. AWS reports a scaled score from 100 to 1,000 (700 to pass) using a method it doesn't publish. CloudPrep never estimates that number, and a practice result can't guarantee an exam result.
- **Unscored questions.** The real exam has 15 unscored questions among its 65. CloudPrep scores all 65 because there's no way to know which ones AWS doesn't score.
- **Readiness guidance** is based on simple, published criteria (three or more recent exams at or above your benchmark, in every domain). It never says you are "ready".
- **Question difficulty and style** are CloudPrep's own. Questions are original and written from public AWS documentation, so they may be easier or harder than the real exam.

## Question bank

- The bank has **2,000 questions** (400 / 600 / 753 / 247 across the four domains), so the full 65-question, 90-minute exam is available. The shorter exam only appears if the bank is ever too small.
- **1,995 questions are `checked`** against the AWS pages they cite (reviewed on 2026-10-25), and **5 are still `unverified`** because no current AWS page confirms them (D-041). None is `approved` yet: the checks were done by the author, without a second human review. Learning mode notes with the feedback when a question is `unverified` or only `checked`. See `docs/CONTENT_REVIEW.md`.
- Some questions overlap in topic. An automated check (`node scripts/check-duplicates.mjs 0.3`) flags about 15 pairs with similar wording; these were reviewed and test different points, but the bank was not deduplicated by hand.
- AWS services and support plans change. Each question records the date it was checked. Questions note services that AWS has closed to new customers or is ending (for example Snowball and Business Support); AWS Support plan changes taking effect on 1 January 2027 will need another content review.

## Accounts

- Email sign-in is switched off until custom SMTP is set up (D-045); the site offers Google only.
- Sign-in links work once, expire after an hour, and only in the browser that asked for them. Opening the email on another device won't sign you in there; request a link on that device instead, or use Google.
- Signed in, your progress, exam history and settings are saved to your account and follow you to other devices. Changes made offline are saved when you're back online; if you sign out before that, they're kept in this browser and saved the next time you sign in there.
- If you use the same account on two devices at the same time, the most recent change to each item wins (for example, answering the same question on both).
- Progress from before you signed in stays in the browser as guest data. You're asked once whether to add it to your account; you can also do it later in Settings.
- On a new device, a past exam taken with an older version of a question is reviewed with the current version (with a note), because the old wording is only kept in the browser where you took it.
- There's no button to delete your account itself; "Reset everything" deletes all its data. Ask the person who shared CloudPrep to remove the account.
- Mock exams, the dashboard, exam history and progress need an account; Learning mode, bookmarks and settings don't.

## Questions

- Questions are downloaded from CloudPrep's database (about 1.6 MB) the first time you open a page that uses them, and kept in this browser afterwards. The first visit needs an internet connection; after that, practice works offline with the copy you have, and a newer set is downloaded when one is published.
- Clearing site data removes the downloaded copy; it is downloaded again next time.

## Your data

- Without signing in, everything is stored in **this browser on this device** (`localStorage`). It isn't synced between devices or browsers. Signed in, your data is saved to your account and this browser keeps a copy.
- **Clearing browser data, private/incognito windows, and some browser storage-cleanup policies remove it.** Safari may delete site data after a period without use. Export your data regularly from Settings.
- Storage is limited (usually about 5 MB per site). CloudPrep warns you if a save fails.
- If two tabs are open, they share the same data and stay in sync. Taking the same exam in two tabs at once works, but isn't recommended.
- Imported files are checked strictly. Files from a newer version of CloudPrep can't be imported into an older one.

## Timer

- The timer counts down to a fixed end time, so it keeps running when the tab is closed and survives reloads. It **trusts the device clock**: changing the system clock changes the remaining time.
- Practice (Learning mode) sessions don't resume after a reload, but every checked answer is saved.

## Practice integrity ("strict mode")

- It's **opt-in, local and imperfect.** Strict mode can't see phones, second screens, notes, other people, or other devices.
- **Fullscreen doesn't block other apps** or prevent switching windows. Browsers may refuse fullscreen (some phones and iPhones don't support it for web pages), and CloudPrep says so when that happens.
- Tab and focus events have innocent causes: notifications, system dialogs, or clicking the browser's address bar. CloudPrep never labels an event as cheating and never produces a verdict or score from them.
- It isn't remote proctoring and doesn't reproduce AWS's exam security.

## AI-proctored exams

- **Detection is approximate.** The MediaPipe models can miss a phone held at an angle or partly out of view, and can react to innocent things: poor lighting, glare on glasses, a low camera, a poster or reflection that looks like a face or person, or a TV behind you. The thresholds are deliberately strict (D-043), so false warnings will happen, and two warnings plus one more violation end the exam.
- **A browser can't see everything.** It can't see other apps, a phone below the camera's view, notes behind the screen, or someone outside the frame. Only Chromium-based browsers report a second display (`screen.isExtended`); Firefox and Safari don't. Fullscreen doesn't block other apps, and Esc always leaves fullscreen (a violation).
- **Sound is loudness only.** Any noise above the check-in level counts, not just speech: a dog, traffic or a fan turning on can trigger it.
- **You're both the candidate and the proctor.** Someone determined to cheat can bypass a browser-based proctor (for example with developer tools before the exam). It trains you for exam conditions; it doesn't prove honesty.
- **Download and performance.** The first proctored exam downloads about 25 MB (runtime and models); after that the browser cache is used. The face model runs 4 times a second and the object model once a second, which uses noticeable CPU or GPU and battery on older laptops.
- **Tested with scripted model output and Chromium's fake camera.** The rules, warnings, ending, reload handling and cleanup are tested end to end, and the real models are tested to load and analyse a camera feed. Their accuracy on real people hasn't been measured.

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
- Sharing results with others, or deleting your own account from inside the app.
- Offline install (PWA). After the first visit the browser caches files, but offline use isn't guaranteed.
