import {
  isIntegrityEventType,
  isIntegrityMode,
  MAX_INTEGRITY_EVENTS,
  STANDARD_LOG,
  type IntegrityEvent,
  type IntegrityLog,
} from '@/domain/exam/integrity';
import { isRecord, isTimestamp } from './guards';

/**
 * Lenient on purpose: a damaged integrity log never invalidates the exam or attempt it
 * belongs to. Missing logs (data saved before this feature) read as standard practice.
 * Returns the log and how many events were dropped.
 */
export function parseIntegrityLog(value: unknown): { log: IntegrityLog; dropped: number } {
  if (value === undefined) return { log: STANDARD_LOG, dropped: 0 };
  if (!isRecord(value) || !isIntegrityMode(value['mode']) || !Array.isArray(value['events'])) {
    return { log: STANDARD_LOG, dropped: 1 };
  }
  const events: IntegrityEvent[] = [];
  let dropped = 0;
  for (const event of value['events'].slice(0, MAX_INTEGRITY_EVENTS)) {
    if (isRecord(event) && isIntegrityEventType(event['type']) && isTimestamp(event['at'])) {
      events.push({ type: event['type'], at: event['at'] });
    } else {
      dropped++;
    }
  }
  return {
    log: { mode: value['mode'], events: value['mode'] === 'standard' ? [] : events },
    dropped,
  };
}
