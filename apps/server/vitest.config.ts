import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		environment: 'node',
		include: ['src/**/*.spec.ts'],
		coverage: {
			reporter: ['text', 'json-summary', 'lcov'],
			reportsDirectory: './coverage',
		},
	},
	resolve: {
		alias: {
			'@e-invoice-eu/core': path.resolve(
				__dirname,
				'../../packages/core/src',
			),
		},
	},
});
