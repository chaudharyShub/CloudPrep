import { useMemo, useState, type SyntheticEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { Bookmark, CalendarCheck, CircleX, History, Play } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { PAGE_ICONS } from '@/components/layout/pageIcons';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { buttonClasses } from '@/components/ui/buttonStyles';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Field, SegmentedControl, Select, Switch } from '@/components/ui/FormControls';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { DOMAINS, type DomainId, type TaskStatementId } from '@/domain/exam-guide/clf-c02';
import { mistakeIds, practiceStats } from '@/domain/practice/progress';
import { localDay, reviewOverview } from '@/domain/practice/review';
import { filterQuestions } from '@/domain/questions/query';
import type { Difficulty } from '@/domain/questions/types';
import { useNow } from '@/hooks/useNow';
import { formatDateTime, formatPercent } from '@/lib/format';
import { usePracticeQuestions, useUserData } from '@/state/hooks';
import { describeDueDay, questionCount, reviewSessionSetup } from './reviewSession';
import { SESSION_PATH, sessionState, type SessionSetup } from './sessionSetup';

type DomainChoice = 'all' | DomainId;
type TopicChoice = 'all' | TaskStatementId;
type DifficultyChoice = 'any' | Difficulty;
type LengthChoice = '5' | '10' | '20' | 'all';

const DOMAIN_OPTIONS: readonly { value: DomainChoice; label: string }[] = [
  { value: 'all', label: 'All domains' },
  ...DOMAINS.map((domain) => ({
    value: domain.id,
    label: `Domain ${domain.number}: ${domain.name}`,
  })),
];

const DIFFICULTY_OPTIONS = [
  { value: 'any', label: 'Any' },
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
] as const satisfies readonly { value: DifficultyChoice; label: string }[];

const LENGTH_OPTIONS = [
  { value: '5', label: '5' },
  { value: '10', label: '10' },
  { value: '20', label: '20' },
  { value: 'all', label: 'All' },
] as const satisfies readonly { value: LengthChoice; label: string }[];

const DOMAIN_SESSION_LENGTH = 10;
/** The review queue changes by the day; a minute's refresh is plenty. */
const REVIEW_REFRESH_MS = 60_000;

