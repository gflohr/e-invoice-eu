/* istanbul ignore file */
import { Module } from '@nestjs/common';
import { MappingService } from './mapping.service';
import { MappingController } from './mapping.controller';
import { ValidationModule } from '../validation/validation.module';

@Module({
	providers: [MappingService],
	imports: [ValidationModule],
	exports: [MappingService],
	controllers: [MappingController],
})
export class MappingModule {}
