import { pipeline, env } from '@xenova/transformers';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Cache models inside the project's public folder so Vite serves them
env.cacheDir = join(__dirname, '../public/models');
env.allowLocalModels = true;

console.log('Downloading Whisper tiny multilingual model...');
console.log('Cache dir:', env.cacheDir);

const start = Date.now();
const asr = await pipeline('automatic-speech-recognition', 'Xenova/whisper-small', {
  progress_callback: (progress) => {
    if (progress.status === 'progress' && progress.file) {
      const pct = progress.progress ? Math.round(progress.progress) : '?';
      process.stdout.write(`\r  ${progress.file}: ${pct}%   `);
    }
    if (progress.status === 'done') {
      process.stdout.write('\n');
    }
  },
});

const elapsed = ((Date.now() - start) / 1000).toFixed(1);
console.log(`\nModel downloaded and cached in ${elapsed}s`);
console.log('Voice search will load instantly now.');
