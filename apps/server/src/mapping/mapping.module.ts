/* istanbul ignore file */
import { Logger, Module } from '@nestjs/common';

import { MappingController } from './mapping.controller';
import { MappingService } from './mapping.service';
import { AppConfigModule } from '../app-config/app-config.module';
import { FormatFactoryService } from '../format/format.factory.service';
import { FormatModule } from '../format/format.module';

@Module({
	imports: [AppConfigModule, FormatModule],
	exports: [MappingService],
	providers: [FormatFactoryService, MappingService, Logger],
	controllers: [MappingController],
})
export class MappingModule {}
