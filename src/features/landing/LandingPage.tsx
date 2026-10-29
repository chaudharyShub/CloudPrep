import { Link } from 'react-router';
import { MadeBy, UnofficialNote } from '@/components/layout/Brand';
import { LogoTile } from '@/components/brand/LogoMark';
import { buttonClasses } from '@/components/ui/buttonStyles';
import { ExternalLink } from '@/components/ui/ExternalLink';
import { FULL_EXAM } from '@/domain/exam/config';
import { formatClock } from '@/domain/exam/timer';
import { DOMAINS, EXAM_GUIDE_URL } from '@/domain/exam-guide/clf-c02';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { cn } from '@/lib/cn';
import { useAuth } from '@/state/AuthProvider';
import { revealClasses, useExamDemo, useReveal } from './motion';

const QUESTIONS = FULL_EXAM.questionCount;
const MINUTES = FULL_EXAM.durationMs / 60_000;

/** Shown in the metrics strip. Update it when the published bank grows (README has the count). */
const BANK_SIZE = '2,000';

/** The dummy question on the hero card: an original question, not from a real exam. */
const EXAMPLE_OPTIONS = [
  { letter: 'A', text: 'Amazon EC2 Reserved Instances' },
  { letter: 'B', text: 'AWS Lambda' },
  { letter: 'C', text: 'Amazon Lightsail' },
  { letter: 'D', text: 'AWS Outposts' },
] as const;

const METRICS = [
  { value: BANK_SIZE, label: 'original questions, each one checked against the AWS docs' },
  {
    value: `${String(QUESTIONS)} / ${String(MINUTES)}`,
    label: 'questions and minutes, like the real exam',
  },
  {
    value: String(DOMAINS.length),
    label: 'exam domains, weighted the way the exam guide weights them',
  },
  { value: 'Free', label: 'no ads, no paywall, no upsell' },
] as const;

const WAYS = [
  {
    label: '01 — Learning mode',
    title: 'Answer, check, understand.',
    text: 'Pick a domain or a topic and go at your own pace. Check each answer straight away and read why every option is right or wrong, with a link to the AWS page it comes from. Questions you miss come back when they’re due.',
  },
  {
    label: '02 — Mock exam',
    title: 'The real thing, minus the fee.',
    text: `A timed ${String(QUESTIONS)}-question paper balanced across the four domains. Flag questions, review them, hand it in. You get a score, a domain breakdown and every explanation. Turn on the optional proctor if you want the pressure.`,
  },
] as const;

