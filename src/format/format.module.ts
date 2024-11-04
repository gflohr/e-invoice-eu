import { Module } from '@nestjs/common';

import { FormatFactoryService } from './format.factory.service';
import { SerializerModule } from '../serializer/serializer.module';
import { SerializerService } from '../serializer/serializer.service';

@Module({
	imports: [SerializerModule],
	providers: [FormatFactoryService, SerializerService],
})
export class FormatModule {}
