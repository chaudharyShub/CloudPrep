// Checks that the questions the app downloads from Supabase match the repo (D-046, D-066),
// for every exam that has questions. Uses the public (publishable) key and the app's own
// loading code, so it sees exactly what a guest's browser sees.
//
// Usage: npm run check:published   (needs VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY,
//                                   e.g. in .env.local)
import { createClient } from '@supabase/supabase-js';
import { isDeepStrictEqual } from 'node:util';
import { createServer } from 'vite';
import { loadPrivateBanks } from './question-banks.mjs';

/** Compares content, not property order; drops undefined optional fields. */
const normalize = (value) => JSON.parse(JSON.stringify(value));

const server = await createServer({
  appType: 'custom',
  logLevel: 'error',
  server: { middlewareMode: true, hmr: false, watch: null },
});

let exitCode = 0;
try {
  const url = process.env['VITE_SUPABASE_URL'];
  const key = process.env['VITE_SUPABASE_PUBLISHABLE_KEY'];
  if (!url || !key) {
    throw new Error('Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY (see .env.example).');
  }
  const BANKS = await loadPrivateBanks(server);
  const { EXAMS } = await server.ssrLoadModule('/src/domain/exam-guide/index.ts');
  const { supabaseQuestionSource } = await server.ssrLoadModule('/src/backend/questionSource.ts');
  const { practiceableQuestions } = await server.ssrLoadModule('/src/domain/questions/query.ts');

  const supabase = createClient(url, key, { auth: { persistSession: false } });
  for (const exam of EXAMS) {
    const bank = BANKS[exam.id];
    const expected = practiceableQuestions(bank?.questions ?? []);
    if (expected.length === 0) {
      console.log(`\n${exam.code}: no questions in the repo yet, skipped`);
      continue;
    }
    const started = Date.now();
    const loaded = await supabaseQuestionSource(
      () => Promise.resolve(supabase),
      exam.id,
    ).fetchBank();
    const seconds = ((Date.now() - started) / 1000).toFixed(1);

    const remote = new Map(loaded.questions.map((q) => [q.id, q]));
    const missing = expected.filter((q) => !remote.has(q.id)).map((q) => q.id);
    const different = expected
      .filter(
        (q) => remote.has(q.id) && !isDeepStrictEqual(normalize(remote.get(q.id)), normalize(q)),
      )
      .map((q) => q.id);
    const expectedIds = new Set(expected.map((q) => q.id));
    const extra = loaded.questions.filter((q) => !expectedIds.has(q.id)).map((q) => q.id);

    console.log(
      `\n${exam.code}: published bank ${loaded.version} (repo: ${bank.version}), downloaded in ${seconds}s`,
    );
    console.log(`  ${loaded.questions.length} valid questions, ${loaded.dropped} rejected`);
    console.log(`  repo questions shown to learners: ${expected.length}`);
    const problems = [
      loaded.version !== bank.version &&
        `version differs (publish again after bumping BANK_VERSION)`,
      loaded.dropped > 0 && `${loaded.dropped} rows failed validation`,
      missing.length > 0 && `${missing.length} missing, e.g. ${missing.slice(0, 3).join(', ')}`,
      different.length > 0 &&
        `${different.length} differ, e.g. ${different.slice(0, 3).join(', ')}`,
      extra.length > 0 && `${extra.length} not in the repo, e.g. ${extra.slice(0, 3).join(', ')}`,
    ].filter(Boolean);
    if (problems.length > 0) {
      exitCode = 1;
      console.error(`  ✖ ${problems.join('\n  ✖ ')}`);
    } else {
      console.log('  ✔ The published questions match the repo.');
    }
  }
  console.log('');
} catch (error) {
  exitCode = 1;
  console.error(`\n✖ ${error instanceof Error ? error.message : String(error)}\n`);
} finally {
  await server.close();
}
process.exit(exitCode);
