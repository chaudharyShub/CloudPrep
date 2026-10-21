import { Badge } from '@/components/ui/Badge';
import { DOMAINS } from '@/domain/exam-guide/clf-c02';
import type { Question } from '@/domain/questions/types';

const DIFFICULTY_LABEL = { easy: 'Easy', medium: 'Medium', hard: 'Hard' } as const;

/** Domain, task statement, type and difficulty badges for a question. */
export function QuestionMeta({ question }: { question: Question }) {
  const domain = DOMAINS.find((d) => d.id === question.domain);
  const task = domain?.taskStatements.find((t) => t.id === question.taskStatement);
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge>
        <span className="sr-only">Domain: </span>
        {domain?.name ?? question.domain}
      </Badge>
      {task && (
        <Badge>
          <span className="sr-only">Task statement </span>
          {task.id}
        </Badge>
      )}
      <Badge>
        <span className="sr-only">Difficulty: </span>
        {DIFFICULTY_LABEL[question.difficulty]}
      </Badge>
      {question.type === 'multiple' && <Badge tone="accent">Multiple response</Badge>}
    </div>
  );
}
