/* istanbul ignore file */
import { Logger, Module } from '@nestjs/common';

import { MappingController } from './mapping.controller';
import { MappingService } from './mapping.service';
import { ValidationModule } from '../validation/validation.module';

@Module({
	providers: [MappingService, Logger],
	imports: [ValidationModule],
	exports: [MappingService],
	controllers: [MappingController],
})
export class MappingModule {}
