// Puts the AI proctor's files in public/proctor/ (served next to the app, never from a CDN):
// - the MediaPipe WebAssembly runtime, copied from node_modules so it always matches the
//   installed @mediapipe/tasks-vision version;
// - the two models, downloaded once from Google's MediaPipe model storage and checked
//   against pinned SHA-256 hashes.
// Runs automatically before `npm run build` and `npm run dev`.
import { createHash } from 'node:crypto';
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'public', 'proctor');
const wasmSource = join(root, 'node_modules', '@mediapipe', 'tasks-vision', 'wasm');

const WASM_FILES = [
  'vision_wasm_internal.js',
  'vision_wasm_internal.wasm',
  'vision_wasm_nosimd_internal.js',
  'vision_wasm_nosimd_internal.wasm',
];

const MODELS = [
  {
    file: 'face_landmarker.task',
    url: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
    sha256: '64184e229b263107bc2b804c6625db1341ff2bb731874b0bcc2fe6544e0bc9ff',
  },
  {
    file: 'efficientdet_lite2.tflite',
    url: 'https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite2/int8/1/efficientdet_lite2.tflite',
    sha256: 'b3f50554cb0ea559e90328845f7d9ba4d13c8bff372914d24e06bc8bb72fa896',
  },
];

const sha256 = (data) => createHash('sha256').update(data).digest('hex');

await mkdir(join(out, 'wasm'), { recursive: true });
await mkdir(join(out, 'models'), { recursive: true });

for (const file of WASM_FILES) {
  await copyFile(join(wasmSource, file), join(out, 'wasm', file));
}

for (const model of MODELS) {
  const target = join(out, 'models', model.file);
  if (existsSync(target) && sha256(await readFile(target)) === model.sha256) continue;
  console.log(`Downloading ${model.file}…`);
  const response = await fetch(model.url);
  if (!response.ok) throw new Error(`${model.file}: HTTP ${response.status}`);
  const data = Buffer.from(await response.arrayBuffer());
  if (sha256(data) !== model.sha256) throw new Error(`${model.file}: checksum mismatch`);
  await writeFile(target, data);
}
console.log('Proctor assets ready in public/proctor/.');
