import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

// Reguły React Compilera, które weszły z eslint-plugin-react-hooks v7
// (eslint-config-next 16). Kod sprzed tej wersji łamie je w ~200 miejscach,
// głównie setState w efekcie; migrujemy stopniowo, do tego czasu to ostrzeżenia.
const reactCompilerRules = [
  'set-state-in-effect',
  'refs',
  'immutability',
  'purity',
  'use-memo',
  'globals',
  'preserve-manual-memoization',
  'static-components',
];

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: Object.fromEntries(reactCompilerRules.map((r) => [`react-hooks/${r}`, 'warn'])),
  },
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
]);
