// Checks that the questions the app downloads from Supabase match the repo (D-046).
// Uses the public (publishable) key and the app's own loading code, so it sees exactly what
// a guest's browser sees.
//
// Usage: npm run check:published   (needs VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY,
//                                   e.g. in .env.local)
import { createClient } from '@supabase/supabase-js';
import { isDeepStrictEqual } from 'node:util';
import { createServer } from 'vite';

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
  const { QUESTION_BANK, BANK_VERSION } = await server.ssrLoadModule(
    '/src/content/questions/index.ts',
  );
  const { supabaseQuestionSource } = await server.ssrLoadModule('/src/backend/questionSource.ts');
  const { EXAM_ID } = await server.ssrLoadModule('/src/domain/exam-guide/clf-c02.ts');
  const { practiceableQuestions } = await server.ssrLoadModule('/src/domain/questions/query.ts');

  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const started = Date.now();
  const loaded = await supabaseQuestionSource(() => Promise.resolve(supabase), EXAM_ID).fetchBank();
  const seconds = ((Date.now() - started) / 1000).toFixed(1);

  const expected = practiceableQuestions(QUESTION_BANK);
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
    `\nPublished bank ${loaded.version} (repo: ${BANK_VERSION}), downloaded in ${seconds}s`,
  );
  console.log(`  ${loaded.questions.length} valid questions, ${loaded.dropped} rejected`);
  console.log(`  repo questions shown to learners: ${expected.length}`);
  const problems = [
    loaded.version !== BANK_VERSION && `version differs (publish again after bumping BANK_VERSION)`,
    loaded.dropped > 0 && `${loaded.dropped} rows failed validation`,
    missing.length > 0 && `${missing.length} missing, e.g. ${missing.slice(0, 3).join(', ')}`,
    different.length > 0 && `${different.length} differ, e.g. ${different.slice(0, 3).join(', ')}`,
    extra.length > 0 && `${extra.length} not in the repo, e.g. ${extra.slice(0, 3).join(', ')}`,
  ].filter(Boolean);
  if (problems.length > 0) {
    exitCode = 1;
    console.error(`\n✖ ${problems.join('\n✖ ')}\n`);
  } else {
    console.log('\n✔ The published questions match the repo.\n');
  }
} catch (error) {
  exitCode = 1;
  console.error(`\n✖ ${error instanceof Error ? error.message : String(error)}\n`);
} finally {
  await server.close();
}
process.exit(exitCode);
