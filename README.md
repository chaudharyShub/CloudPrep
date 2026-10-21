# CloudPrep

An unofficial practice simulator for the **AWS Certified Cloud Practitioner (CLF-C02)** exam. It runs entirely in your browser: there is no server, no account and no tracking. Your progress is saved in your own browser.

> CloudPrep is not affiliated with or endorsed by Amazon Web Services. Practice scores don't predict or guarantee an official result.

## What it does

- **Learning mode:** untimed practice by domain or topic, with instant feedback, an explanation for every option, and links to the AWS documentation each question is based on. You can bookmark questions.
- **Timed mock exam:** a 65-question / 90-minute exam that follows the CLF-C02 domain weightings, with flagging, a question grid, final review and automatic submission when time runs out. Until the question bank is large enough, a shorter exam at the same pace is offered (currently 41 questions / 57 minutes).
- **Results:** a practice score, per-domain breakdown, answer review with explanations, exam history, and progress guidance across attempts.
- **Your data:** settings (theme, motion, benchmark, warnings), export/import to a file, automatic backups before risky changes, and separate "clear" actions.
- **Optional practice integrity:** a strict mode that asks for fullscreen and logs tab and focus changes, plus optional local webcam checks where the browser supports them. These features are opt-in and processed locally, and they never affect your score. See the in-app Privacy page.

All questions are original, written from public AWS documentation and the official exam guide. See [docs/KNOWN_LIMITATIONS.md](docs/KNOWN_LIMITATIONS.md) before relying on it.

## Tech stack

React 19, TypeScript (strict), Vite 8, Tailwind CSS 4, React Router 8, lucide-react icons and the Inter font. Tests use Vitest with Testing Library, plus Playwright with axe for end-to-end and accessibility checks. Data is stored in `localStorage` through a versioned storage layer (`src/storage/`).

## Getting started

Requires **Node.js 22 or newer** (`.nvmrc` pins 24) and npm.

```bash
npm install
npm run dev            # http://localhost:5173
```

## Commands

| Command                           | What it does                                                           |
| --------------------------------- | ---------------------------------------------------------------------- |
| `npm run dev`                     | Development server with hot reload                                     |
| `npm run build`                   | Type-checks and builds the production site into `dist/`                |
| `npm run preview`                 | Serves the production build at http://localhost:4173                   |
| `npm run typecheck`               | TypeScript checks                                                      |
| `npm run lint`                    | ESLint (zero warnings allowed)                                         |
| `npm run format` / `format:check` | Prettier                                                               |
| `npm test`                        | Unit and component tests (Vitest), including question-bank validation  |
| `npm run test:e2e`                | End-to-end tests in Chromium, WebKit and a phone viewport (Playwright) |
| `npm run validate:questions`      | Validates the question bank and prints a coverage report               |
| `npm run check`                   | Everything above, in order. This must pass before a release            |

First-time setup for end-to-end tests: `npx playwright install chromium webkit`.

## Deployment

CloudPrep is a static site. `vercel.json` configures Vercel (build `npm run build`, output `dist`, and a fallback to `index.html` so deep links work). Step-by-step instructions, including other hosts, are in [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Updating the question bank

Questions live in `src/content/questions/d<n>-*.ts`, one file per exam domain. Each question needs:

- A stable ID such as `clf-d3-0012`. IDs are never reused.
- Four options for single answer, or five or more with at least two correct for multiple response.
- An explanation for every option and an overall explanation.
- At least one https AWS reference.
- A review status: `draft` → `checked` → `approved` (human sign-off) → `retired`.

After editing:

1. Bump `BANK_VERSION` in `src/content/questions/index.ts`.
2. Run `npm run validate:questions` and fix every error it reports.
3. Run `npm run check`.

Saved attempts keep the exact wording you answered (question archive), so editing a question never rewrites history. If a question changes in substance, increase its `revision`. Full rules are in `CLAUDE.md`, and the review checklist is in `docs/CONTENT_REVIEW.md`.

The full 65-question exam unlocks automatically once the bank has at least 16 / 19 / 22 / 8 exam-eligible questions in domains 1–4.

## Documentation

- `docs/PRODUCT_SPEC.md`: what CloudPrep does and why
- `docs/ARCHITECTURE.md`: code structure, storage and routing
- `docs/DECISIONS.md`: decision log
- `docs/TEST_PLAN.md`: test strategy
- `docs/DEPLOYMENT.md`: how to publish it
- `docs/KNOWN_LIMITATIONS.md`: what it can't do
- `docs/CONTENT_REVIEW.md`: question review checklist
