// Flags near-duplicate questions: stems (plus correct answers) with very similar wording.
// Usage: node scripts/check-duplicates.mjs [threshold=0.6]   (exits 1 if any pair is above it)
import { createServer } from 'vite';

const threshold = Number(process.argv[2] ?? '0.6');
const server = await createServer({
  appType: 'custom',
  logLevel: 'error',
  server: { middlewareMode: true, hmr: false, watch: null },
});

const STOP = new Set(
  'a an the of to and or for in on with which what is are be that this by from as it its can company wants needs should aws amazon use using most'.split(
    ' ',
  ),
);
const words = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w));
const shingles = (text) => {
  const w = words(text);
  const set = new Set();
  for (let i = 0; i < w.length - 1; i++) set.add(`${w[i]} ${w[i + 1]}`);
  return set;
};
const jaccard = (a, b) => {
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / (a.size + b.size - inter || 1);
};

let exitCode = 0;
try {
  const { QUESTION_BANK } = await server.ssrLoadModule('/src/content/questions/index.ts');
  const items = QUESTION_BANK.map((q) => {
    const correct = q.options
      .filter((o) => q.correctOptionIds.includes(o.id))
      .map((o) => o.text)
      .join(' ');
    return { id: q.id, sig: shingles(`${q.stem} ${correct}`) };
  });
  const pairs = [];
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const score = jaccard(items[i].sig, items[j].sig);
      if (score >= threshold) pairs.push([score, items[i].id, items[j].id]);
    }
  }
  pairs.sort((a, b) => b[0] - a[0]);
  for (const [score, a, b] of pairs) console.log(`${score.toFixed(2)}  ${a}  ${b}`);
  console.log(`${QUESTION_BANK.length} questions, ${pairs.length} pairs at or above ${threshold}`);
  if (pairs.length > 0) exitCode = 1;
} finally {
  await server.close();
}
process.exit(exitCode);
