import js from '@eslint/js';
import vue from 'eslint-plugin-vue';
import tseslint from 'typescript-eslint';

import vueParser from 'vue-eslint-parser';

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...vue.configs['flat/recommended'],
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        ecmaVersion: 'latest',
        sourceType: 'module'
      }
    }
  },
  {
    files: ['**/*.{ts,tsx,vue}'],
    languageOptions: {
      globals: {
        window: 'readonly',
        URL: 'readonly'
      }
    },
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue/max-attributes-per-line': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/html-self-closing': 'off'
    }
  },
  {
    ignores: ['dist/**', 'node_modules/**']
  }
];
