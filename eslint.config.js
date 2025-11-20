const js = require('@eslint/js');
const tseslint = require('typescript-eslint');
const pluginNext = require('@next/eslint-plugin-next');

module.exports = [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  pluginNext.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      // Let TypeScript handle unused vars; don't fail build on them
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',

      // Allow using `any` and TS comments in this codebase
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',

      // Relax some stylistic rules to avoid noisy lint errors
      'prefer-const': 'off',
      'no-case-declarations': 'off',
      'no-useless-escape': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
    },
  },
];
