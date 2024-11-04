/* istanbul ignore file */
import { Logger, Module } from '@nestjs/common';

import { MappingController } from './mapping.controller';
import { MappingService } from './mapping.service';
import { FormatFactoryService } from '../format/format.factory.service';
import { FormatModule } from '../format/format.module';
import { SerializerModule } from '../serializer/serializer.module';
import { SerializerService } from '../serializer/serializer.service';
import { ValidationModule } from '../validation/validation.module';

@Module({
	imports: [FormatModule, SerializerModule, ValidationModule],
	exports: [MappingService],
	providers: [FormatFactoryService, MappingService, SerializerService, Logger],
	controllers: [MappingController],
})
export class MappingModule {}
