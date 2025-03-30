import * as fs from 'fs/promises';

async function patchImage() {
	const filename = '../docs/api-docs/index.html';
	const readme = await fs.readFile('../docs/api-docs/index.html', 'utf-8');
	const patched = readme.replace(
		'src="../../assets/e-invoice-eu-logo-2.webp"',
		'src="https://raw.githubusercontent.com/gflohr/e-invoice-eu/main/assets/e-invoice-eu-logo-2.webp"',
	);
	await fs.writeFile(filename, patched, 'utf-8');
}

patchImage();
