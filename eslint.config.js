const globals = require('globals');
const pluginJs = require('@eslint/js');
const configPrettier = require('eslint-config-prettier');

module.exports = [
  pluginJs.configs.recommended,
  configPrettier,
  {
    files: ['**/*.js'],
    ignores: ['**/node_modules/**'],
    languageOptions: { sourceType: 'commonjs', globals: globals.node },
    rules: {
      'max-len': [
        'error',
        { code: 80, ignoreUrls: true, ignoreTemplateLiterals: true }
      ],
      quotes: [2, 'single', 'avoid-escape']
    }
  }
];
