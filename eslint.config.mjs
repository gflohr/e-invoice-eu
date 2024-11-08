import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import typescriptEslintEslintPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import globals from 'globals';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
	baseDirectory: __dirname,
	recommendedConfig: js.configs.recommended,
	allConfig: js.configs.all,
});

export default [
	{
		ignores: ['**/.eslintrc.js'],
	},
	...compat.extends('plugin:@typescript-eslint/recommended'),
	{
		plugins: {
			'@typescript-eslint': typescriptEslintEslintPlugin,
			import: importPlugin,
		},

		languageOptions: {
			globals: {
				...globals.node,
				...globals.jest,
			},

			parser: tsParser,
			ecmaVersion: 5,
			sourceType: 'module',
		},

		rules: {
			'@typescript-eslint/interface-name-prefix': 'off',
			'@typescript-eslint/explicit-function-return-type': 'off',
			'@typescript-eslint/explicit-module-boundary-types': 'off',
			'@typescript-eslint/no-explicit-any': 'off',
			'import/order': [
				'error',
				{
					groups: [
						['builtin', 'external'], // Built-in and external imports
						'internal', // Internal imports
						['parent', 'sibling', 'index'], // Parent, sibling, and index imports
					],
					'newlines-between': 'always', // Require new lines between groups
					alphabetize: {
						order: 'asc', // Sort imports alphabetically
						caseInsensitive: true, // Ignore case
					},
				},
			],
		},
	},
];
