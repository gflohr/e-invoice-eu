import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import * as fs from 'fs';

const pkg = JSON.parse(
	fs.readFileSync('./package.json', { encoding: 'utf-8' }),
);

export default [
	// UMD builds for the browser.
	{
		input: 'src/index.ts',
		output: {
			name: 'eInvoiceEU',
			file: './dist/e-invoice-eu.min.js',
			format: 'umd',
			sourcemap: true,
		},
		plugins: [
			// Replace the import for the PDF creation.
			replace({
				values: {
					'../utils/render-spreadsheet': JSON.stringify('../utils/render-spreadsheet.browser'),
				},
				delimiters: ["'", "'"],
				preventAssignment: true,
			}),
			json(),
			resolve({ preferBuiltins: true }),
			commonjs(),
			typescript({
				exclude: 'src/**/*.spec.ts',
			}),
			terser(),
		],
	},
	{
		input: 'src/index.ts',
		output: {
			name: 'esgettext',
			file: './dist/e-invoice-eu.js',
			format: 'umd',
			sourcemap: true,
		},
		plugins: [
			// Replace the import for the PDF creation.
			replace({
				values: {
					'../utils/render-spreadsheet': JSON.stringify('../utils/render-spreadsheet.browser'),
				},
				delimiters: ["'", "'"],
				preventAssignment: true,
			}),
			json(),
			resolve({ preferBuiltins: true }),
			commonjs(),
			typescript({
				exclude: 'src/**/*.spec.ts',
			}),
		],
	},
	{
		input: 'src/index.ts',
		external: ['fs'],
		plugins: [
			json(),
			typescript({
				exclude: 'src/**/*.spec.ts',
			}),
		],
		output: [
			{ file: pkg.main, format: 'cjs', sourcemap: true },
			{ file: pkg.module, format: 'es', sourcemap: true },
		],
	},
];
