/**
 * Selftest sanitizera HTML bloga (`src/lib/sanitize-blog-html.ts`): znaczniki,
 * które produkuje renderer markdownu z `blog/[slug]/page.tsx`, przechodzą
 * nietknięte, a skrypt, handlery zdarzeń i obce iframe'y wypadają.
 *
 *   node scripts/blog-html-selftest.mjs
 */
import { build } from 'esbuild';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const dir = await mkdtemp(join(tmpdir(), 'blog-html-'));
const out = join(dir, 'bundle.cjs');
await build({
  entryPoints: [resolve(root, 'src/lib/sanitize-blog-html.ts')],
  outfile: out,
  bundle: true,
  format: 'cjs',
  platform: 'node',
  logLevel: 'error',
});
const { sanitizeBlogHtml: s } = (await import(pathToFileURL(out).href)).default;
await rm(dir, { recursive: true, force: true });
let pass = 0, fail = 0;
const check = (c, l) => { if (c) pass += 1; else { fail += 1; console.log('  ✗', l); } };
const same = (html, l) => check(s(html) === html, l);

// A. Wszystko, co wstawia renderer markdownu, zostaje bez zmian (klasy Tailwinda też).
same('<h1 class="text-3xl font-bold mb-6 text-foreground">T</h1>', 'A1 h1 z klasami');
same('<h2 class="text-2xl font-semibold mb-4 mt-8 text-foreground">T</h2><h3 class="text-xl">T</h3>', 'A2 h2, h3');
same('<p class="mb-4 text-muted-foreground leading-relaxed">a <strong class="font-semibold">b</strong> <em class="italic">c</em></p>', 'A3 akapit, pogrubienie, kursywa');
same('<code class="bg-gray-100 px-1">x</code><pre class="p-4"><code class="text-sm">y</code></pre>', 'A4 kod');
same('<ul class="list-disc list-inside"><li class="mb-2">x</li>\n</ul>', 'A5 lista');
same('<blockquote class="border-l-4 pl-4">q</blockquote>', 'A6 cytat');
check(s('<hr class="my-8 border-border" />') === '<hr class="my-8 border-border" />', 'A7 linia pozioma');
same('<a href="https://dociekai.pl" target="_blank" rel="noopener noreferrer" class="text-primary underline">l</a>', 'A8 link zewnętrzny');
same('<table><tr><th colspan="2">h</th></tr><tr><td>1</td><td>2</td></tr></table>', 'A9 tabela z HTML-a');
same('<iframe src="https://www.youtube.com/embed/abc" allowfullscreen></iframe>', 'A10 film z YouTube');

// B. To, co pozwala uruchomić cudzy kod, wypada.
check(!s('<p>a<script>alert(1)</script></p>').includes('script'), 'B1 <script>');
check(!s('<img src="x" onerror="alert(1)">').includes('onerror'), 'B2 handler zdarzenia');
check(!s('<a href="javascript:alert(1)">x</a>').includes('javascript'), 'B3 href javascript:');
check(!s('<a href="data:text/html,<script>alert(1)</script>">x</a>').includes('data:'), 'B4 href data:');
check(!s('<iframe src="https://evil.example/x"></iframe>').includes('evil'), 'B5 iframe spoza listy');
check(!s('<p style="background:url(javascript:alert(1))">x</p>').includes('style'), 'B6 atrybut style');
check(!s('<svg><script>alert(1)</script></svg>').includes('script'), 'B7 skrypt w svg');
check(s('<a href="https://x.pl" target="_blank">x</a>').includes('rel="noopener noreferrer"'), 'B8 target=_blank dostaje rel');
console.log(fail ? `✗ ${pass}/${pass + fail}` : `✓ ${pass}/${pass} OK`);
process.exit(fail ? 1 : 0);
