import {
	BadRequestException,
	Controller,
	Get,
	InternalServerErrorException,
	Logger,
	NotFoundException,
	Param,
	Post,
	UploadedFile,
	UseInterceptors,
} from '@nestjs/common';
import {
	ApiBody,
	ApiConsumes,
	ApiParam,
	ApiResponse,
	ApiTags,
} from '@nestjs/swagger';
import { MappingService } from './mapping.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ValidationError } from 'ajv';

@ApiTags('mapping')
@Controller('mapping')
export class MappingController {
	constructor(
		private readonly mappingService: MappingService,
		private readonly logger: Logger,
	) {}

	@Get('list')
	@ApiResponse({
		status: 200,
		description: 'get a list of all valid mapping IDs',
		type: [String],
	})
	async list(): Promise<string[]> {
		return this.mappingService.list();
	}

	@Post('transform/:mappingId')
	@ApiParam({
		name: 'mappingId',
		description: 'The ID of the mapping to apply.',
		required: true,
	})
	@ApiConsumes('multipart/form-data')
	@ApiBody({
		description: 'The spreadsheet to be transformed.',
		required: true,
		schema: {
			type: 'object',
			properties: {
				file: {
					type: 'string',
					format: 'binary',
				},
			},
		},
	})
	@ApiResponse({
		status: 200,
		description: 'Transformation successful',
	})
	@ApiResponse({
		status: 400,
		description: 'Bad request with error details',
	})
	@ApiResponse({
		status: 404,
		description: 'Mapping ID not found',
	})
	@UseInterceptors(FileInterceptor('file'))
	async transformMapping(
		@Param('mappingId') mappingId: string,
		@UploadedFile() file: Express.Multer.File,
	) {
		try {
			return await this.mappingService.transform(mappingId, file.buffer);
		} catch (error) {
			if (error.code && error.code === 'ENOENT') {
				throw new NotFoundException();
			} else if (error instanceof ValidationError) {
				throw new BadRequestException({
					message: 'Transformation failed.',
					details: error,
				});
			} else {
				this.logger.error(`unknown error: ${error.message}\n${error.stack}`);
				throw new InternalServerErrorException();
			}
		}
	}
}
