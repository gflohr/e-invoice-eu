/* istanbul ignore file */
import { Module } from '@nestjs/common';

import { SerializerService } from './serializer.service';

@Module({
	providers: [SerializerService],
})
export class SerializerModule {}
