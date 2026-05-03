import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import oxlintPlugin from 'eslint-plugin-oxlint';
import queryPlugin from '@tanstack/eslint-plugin-query';
import globals from 'globals';

export default [
  {
    ignores: ['.next/**', 'node_modules/**', 'dist/**', 'coverage/**', 'playwright-report/**', 'test-results/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: {
      '@tanstack/query': queryPlugin,
    },
    rules: {
      '@tanstack/query/exhaustive-deps': 'error',
      '@tanstack/query/no-rest-destructuring': 'error',
      '@tanstack/query/stable-query-client': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/naming-convention': [
        'error',
        { selector: 'variable', format: ['camelCase', 'UPPER_CASE', 'PascalCase'] },
        { selector: 'typeLike', format: ['PascalCase'] },
      ],
      // TODO: typed linting 셋업 후 consistent-type-exports / no-floating-promises 등 type-aware 룰 추가
    },
  },
  oxlintPlugin.configs['flat/recommended'],
];
