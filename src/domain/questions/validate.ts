import { DOMAINS, type DomainId } from '@/domain/exam-guide/clf-c02';
import { DIFFICULTIES, QUESTION_TYPES, REVIEW_STATUSES } from './types';

export type ValidationCode =
  | 'NOT_AN_OBJECT'
  | 'INVALID_ID'
  | 'DUPLICATE_QUESTION_ID'
  | 'INVALID_REVISION'
  | 'INVALID_TYPE'
  | 'EMPTY_STEM'
  | 'MISSING_OPTIONS'
  | 'INVALID_OPTION'
  | 'OPTION_COUNT'
  | 'DUPLICATE_OPTION_ID'
  | 'DUPLICATE_OPTION_TEXT'
  | 'EMPTY_OPTION_TEXT'
  | 'MISSING_OPTION_EXPLANATION'
  | 'ALL_OR_NONE_OF_THE_ABOVE'
  | 'MISSING_CORRECT_ANSWER'
  | 'UNKNOWN_CORRECT_ID'
  | 'DUPLICATE_CORRECT_ID'
  | 'SINGLE_NEEDS_ONE_CORRECT'
  | 'MULTIPLE_NEEDS_TWO_CORRECT'
  | 'MULTIPLE_ALL_CORRECT'
  | 'EMPTY_EXPLANATION'
  | 'INVALID_DOMAIN'
  | 'INVALID_TASK_STATEMENT'
  | 'ID_DOMAIN_MISMATCH'
  | 'INVALID_DIFFICULTY'
  | 'INVALID_TAGS'
  | 'MISSING_REFERENCE'
  | 'INVALID_REFERENCE'
  | 'INVALID_REVIEW';

export interface ValidationIssue {
  /** Question ID if one could be read, otherwise `#<index>`. */
  questionId: string;
  code: ValidationCode;
  message: string;
}

/** Options per type, from the exam guide: 1 correct + 3 distractors; ≥2 correct of ≥5. */
export const SINGLE_OPTION_COUNT = 4;
export const MULTIPLE_MIN_OPTIONS = 5;

