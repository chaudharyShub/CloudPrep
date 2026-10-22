// Publishes the question bank in src/content/questions to Supabase (docs/DECISIONS.md D-044).
// The repo is the source of truth: anything edited directly in the database is overwritten.
//
// Usage:
//   npm run publish:questions -- --dry-run   validate and count rows, no network
//   npm run publish:questions                publish (needs SUPABASE_URL and SUPABASE_SECRET_KEY,
//                                            e.g. in .env.local; see .env.example)
//
// Drafts are skipped. Questions are never deleted: if the database has a question the repo no
// longer has, publishing stops. Mark it `retired` in the repo instead.
import { createClient } from '@supabase/supabase-js';
import { createServer } from 'vite';

const CHUNK = 500;
const dryRun = process.argv.includes('--dry-run');

const server = await createServer({
  appType: 'custom',
  logLevel: 'error',
  server: { middlewareMode: true, hmr: false, watch: null },
});

let exitCode = 0;
try {
  const { QUESTION_BANK, BANK_VERSION } = await server.ssrLoadModule(
    '/src/content/questions/index.ts',
  );
  const { validateBank } = await server.ssrLoadModule('/src/domain/questions/validate.ts');
  const { clfExamRows, isPublishable, questionToRows } = await server.ssrLoadModule(
    '/src/backend/contentRows.ts',
  );

  const issues = validateBank(QUESTION_BANK);
  if (issues.length > 0) {
    throw new Error(
      `The bank has ${issues.length} problem(s). Run npm run validate:questions for details.`,
    );
  }

  const { exam, domains, topics } = clfExamRows();
  const publishable = QUESTION_BANK.filter(isPublishable);
  const rows = publishable.map((question) => questionToRows(question, exam.id));
  const byStatus = {};
  for (const { question } of rows) byStatus[question.status] = (byStatus[question.status] ?? 0) + 1;

  console.log(`\nExam ${exam.code} (${exam.id}), bank ${BANK_VERSION}`);
  console.log(`  ${domains.length} domains, ${topics.length} topics`);
  console.log(
    `  ${rows.length} questions to publish (${Object.entries(byStatus)
      .map(([status, n]) => `${status} ${n}`)
      .join(', ')}), ${QUESTION_BANK.length - rows.length} drafts skipped`,
  );

  if (dryRun) {
    console.log('\nDry run: nothing was published.\n');
  } else {
    const url = process.env['SUPABASE_URL'];
    const key = process.env['SUPABASE_SECRET_KEY'];
    if (!url || !key) {
      throw new Error('Set SUPABASE_URL and SUPABASE_SECRET_KEY (see .env.example).');
    }
    const supabase = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const check = (label, { error }) => {
      if (error) throw new Error(`${label}: ${error.message}`);
    };

    // Refuse to publish if questions would disappear (IDs are never reused or deleted).
    const existing = new Set();
    for (let from = 0; ; from += 1000) {
      const result = await supabase
        .from('questions')
        .select('id')
        .eq('exam_id', exam.id)
        .order('id')
        .range(from, from + 999);
      check('Reading existing questions', result);
      for (const { id } of result.data) existing.add(id);
      if (result.data.length < 1000) break;
    }
    const publishing = new Set(rows.map(({ question }) => question.id));
    const missing = [...existing].filter((id) => !publishing.has(id));
    if (missing.length > 0) {
      throw new Error(
        `${missing.length} published question(s) are missing from the repo (e.g. ${missing
          .slice(0, 5)
          .join(', ')}). Mark them retired instead of deleting them.`,
      );
    }

    // Catalogue first (a new exam stays unpublished until its questions are in).
    const { is_published, ...examMetadata } = exam;
    check('Exam', await supabase.from('exams').upsert(examMetadata));
    check('Domains', await supabase.from('exam_domains').upsert(domains));
    check('Topics', await supabase.from('exam_topics').upsert(topics));

    const upsertAll = async (table, items, onConflict) => {
      for (let i = 0; i < items.length; i += CHUNK) {
        const chunk = items.slice(i, i + CHUNK);
        check(table, await supabase.from(table).upsert(chunk, { onConflict }));
        process.stdout.write(`\r  ${table}: ${Math.min(i + CHUNK, items.length)}/${items.length}`);
      }
      process.stdout.write('\n');
    };
    await upsertAll(
      'questions',
      rows.map((r) => r.question),
      'id',
    );
    await upsertAll(
      'question_keys',
      rows.map((r) => r.key),
      'question_id',
    );
    await upsertAll(
      'question_revisions',
      rows.map((r) => r.revision),
      'question_id,revision',
    );

    // Last: clients cache by bank_version, so it only changes once everything is in.
    check(
      'Finishing',
      await supabase
        .from('exams')
        .update({ bank_version: BANK_VERSION, is_published })
        .eq('id', exam.id),
    );
    console.log(`\n✔ Published ${rows.length} questions (bank ${BANK_VERSION}).\n`);
  }
} catch (error) {
  exitCode = 1;
  console.error(`\n✖ ${error instanceof Error ? error.message : String(error)}\n`);
} finally {
  await server.close();
}
process.exit(exitCode);
