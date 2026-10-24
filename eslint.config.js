import js from '@eslint/js';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  globalIgnores([
    'dist',
    'dist-e2e',
    'coverage',
    'playwright-report',
    'test-results',
    'docs',
    'public/proctor',
  ]),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.strictTypeChecked,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      jsxA11y.flatConfigs.recommended,
    ],
    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
      'no-restricted-syntax': [
        'error',
        {
          selector: "MemberExpression[object.name='localStorage']",
          message: 'Use the storage layer in src/storage/ instead of localStorage directly.',
        },
        {
          selector: "MemberExpression[property.name='localStorage']",
          message: 'Use the storage layer in src/storage/ instead of localStorage directly.',
        },
      ],
    },
  },
  {
    // The storage driver is the one place in the app allowed to touch localStorage.
    // End-to-end tests also use it directly to set up stored data.
    files: ['src/storage/driver.ts', 'src/storage/driver.test.ts', 'tests/**/*.ts'],
    rules: { 'no-restricted-syntax': 'off' },
  },
  {
    // The app loads questions at runtime (D-046); importing the bundled bank would put it
    // back in the production bundle. Only tests and the dev/E2E source may import it.
    files: ['src/**/*.{ts,tsx}'],
    ignores: [
      'src/**/*.test.{ts,tsx}',
      'src/test/**',
      'src/content/**',
      'src/backend/createQuestionSource.ts',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/content/*', '@/content/**'],
              message: 'Use the loaded bank (useQuestionBank) instead of the bundled questions.',
            },
          ],
        },
      ],
    },
  },
  {
    // The domain layer must stay framework-free and independent of UI and storage.
    files: ['src/domain/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['react', 'react-dom', 'react-router', 'react-router/*'],
              message: 'Domain code must not depend on React.',
            },
            {
              group: ['@/features/*', '@/components/*', '@/app/*', '@/storage/*', '@/state/*'],
              message: 'Domain code must not import from UI or storage layers.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['vite.config.ts', 'playwright.config.ts', 'tests/**/*.ts'],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['eslint.config.js'],
    extends: [js.configs.recommended],
    languageOptions: { globals: globals.node },
  },
]);
