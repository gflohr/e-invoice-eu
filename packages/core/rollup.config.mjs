import typescript from '@rollup/plugin-typescript';
import * as fs from 'fs';

const pkg = JSON.parse(
	fs.readFileSync('./package.json', { encoding: 'utf-8' }),
);

export default [
	{
		input: 'src/index.ts',
		external: ['fs'],
		plugins: [
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