export function PracticePage() {
  const navigate = useNavigate();
  const { questions, byId, ids } = usePracticeQuestions();
  const { progress, bookmarks, sessions, preferences } = useUserData();

  const [domain, setDomain] = useState<DomainChoice>('all');
  const [topic, setTopic] = useState<TopicChoice>('all');
  const [difficulty, setDifficulty] = useState<DifficultyChoice>('any');
  const [length, setLength] = useState<LengthChoice>(preferences.practiceSessionLength);
  const [unansweredOnly, setUnansweredOnly] = useState(false);

  const selectedDomain = DOMAINS.find((d) => d.id === domain);
  const topicOptions: readonly { value: TopicChoice; label: string }[] = [
    { value: 'all', label: 'All topics' },
    ...(selectedDomain?.taskStatements.map((task) => ({
      value: task.id,
      label: `${task.id} ${task.title}`,
    })) ?? []),
  ];

  const matching = useMemo(
    () =>
      filterQuestions(questions, {
        domains: domain === 'all' ? [] : [domain],
        taskStatements: topic === 'all' ? [] : [topic],
        difficulties: difficulty === 'any' ? [] : [difficulty],
        excludeIds: unansweredOnly ? Object.keys(progress) : [],
      }),
    [questions, domain, topic, difficulty, unansweredOnly, progress],
  );

  const stats = useMemo(() => practiceStats(progress, questions), [progress, questions]);
  const mistakes = useMemo(() => mistakeIds(progress, ids), [progress, ids]);
  const now = useNow(REVIEW_REFRESH_MS);
  const today = localDay(now);
  const review = useMemo(
    () => ({
      overview: reviewOverview(progress, ids, now),
      setup: reviewSessionSetup(progress, ids, now, preferences.practiceSessionLength),
    }),
    [progress, ids, now, preferences.practiceSessionLength],
  );
  const bookmarkedIds = useMemo(
    () => Object.keys(bookmarks).filter((id) => ids.has(id)),
    [bookmarks, ids],
  );

  function start(setup: SessionSetup) {
    void navigate(SESSION_PATH, { state: sessionState(setup) });
  }

  function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    if (matching.length === 0) return;
    const task = selectedDomain?.taskStatements.find((t) => t.id === topic);
    const parts = [task ? `${task.id} ${task.title}` : (selectedDomain?.name ?? 'All domains')];
    if (difficulty !== 'any')
      parts.push(DIFFICULTY_OPTIONS.find((o) => o.value === difficulty)?.label ?? '');
    if (unansweredOnly) parts.push('Unanswered');
    start({
      label: parts.join(' · '),
      questionIds: matching.map((question) => question.id),
      limit: length === 'all' ? null : Number(length),
    });
  }

  return (
    <>
      <PageHeader
        title="Learning mode"
        icon={PAGE_ICONS.practice}
        description="Practise by domain or topic. Check each answer as you go and read why every option is right or wrong."
      />

      {questions.length === 0 ? (
        <Card>
          <EmptyState
            icon={Play}
            title="No practice questions yet"
            description="The question bank is empty. Questions appear here once they have been checked against their sources."
          />
        </Card>
      ) : (
        <div className="flex flex-col gap-10">
          <Card>
            <CardHeader
              title="Start a practice session"
              description={`${questions.length} questions available across all four exam domains.`}
            />
            <CardBody>
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="Domain">
                    {({ id }) => (
                      <Select
                        id={id}
                        value={domain}
                        options={DOMAIN_OPTIONS}
                        onValueChange={(value) => {
                          setDomain(value);
                          setTopic('all');
                        }}
                      />
                    )}
                  </Field>
                  <Field
                    label="Topic"
                    description={domain === 'all' ? 'Choose a domain to pick a topic.' : undefined}
                  >
                    {({ id, describedBy }) => (
                      <Select
                        id={id}
                        aria-describedby={describedBy}
                        value={topic}
                        options={topicOptions}
                        onValueChange={setTopic}
                        disabled={domain === 'all'}
                      />
                    )}
                  </Field>
                </div>
                <div className="flex flex-wrap gap-x-8 gap-y-5">
                  <SegmentedControl
                    label="Difficulty"
                    value={difficulty}
                    options={DIFFICULTY_OPTIONS}
                    onValueChange={setDifficulty}
                  />
                  <SegmentedControl
                    label="Number of questions"
                    value={length}
                    options={LENGTH_OPTIONS}
                    onValueChange={setLength}
                  />
                </div>
                <Switch
                  label="Only questions I haven't answered"
                  description="Skip questions you've already answered at least once."
                  checked={unansweredOnly}
                  onCheckedChange={setUnansweredOnly}
                />
                <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-fg-muted" aria-live="polite">
                    {matching.length === 0
                      ? 'No questions match these choices. Try another domain, topic or difficulty.'
                      : `${matching.length === 1 ? '1 question matches' : `${matching.length} questions match`}${
                          length !== 'all' && matching.length > Number(length)
                            ? `; ${length} will be picked at random`
                            : ''
                        }.`}
                  </p>
                  <Button type="submit" icon={Play} disabled={matching.length === 0}>
                    Start practice
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>

          <section aria-labelledby="by-domain-heading">
            <h2 id="by-domain-heading" className="text-lg font-semibold text-fg">
              Practise by domain
            </h2>
            <p className="mt-1 mb-4 text-sm text-fg-muted">
              <strong className="font-medium text-fg">Answered</strong> counts each question once.{' '}
              <strong className="font-medium text-fg">Correct</strong> uses your most recent answer
              to each question.
            </p>
            <ul className="grid gap-4 md:grid-cols-2">
              {DOMAINS.map((d) => {
                const domainStats = stats.byDomain[d.id];
                return (
                  <li key={d.id} className="min-w-0">
                    <Card className="flex h-full flex-col">
                      <CardBody className="flex flex-1 flex-col">
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <Badge>Domain {d.number}</Badge>
                          <Badge tone="accent">{d.weightPercent}% of exam</Badge>
                        </div>
                        <h3 className="text-base font-semibold text-fg">{d.name}</h3>
                        <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <dt className="text-fg-muted">Answered</dt>
                            <dd className="font-medium text-fg tabular-nums">
                              {domainStats.answeredQuestions} of {domainStats.availableQuestions}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-fg-muted">Correct</dt>
                            <dd className="font-medium text-fg tabular-nums">
                              {formatPercent(domainStats.accuracy)}
                            </dd>
                          </div>
                        </dl>
                        <ProgressBar
                          className="mt-3"
                          label={`${d.name}: questions answered`}
                          value={domainStats.answeredQuestions}
                          max={domainStats.availableQuestions}
                          valueText={`${domainStats.answeredQuestions} of ${domainStats.availableQuestions} answered`}
                        />
                        <div className="mt-auto pt-5">
                          <Button
                            variant="secondary"
                            icon={Play}
                            aria-label={`Practise ${d.name}`}
                            disabled={domainStats.availableQuestions === 0}
                            onClick={() => {
                              start({
                                label: d.name,
                                questionIds: filterQuestions(questions, { domains: [d.id] }).map(
                                  (q) => q.id,
                                ),
                                limit: DOMAIN_SESSION_LENGTH,
                              });
                            }}
                          >
                            Practise
                          </Button>
                        </div>
                      </CardBody>
                    </Card>
                  </li>
                );
              })}
            </ul>
          </section>

          <section aria-labelledby="review-heading">
            <h2 id="review-heading" className="mb-4 text-lg font-semibold text-fg">
              Review
            </h2>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <Card className="flex flex-col">
                <CardHeader
                  as="h3"
                  title="Review due"
                  description="Questions come back 1, 3, 7, 21 and then 60 days after you last answered them correctly. A wrong answer brings a question back the next day."
                />
                <CardBody className="flex flex-1 flex-col gap-4">
                  <p className="flex items-center gap-2 text-sm text-fg-muted">
                    <CalendarCheck size={16} strokeWidth={1.75} aria-hidden="true" />
                    {review.overview.due > 0
                      ? `${questionCount(review.overview.due)} due today.`
                      : review.overview.nextDueDay !== null
                        ? `Nothing due today. Next review ${describeDueDay(review.overview.nextDueDay, today)}.`
                        : 'Answer questions here or in a mock exam to start your review schedule.'}
                  </p>
                  <div className="mt-auto">
                    <Button
                      variant="secondary"
                      icon={Play}
                      disabled={review.setup === null}
                      onClick={() => {
                        if (review.setup) start(review.setup);
                      }}
                    >
                      Review due questions ({review.overview.due})
                    </Button>
                  </div>
                </CardBody>
              </Card>
              <Card className="flex flex-col">
                <CardHeader
                  as="h3"
                  title="Mistakes"
                  description="Questions whose most recent answer was incorrect. Answer one correctly to clear it."
                />
                <CardBody className="flex flex-1 flex-col gap-4">
                  {mistakes.length === 0 ? (
                    <p className="flex items-center gap-2 text-sm text-fg-muted">
                      <CircleX size={16} strokeWidth={1.75} aria-hidden="true" />
                      No mistakes to review.
                    </p>
                  ) : (
                    <ul className="flex flex-col gap-2 text-sm text-fg-muted">
                      {mistakes.slice(0, 3).map((id) => (
                        <li key={id} className="line-clamp-2">
                          {byId.get(id)?.stem}
                        </li>
                      ))}
                      {mistakes.length > 3 && <li>and {mistakes.length - 3} more</li>}
                    </ul>
                  )}
                  <div className="mt-auto">
                    <Button
                      variant="secondary"
                      icon={Play}
                      disabled={mistakes.length === 0}
                      onClick={() => {
                        start({ label: 'Mistakes', questionIds: mistakes, limit: null });
                      }}
                    >
                      Practise mistakes ({mistakes.length})
                    </Button>
                  </div>
                </CardBody>
              </Card>
              <Card className="flex flex-col">
                <CardHeader
                  as="h3"
                  title="Bookmarks"
                  description="Questions you saved to come back to."
                  action={
                    <Link
                      to="/bookmarks"
                      className={buttonClasses({ variant: 'ghost', size: 'sm' })}
                    >
                      View all
                    </Link>
                  }
                />
                <CardBody className="flex flex-1 flex-col gap-4">
                  <p className="flex items-center gap-2 text-sm text-fg-muted">
                    <Bookmark size={16} strokeWidth={1.75} aria-hidden="true" />
                    {bookmarkedIds.length === 0
                      ? 'No bookmarks yet. Use Bookmark on any question.'
                      : `${bookmarkedIds.length} bookmarked question${bookmarkedIds.length === 1 ? '' : 's'}.`}
                  </p>
                  <div className="mt-auto">
                    <Button
                      variant="secondary"
                      icon={Play}
                      disabled={bookmarkedIds.length === 0}
                      onClick={() => {
                        start({ label: 'Bookmarks', questionIds: bookmarkedIds, limit: null });
                      }}
                    >
                      Practise bookmarks ({bookmarkedIds.length})
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </div>
          </section>

          <section aria-labelledby="recent-heading">
            <h2 id="recent-heading" className="mb-4 text-lg font-semibold text-fg">
              Recent sessions
            </h2>
            <Card>
              {sessions.length === 0 ? (
                <EmptyState
                  icon={History}
                  headingLevel="h3"
                  title="No sessions yet"
                  description="Finished practice sessions are listed here with their scores."
                  className="py-8"
                />
              ) : (
                <ul className="divide-y divide-border">
                  {sessions.slice(0, 5).map((summary) => (
                    <li
                      key={summary.id}
                      className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-5 py-3 text-sm"
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-fg">{summary.label}</span>
                        <span className="text-fg-subtle">{formatDateTime(summary.finishedAt)}</span>
                      </span>
                      <span className="text-fg-muted tabular-nums">
                        {summary.correct}/{summary.answered} correct
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </section>
        </div>
      )}
    </>
  );
}
