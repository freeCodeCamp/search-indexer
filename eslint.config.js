import globals from 'globals';
import js from '@eslint/js';
import configPrettier from 'eslint-config-prettier';

export default [
  js.configs.recommended,
  configPrettier,
  {
    files: ['**/*.js'],
    ignores: ['**/node_modules/**'],
    languageOptions: { sourceType: 'module', globals: { ...globals.node } },
    rules: {
      'max-len': [
        'error',
        { code: 80, ignoreUrls: true, ignoreTemplateLiterals: true }
      ],
      quotes: [2, 'single', 'avoid-escape']
    }
  }
];
