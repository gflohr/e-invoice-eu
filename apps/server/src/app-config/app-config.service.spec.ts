import { Test, TestingModule } from '@nestjs/testing';

import { AppConfigService } from './app-config.service';

describe('AppConfigService', () => {
	let service: AppConfigService;

	beforeEach(async () => {
		// Mock environment variables
		const mockEnv = {
			PORT: '4000',
			LIBRE_OFFICE: '/usr/bin/libreoffice',
			MAX_ATTACHMENTS: '10',
			MAX_SIZE_MB: '20',
		};

		// Load configuration
		const config = AppConfigService.loadConfig(mockEnv);

		// Create the testing module
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				{
					provide: AppConfigService,
					useValue: new AppConfigService(config), // Inject mock config
				},
			],
		}).compile();

		service = module.get<AppConfigService>(AppConfigService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	it('should return the correct server port', () => {
		const port = service.get('server').port;
		expect(port).toBe(4000);
	});

	it('should return the correct programs configuration', () => {
		const programs = service.get('programs');
		expect(programs).toEqual({
			libreOffice: '/usr/bin/libreoffice',
		});
	});

	it('should return the correct uploads configuration', () => {
		const uploads = service.get('uploads');
		expect(uploads).toEqual({
			maxAttachments: 10,
			maxSizeMb: 20 * 1024 * 1024, // Converted to bytes
		});
	});
});
