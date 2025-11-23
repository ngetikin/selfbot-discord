const js = require('@eslint/js');
const tseslint = require('typescript-eslint');
const prettier = require('eslint-config-prettier');
const prettierPlugin = require('eslint-plugin-prettier');

module.exports = tseslint.config(
  {
    ignores: ['dist', 'node_modules', 'eslint.config.cjs'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.ts'],
    plugins: {
      prettier: prettierPlugin,
    },
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        sourceType: 'module',
      },
    },
    rules: {
      'prettier/prettier': ['error'],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  {
    files: ['test/**/*.ts', 'vitest.config.ts'],
    plugins: {
      prettier: prettierPlugin,
    },
    languageOptions: {
      parserOptions: {
        sourceType: 'module',
      },
    },
    rules: {
      'prettier/prettier': ['error'],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  prettier,
);
