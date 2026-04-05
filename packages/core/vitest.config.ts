import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		clearMocks: true,
		restoreMocks: true,
		include: ['src/**/*.spec.ts'],
		coverage: {
			reporter: ['text', 'json-summary', 'lcov'],
			reportsDirectory: './coverage',
		},
	},
});
