/**
 * Odpala wszystkie `scripts/*-selftest.mjs` po kolei i zbiera wynik.
 *
 *   npm run test:unit
 */

import { readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = dirname(fileURLToPath(import.meta.url));
const files = readdirSync(dir)
  .filter((f) => f.endsWith('-selftest.mjs'))
  .sort();

const failed = [];
for (const f of files) {
  const r = spawnSync(process.execPath, [join(dir, f)], { encoding: 'utf8' });
  if (r.status === 0) {
    console.log(`ok    ${f}`);
  } else {
    failed.push(f);
    console.log(`FAIL  ${f}`);
    process.stdout.write(r.stdout.split('\n').filter((l) => l.includes('✗')).join('\n') + '\n');
    if (r.stderr) process.stdout.write(r.stderr.split('\n').slice(0, 5).join('\n') + '\n');
  }
}

console.log(`\n${files.length - failed.length}/${files.length} self-tests passed`);
process.exit(failed.length ? 1 : 0);
