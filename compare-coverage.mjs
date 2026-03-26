#! /usr/bin/env node

import * as fs from 'fs';

const pr = JSON.parse(fs.readFileSync('pr-coverage.json'));
const base = JSON.parse(fs.readFileSync('coverage-summary.json'));

const prPct = pr.total.lines.pct;
const basePct = base.total.lines.pct;
const delta = prPct - basePct;

let icon = '⚪';
let emoji = '🤔';
if (delta > 0.5) {
	icon = '🟢';
	emoji = '🚀';
} else if (delta > 0.1) {
	icon = '🟢';
	emoji = '👍';
} else if (delta > 0) {
	icon = '🟢';
	emoji = '✨';
} else if (delta < -0.5) {
	icon = '🔴';
	emoji = '😭';
} else if (delta < -0.1) {
	icon = '🔴';
	emoji = '🛠️';
} else if (delta < 0) {
	icon = '🔴';
	emoji = '⚠️';
}

const out = `${icon} 📊 **Coverage Delta** ${emoji}

<details>
<summary>Click to see full coverage details</summary>

Old:   ${basePct.toFixed(2)} %
New:   ${prPct.toFixed(2)} %
Delta: ${emoji} ${delta >= 0 ? '+' : ''}${delta.toFixed(2)} % ${icon}

</details>
`;

console.log(out);
