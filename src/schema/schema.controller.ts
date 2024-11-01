import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JSONSchemaType } from 'ajv';
import { Mapping } from '../mapping/mapping.interface';
import { mappingSchema } from '../mapping/mapping.schema';
import { Invoice } from '../invoice/invoice.interface';
import { invoiceSchema } from '../invoice/invoice.schema';

@ApiTags('schema')
@Controller('schema')
export class SchemaController {
	@Get('mapping')
	@ApiOkResponse({
		description: 'The JSON Schema for mappings',
		links: {
			'JSON Schema': {
				operationRef: 'https://json-schema.org/',
			},
		},
	})
	mapping(): JSONSchemaType<Mapping> {
		return mappingSchema;
	}

	@Get('invoice')
	@ApiOkResponse({
		description: 'The JSON Schema for invoice data',
		links: {
			'JSON Schema': {
				operationRef: 'https://json-schema.org/',
			},
		},
	})
	invoice(): JSONSchemaType<Invoice> {
		return invoiceSchema;
	}
}
