// Validates the question bank and prints a coverage report.
// Usage: npm run validate:questions   (exits with code 1 if any question is invalid)
//
// Loads the TypeScript sources through Vite so the app's path aliases work unchanged.
import { createServer } from 'vite';

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
  const { bankCoverage } = await server.ssrLoadModule('/src/domain/questions/coverage.ts');
  const { DOMAINS } = await server.ssrLoadModule('/src/domain/exam-guide/clf-c02.ts');

  const issues = validateBank(QUESTION_BANK);
  const coverage = bankCoverage(QUESTION_BANK);

  console.log(`\nCloudPrep question bank ${BANK_VERSION}: ${coverage.total} questions\n`);
  for (const domain of DOMAINS) {
    console.log(
      `  Domain ${domain.number} ${domain.name} (${domain.weightPercent}%): ${coverage.byDomain[domain.id]}`,
    );
    for (const task of domain.taskStatements) {
      const count = coverage.byTaskStatement[task.id];
      console.log(
        `    ${task.id.padEnd(4)} ${String(count).padStart(3)}  ${task.title}${count === 0 ? '  <-- no questions' : ''}`,
      );
    }
  }
  const fmt = (record) =>
    Object.entries(record)
      .map(([key, value]) => `${key} ${value}`)
      .join(', ');
  console.log(`\n  Types:        ${fmt(coverage.byType)}`);
  console.log(`  Difficulty:   ${fmt(coverage.byDifficulty)}`);
  console.log(`  Review:       ${fmt(coverage.byStatus)}`);

  if (issues.length > 0) {
    exitCode = 1;
    console.error(`\n✖ ${issues.length} problem(s) found:\n`);
    for (const issue of issues)
      console.error(`  ${issue.questionId}  [${issue.code}]  ${issue.message}`);
  } else {
    console.log('\n✔ All questions are valid.');
  }
  if (coverage.uncoveredTaskStatements.length > 0) {
    console.log(
      `\n⚠ Task statements with no questions: ${coverage.uncoveredTaskStatements.join(', ')}`,
    );
  }
  console.log('');
} catch (error) {
  exitCode = 1;
  console.error(error);
} finally {
  await server.close();
}
process.exit(exitCode);
