import * as fs from 'fs';
import * as path from 'path';
import yaml from 'js-yaml';
import { globSync } from 'glob';

import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const workspaceYaml = fs.readFileSync('pnpm-workspace.yaml', 'utf-8');
const workspaceConfig = yaml.load(workspaceYaml);
const workspaceGlobs = workspaceConfig.packages;

const roots = [];
for (let pattern of workspaceGlobs) {
	pattern = [__dirname, pattern, 'coverage'].join('/');
	roots.push(...globSync(pattern));
}

let total = {
	lines: { covered: 0, total: 0 },
};

for (const root of roots) {
	const file = [root, 'coverage-summary.json'].join('/');

	const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
	const lines = data.total.lines;

	total.lines.covered += lines.covered;
	total.lines.total += lines.total;
}

const pct = total.lines.total > 0 ? (total.lines.covered / total.lines.total) * 100 : 0;

fs.writeFileSync(
	'coverage-summary.json',
	JSON.stringify({ total: { lines: { pct } } }, null, 2) + '\n',
);
