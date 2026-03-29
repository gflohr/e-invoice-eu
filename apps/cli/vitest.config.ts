import { defineConfig } from 'vitest/config';
import path from 'path';

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
			chalk: path.resolve(__dirname, './src/stubs/chalk.ts'),
			yargs: path.resolve(__dirname, './src/stubs/yargs.ts'),
		},
	},
});
