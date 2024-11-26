import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppConfigService } from './app-config.service';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true, // Ensures ConfigModule is available globally
		}),
	],
	providers: [AppConfigService],
	exports: [AppConfigService], // Export AppConfigService so it can be used in other modules
})
export class AppConfigModule {}
