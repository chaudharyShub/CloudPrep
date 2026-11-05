// Validates every exam's question bank and prints a coverage report (D-066).
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
  const { BANKS } = await server.ssrLoadModule('/src/content/banks.ts');
  const { EXAMS } = await server.ssrLoadModule('/src/domain/exam-guide/index.ts');
  const { validateBank } = await server.ssrLoadModule('/src/domain/questions/validate.ts');
  const { bankCoverage } = await server.ssrLoadModule('/src/domain/questions/coverage.ts');

  const fmt = (record) =>
    Object.entries(record)
      .map(([key, value]) => `${key} ${value}`)
      .join(', ');

  for (const exam of EXAMS) {
    const bank = BANKS[exam.id] ?? { version: '-', questions: [] };
    const issues = validateBank(bank.questions);
    const coverage = bankCoverage(bank.questions, exam);

    console.log(`\n${exam.code} ${exam.name}, bank ${bank.version}: ${coverage.total} questions\n`);
    for (const domain of exam.domains) {
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
    if (coverage.total > 0 && coverage.uncoveredTaskStatements.length > 0) {
      console.log(
        `\n⚠ Task statements with no questions: ${coverage.uncoveredTaskStatements.join(', ')}`,
      );
    }
  }
  console.log('');
} catch (error) {
  exitCode = 1;
  console.error(error);
} finally {
  await server.close();
}
process.exit(exitCode);
