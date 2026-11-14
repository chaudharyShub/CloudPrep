// Re-checks that every cited AWS page of every exam's bank still exists (needs internet access).
// Usage: node scripts/check-references.mjs   (exits 1 if any URL doesn't return HTTP 200,
// or returns a page that only redirects elsewhere)
import { createServer } from 'vite';
import { loadPrivateBanks } from './question-banks.mjs';

const server = await createServer({
  appType: 'custom',
  logLevel: 'error',
  server: { middlewareMode: true, hmr: false, watch: null },
});

let exitCode = 0;
try {
  const BANKS = await loadPrivateBanks(server);
  const questions = Object.values(BANKS).flatMap((bank) => bank.questions);
  const urls = [...new Set(questions.flatMap((q) => q.references.map((r) => r.url)))];
  console.log(`Checking ${urls.length} URLs…`);
  const failures = [];
  for (let i = 0; i < urls.length; i += 8) {
    const results = await Promise.all(
      urls.slice(i, i + 8).map(async (url) => {
        try {
          const response = await fetch(url, {
            redirect: 'follow',
            headers: { 'user-agent': 'Mozilla/5.0 (CloudPrep reference check)' },
          });
          // AWS answers retired doc pages with 200 and a meta refresh to the guide's home page.
          if (response.status === 200 && /http-equiv="refresh"/i.test(await response.text())) {
            return [url, 'redirects (page retired)'];
          }
          return [url, response.status];
        } catch (error) {
          return [url, String(error)];
        }
      }),
    );
    for (const [url, status] of results) if (status !== 200) failures.push(`${status}  ${url}`);
  }
  for (const line of failures) console.log(line);
  console.log(
    failures.length === 0 ? 'All references are reachable.' : `${failures.length} failed.`,
  );
  if (failures.length > 0) exitCode = 1;
} catch (error) {
  exitCode = 1;
  console.error(`
✖ ${error instanceof Error ? error.message : String(error)}
`);
} finally {
  await server.close();
}
process.exit(exitCode);