const ID_PATTERN = /^clf-d([1-4])-\d{4}$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const ALLOWED_REFERENCE_HOSTS = ['docs.aws.amazon.com', 'aws.amazon.com'];
const ALL_OR_NONE = /\b(all|none) of the above\b/i;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isValidDate(value: unknown): boolean {
  if (typeof value !== 'string' || !DATE_PATTERN.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

function isAllowedReferenceUrl(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && ALLOWED_REFERENCE_HOSTS.includes(url.hostname);
  } catch {
    return false;
  }
}

/**
 * Validates one question supplied as unknown data. Reports every problem found,
 * not just the first, so authors can fix a question in one pass.
 */
export function validateQuestion(input: unknown, index = 0): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!isRecord(input)) {
    return [
      { questionId: `#${index}`, code: 'NOT_AN_OBJECT', message: 'Question is not an object.' },
    ];
  }
  const questionId = isNonEmptyString(input['id']) ? input['id'] : `#${index}`;
  const add = (code: ValidationCode, message: string) => {
    issues.push({ questionId, code, message });
  };

  // Identity
  const idMatch = typeof input['id'] === 'string' ? ID_PATTERN.exec(input['id']) : null;
  if (!idMatch) add('INVALID_ID', 'ID must match clf-d<1-4>-<4 digits>, e.g. clf-d2-0007.');
  if (!Number.isInteger(input['revision']) || (input['revision'] as number) < 1) {
    add('INVALID_REVISION', 'Revision must be a positive integer.');
  }

  // Type and stem
  const type = input['type'];
  const typeValid = (QUESTION_TYPES as readonly unknown[]).includes(type);
  if (!typeValid) add('INVALID_TYPE', `Type must be one of: ${QUESTION_TYPES.join(', ')}.`);
  if (!isNonEmptyString(input['stem'])) add('EMPTY_STEM', 'Question text is empty.');
  else if (ALL_OR_NONE.test(input['stem'])) {
    add('ALL_OR_NONE_OF_THE_ABOVE', '"All/None of the above" does not work with shuffled options.');
  }

  // Options
  const rawOptions = input['options'];
  const optionIds = new Set<string>();
  if (!Array.isArray(rawOptions) || rawOptions.length === 0) {
    add('MISSING_OPTIONS', 'Question has no answer options.');
  } else {
    const texts = new Set<string>();
    rawOptions.forEach((option, optionIndex) => {
      if (!isRecord(option) || !isNonEmptyString(option['id'])) {
        add('INVALID_OPTION', `Option ${optionIndex + 1} must be an object with a non-empty id.`);
        return;
      }
      const optionId = option['id'];
      if (optionIds.has(optionId))
        add('DUPLICATE_OPTION_ID', `Option id "${optionId}" is used twice.`);
      optionIds.add(optionId);

      if (!isNonEmptyString(option['text'])) {
        add('EMPTY_OPTION_TEXT', `Option "${optionId}" has no text.`);
      } else {
        const normalized = option['text'].trim().toLowerCase();
        if (texts.has(normalized))
          add('DUPLICATE_OPTION_TEXT', `Option "${optionId}" repeats another option.`);
        texts.add(normalized);
        if (ALL_OR_NONE.test(option['text'])) {
          add('ALL_OR_NONE_OF_THE_ABOVE', `Option "${optionId}" uses "all/none of the above".`);
        }
      }
      if (!isNonEmptyString(option['explanation'])) {
        add('MISSING_OPTION_EXPLANATION', `Option "${optionId}" has no explanation.`);
      }
    });

    if (type === 'single' && rawOptions.length !== SINGLE_OPTION_COUNT) {
      add('OPTION_COUNT', `Single-answer questions need exactly ${SINGLE_OPTION_COUNT} options.`);
    }
    if (type === 'multiple' && rawOptions.length < MULTIPLE_MIN_OPTIONS) {
      add(
        'OPTION_COUNT',
        `Multiple-response questions need at least ${MULTIPLE_MIN_OPTIONS} options.`,
      );
    }
  }

  // Correct answers
  const rawCorrect = input['correctOptionIds'];
  if (!Array.isArray(rawCorrect) || rawCorrect.length === 0) {
    add('MISSING_CORRECT_ANSWER', 'Question has no correct answer.');
  } else {
    const seen = new Set<unknown>();
    for (const correctId of rawCorrect) {
      if (seen.has(correctId))
        add('DUPLICATE_CORRECT_ID', `Correct answer "${String(correctId)}" is listed twice.`);
      seen.add(correctId);
      if (typeof correctId !== 'string' || !optionIds.has(correctId)) {
        add('UNKNOWN_CORRECT_ID', `Correct answer "${String(correctId)}" is not an option id.`);
      }
    }
    if (type === 'single' && seen.size !== 1) {
      add('SINGLE_NEEDS_ONE_CORRECT', 'Single-answer questions need exactly one correct answer.');
    }
    if (type === 'multiple' && seen.size < 2) {
      add(
        'MULTIPLE_NEEDS_TWO_CORRECT',
        'Multiple-response questions need at least two correct answers.',
      );
    }
    if (type === 'multiple' && Array.isArray(rawOptions) && seen.size >= rawOptions.length) {
      add('MULTIPLE_ALL_CORRECT', 'At least one option must be incorrect.');
    }
  }

  if (!isNonEmptyString(input['explanation'])) {
    add('EMPTY_EXPLANATION', 'Question has no explanation of the correct answer.');
  }

  // Classification
  const domain = DOMAINS.find((d) => d.id === input['domain']);
  if (!domain)
    add('INVALID_DOMAIN', `Domain must be one of: ${DOMAINS.map((d) => d.id).join(', ')}.`);
  if (domain && !domain.taskStatements.some((task) => task.id === input['taskStatement'])) {
    add('INVALID_TASK_STATEMENT', `Task statement must belong to ${domain.id}.`);
  }
  if (idMatch && domain && `D${idMatch[1] ?? ''}` !== (domain.id satisfies DomainId)) {
    add('ID_DOMAIN_MISMATCH', `ID prefix does not match domain ${domain.id}.`);
  }
  if (!(DIFFICULTIES as readonly unknown[]).includes(input['difficulty'])) {
    add('INVALID_DIFFICULTY', `Difficulty must be one of: ${DIFFICULTIES.join(', ')}.`);
  }
  const tags = input['tags'];
  if (!Array.isArray(tags) || !tags.every(isNonEmptyString)) {
    add('INVALID_TAGS', 'Tags must be an array of non-empty strings (it may be empty).');
  }

  // Sources
  const references = input['references'];
  if (!Array.isArray(references) || references.length === 0) {
    add('MISSING_REFERENCE', 'At least one AWS documentation reference is required.');
  } else {
    references.forEach((reference, referenceIndex) => {
      if (
        !isRecord(reference) ||
        !isNonEmptyString(reference['title']) ||
        !isAllowedReferenceUrl(reference['url'])
      ) {
        add(
          'INVALID_REFERENCE',
          `Reference ${referenceIndex + 1} needs a title and an https URL on ${ALLOWED_REFERENCE_HOSTS.join(' or ')}.`,
        );
      }
    });
  }

  // Review metadata
  const review = input['review'];
  if (
    !isRecord(review) ||
    !(REVIEW_STATUSES as readonly unknown[]).includes(review['status']) ||
    !isValidDate(review['lastVerified']) ||
    (review['notes'] !== undefined && typeof review['notes'] !== 'string')
  ) {
    add(
      'INVALID_REVIEW',
      `Review needs a status (${REVIEW_STATUSES.join(', ')}) and a lastVerified date (YYYY-MM-DD).`,
    );
  }

  return issues;
}

/** Validates a whole bank, including cross-question rules such as unique IDs. */
export function validateBank(input: unknown): ValidationIssue[] {
  if (!Array.isArray(input)) {
    return [
      { questionId: '#bank', code: 'NOT_AN_OBJECT', message: 'Question bank must be an array.' },
    ];
  }
  const issues: ValidationIssue[] = [];
  const ids = new Set<string>();
  input.forEach((question, index) => {
    issues.push(...validateQuestion(question, index));
    if (isRecord(question) && typeof question['id'] === 'string') {
      if (ids.has(question['id'])) {
        issues.push({
          questionId: question['id'],
          code: 'DUPLICATE_QUESTION_ID',
          message: `Question ID "${question['id']}" is used more than once.`,
        });
      }
      ids.add(question['id']);
    }
  });
  return issues;
}
