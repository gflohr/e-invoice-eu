import * as fs from 'fs';

import { Package } from './package';

describe('Package information', () => {
	const pkgJson = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));

	it('should have a name', () => {
		expect(Package.getName()).toBeDefined();
	});

	it('should have the bug tracker address from package.json', () => {
		expect(Package.getBugTrackerUrl()).toBe(pkgJson.bugs.url);
	});

	it('should have the version from package.json', () => {
		expect(Package.getVersion()).toBe(pkgJson.version);
	});

	it('should have the author name from package.json', () => {
		expect(Package.getAuthorName()).toBe(pkgJson.author.name);
	});

	it('should have the author URL from package.json', () => {
		expect(Package.getAuthorUrl()).toBe(pkgJson.author.url);
	});
});
