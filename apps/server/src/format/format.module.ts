/* istanbul ignore file */
import { Module } from '@nestjs/common';

import { FormatController } from './format.controller';
import { FormatFactoryService } from './format.factory.service';
import { AppConfigModule } from '../app-config/app-config.module';
import { AppConfigService } from '../app-config/app-config.service';

@Module({
	providers: [AppConfigService, FormatFactoryService],
	imports: [AppConfigModule],
	controllers: [FormatController],
})
export class FormatModule {}
