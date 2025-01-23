/* istanbul ignore file */
import { Module } from '@nestjs/common';

import { SchemaController } from './schema.controller';

@Module({
	controllers: [SchemaController],
})
export class SchemaModule {}
