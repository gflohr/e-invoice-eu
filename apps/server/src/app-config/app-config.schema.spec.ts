import * as v from 'valibot';

import { appConfigSchema } from './app-config.schema';

describe('AppConfig Schema', () => {
	it('should validate a valid configuration', () => {
		const validConfig = {
			server: {
				port: 3000,
			},
			programs: {
				gs: '/usr/bin/gs',
				libreOffice: '/usr/bin/libreoffice',
			},
			uploads: {
				maxAttachments: 10,
				maxSizeMb: 20,
			},
		};

		expect(() => v.parse(appConfigSchema, validConfig)).not.toThrow();
	});

	it('should throw for an invalid port', () => {
		const invalidConfig = {
			server: {
				port: 70000, // Invalid port
			},
			programs: {
				gs: '/usr/bin/gs',
				libreOffice: '/usr/bin/libreoffice',
			},
			uploads: {
				maxAttachments: 10,
				maxSizeMb: 20,
			},
		};

		expect(() => v.parse(appConfigSchema, invalidConfig)).toThrow(/65535/);
	});

	it('should throw for missing or empty program paths', () => {
		const invalidConfig = {
			server: {
				port: 3000,
			},
			programs: {
				gs: '', // Invalid (empty string)
				libreOffice: null, // Invalid (not a string)
			},
			uploads: {
				maxAttachments: 10,
				maxSizeMb: 20,
			},
		};

		expect(() => v.parse(appConfigSchema, invalidConfig)).toThrow();
	});

	it('should throw for invalid maxAttachments and maxSizeMb', () => {
		const invalidConfig = {
			server: {
				port: 3000,
			},
			programs: {
				gs: '/usr/bin/gs',
				libreOffice: '/usr/bin/libreoffice',
			},
			uploads: {
				maxAttachments: -1, // Invalid (negative number)
				maxSizeMb: -10, // Invalid (negative number)
			},
		};

		expect(() => v.parse(appConfigSchema, invalidConfig)).toThrow();
	});
});
