import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AppConfig } from './app-config.schema';

@Injectable()
export class AppConfigService extends ConfigService<AppConfig> {
	get<K extends keyof AppConfig>(key: K): AppConfig[K] {
		return super.get(key, { infer: true })!;
	}

	public static loadConfig(env: Record<string, any>): AppConfig {
		return {
			server: {
				port: parseInt(env.PORT ?? '3000', 10) || 3000,
			},
			programs: {
				gs: env.GS ?? 'gs',
				libreOffice: env.LIBRE_OFFICE ?? env.LIBREOFFICE ?? 'libreoffice',
			},
			uploads: {
				maxAttachments: parseInt(env.MAX_ATTACHMENTS ?? '5', 10) || 5,
				maxSizeMb: (parseInt(env.MAX_SIZE_MB ?? '10') || 10) * 1024 * 1024,
			},
		};
	}
}
