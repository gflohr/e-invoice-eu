/* istanbul ignore file */
import { Module } from '@nestjs/common';

import { FormatController } from './format.controller';
import { FormatFactoryService } from './format.factory.service';
import { SerializerModule } from '../serializer/serializer.module';
import { SerializerService } from '../serializer/serializer.service';

@Module({
	imports: [SerializerModule],
	providers: [FormatFactoryService, SerializerService],
	controllers: [FormatController],
})
export class FormatModule {}