/** The public front page for guests (D-057). Signed-in users go straight to the dashboard. */
export function LandingPage() {
  useDocumentTitle('Practice for the AWS Cloud Practitioner exam');
  const { client } = useAuth();
  const demo = useExamDemo();
  const [metricsRef, metricsShown] = useReveal<HTMLDListElement>();
  const [waysRef, waysShown] = useReveal<HTMLDivElement>();
  const [domainsRef, domainsShown] = useReveal<HTMLUListElement>();
  /** Staggers the hero's entrance. */
  const rise = (delayMs: number) => ({ animationDelay: `${String(delayMs)}ms` });

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <a
        href="#main"
        className="sr-only z-50 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-on-primary focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to main content
      </a>
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5 rounded-sm">
            <LogoTile size={32} />
            <span className="font-serif text-2xl font-semibold">CloudPrep</span>
            <span className="rounded-full border border-border px-2 py-0.5 text-xs font-semibold text-fg-muted">
              CLF-C02
            </span>
          </Link>
          <nav aria-label="Main" className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <a href="#how" className="text-fg-muted hover:text-fg">
              How it works
            </a>
            <a href="#covered" className="text-fg-muted hover:text-fg">
              What’s covered
            </a>
            <Link to="/privacy" className="text-fg-muted hover:text-fg">
              Privacy
            </Link>
            {client.available && (
              <Link to="/sign-in" className={buttonClasses({ variant: 'secondary' })}>
                Sign in
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main id="main" tabIndex={-1}>
        {/* Hero */}
        <section className="mx-auto grid max-w-6xl items-start gap-12 px-4 pt-14 pb-16 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:pt-20">
          <div>
            <p className="animate-rise text-sm font-semibold tracking-wider text-accent-fg uppercase">
              AWS Certified Cloud Practitioner · practice
            </p>
            <h1
              style={rise(80)}
              className="mt-5 animate-rise font-serif text-5xl leading-[1.04] font-medium tracking-tight sm:text-[4.25rem]"
            >
              Sit the exam
              <br />
              before you
              <br />
              <em className="rounded-md bg-highlight [box-decoration-break:clone] px-2 font-medium text-on-highlight">
                sit the exam.
              </em>
            </h1>
            <p
              style={rise(180)}
              className="mt-7 max-w-xl animate-rise text-xl leading-relaxed text-fg-muted"
            >
              {QUESTIONS} questions, {MINUTES} minutes, no answers until you hand it in. Then every
              option explained, so you know exactly why you got it wrong.
            </p>
            <div style={rise(260)} className="mt-9 flex animate-rise flex-wrap gap-3">
              <Link
                to="/practice"
                className={buttonClasses({ className: 'h-12 hover-lift px-6 text-base' })}
              >
                Start practising — free
              </Link>
              <a
                href="#how"
                className={buttonClasses({
                  variant: 'secondary',
                  className: 'h-12 hover-lift px-6 text-base',
                })}
              >
                See how it works
              </a>
            </div>
            <p style={rise(320)} className="mt-4 max-w-xl animate-rise text-sm text-fg-subtle">
              No account needed to practise. Sign in with Google to take mock exams and keep
              progress on every device.
            </p>
          </div>

          <figure
            aria-label="Example exam question"
            style={rise(220)}
            className="m-0 animate-rise overflow-hidden rounded-lg border border-border bg-surface"
          >
            <div className="flex items-center justify-between border-b border-border bg-surface-2 px-5 py-3 font-mono text-sm">
              <span>Question 18 / {QUESTIONS}</span>
              <span className="text-accent-fg">{formatClock(demo.remainingMs)} left</span>
            </div>
            <div className="p-5 sm:p-6">
              <p className="font-serif text-xl leading-snug font-medium">
                A startup wants to run code only when an image is uploaded, without managing
                servers, and pay only for the time the code runs. Which service fits best?
              </p>
              <ul className="mt-5 flex flex-col gap-2.5">
                {EXAMPLE_OPTIONS.map((option) => {
                  const chosen = demo.picked && option.letter === 'B';
                  return (
                    <li
                      key={option.letter}
                      className={cn(
                        'flex items-center gap-3 rounded-md border px-4 py-3 transition-colors duration-base',
                        chosen
                          ? 'border-accent bg-highlight font-semibold text-on-highlight'
                          : 'border-border',
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          'flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors duration-base',
                          chosen
                            ? 'bg-accent text-on-accent'
                            : 'border-[1.5px] border-border-strong text-fg-muted',
                        )}
                      >
                        {option.letter}
                      </span>
                      {option.text}
                    </li>
                  );
                })}
              </ul>
            </div>
            <figcaption className="sr-only">
              An example question from a mock exam, with answer B chosen.
            </figcaption>
          </figure>
        </section>

        {/* Metrics */}
        <section aria-label="In numbers" className="border-y border-border bg-surface">
          <dl
            ref={metricsRef}
            className="mx-auto grid max-w-6xl px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4"
          >
            {METRICS.map((metric, index) => (
              <div
                key={metric.value}
                style={{ transitionDelay: `${String(index * 90)}ms` }}
                className={cn(
                  'flex flex-col-reverse justify-end gap-1 py-7 sm:px-5',
                  revealClasses(metricsShown),
                  index > 0 && 'border-t border-border sm:border-t-0 sm:border-l',
                  index === 2 && 'sm:border-l-0 lg:border-l',
                )}
              >
                <dt className="text-fg-muted">{metric.label}</dt>
                <dd className="font-serif text-4xl font-medium text-accent-fg">{metric.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Two ways to study */}
        <section
          id="how"
          aria-labelledby="how-heading"
          className="mx-auto max-w-6xl px-4 pt-20 pb-8 sm:px-6"
        >
          <h2 id="how-heading" className="font-serif text-4xl font-medium sm:text-[2.625rem]">
            Two ways to study
          </h2>
          <div ref={waysRef} className="mt-10 grid gap-6 md:grid-cols-2">
            {WAYS.map((way, index) => (
              <div
                key={way.label}
                style={{ transitionDelay: `${String(index * 120)}ms` }}
                className={cn('rounded-lg', revealClasses(waysShown))}
              >
                <div className="h-full hover-lift rounded-lg border border-border bg-surface p-6 sm:p-7">
                  <p className="text-sm font-semibold tracking-wider text-accent-fg uppercase">
                    {way.label}
                  </p>
                  <h3 className="mt-2 font-serif text-2xl font-medium">{way.title}</h3>
                  <p className="mt-3 text-lg leading-relaxed text-fg-muted">{way.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* What's covered */}
        <section
          id="covered"
          aria-labelledby="covered-heading"
          className="mx-auto max-w-6xl px-4 py-20 sm:px-6"
        >
          <h2 id="covered-heading" className="font-serif text-4xl font-medium sm:text-[2.625rem]">
            What’s covered
          </h2>
          <p className="mt-3 max-w-2xl text-lg text-fg-muted">
            Every question maps to a domain and topic in the{' '}
            <ExternalLink href={EXAM_GUIDE_URL}>CLF-C02 exam guide</ExternalLink>. Mock exams follow
            the same weights.
          </p>
          <ul
            ref={domainsRef}
            className="mt-8 rounded-lg border border-border bg-surface px-5 sm:px-6"
          >
            {DOMAINS.map((domain, index) => (
              <li
                key={domain.id}
                className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-border py-5 last:border-b-0"
              >
                <span className="w-10 font-mono text-sm text-fg-muted">D{domain.number}</span>
                <span className="min-w-56 flex-1 text-lg font-semibold">{domain.name}</span>
                <span
                  aria-hidden="true"
                  className="h-2.5 min-w-40 flex-[2] overflow-hidden rounded-full bg-surface-3"
                >
                  <span
                    className="block h-full rounded-full bg-meter transition-[width] duration-1000 ease-out"
                    style={{
                      width: domainsShown ? `${String(domain.weightPercent)}%` : '0%',
                      transitionDelay: `${String(index * 120)}ms`,
                    }}
                  />
                </span>
                <span className="w-12 text-right font-mono">{domain.weightPercent}%</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Call to action */}
        <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-6 rounded-[1.5rem] bg-primary px-8 py-12 text-on-primary sm:px-10">
            <h2 className="max-w-2xl font-serif text-4xl leading-tight font-medium">
              Find out where you’d lose marks — before it costs you $100.
            </h2>
            <Link
              to="/practice"
              className="inline-flex h-12 hover-lift items-center rounded-full bg-surface px-6 font-bold text-accent-fg hover:bg-surface-2"
            >
              Start practising
            </Link>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex max-w-6xl flex-wrap items-start justify-between gap-4 px-4 pb-12 sm:px-6">
        <div className="max-w-md">
          <UnofficialNote />
        </div>
        <MadeBy />
      </footer>
    </div>
  );
}
