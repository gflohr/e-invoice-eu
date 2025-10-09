import {
	Invoice,
	invoiceSchema,
	Mapping,
	mappingSchema,
} from '@e-invoice-eu/core';
import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type { JSONSchemaType } from 'ajv';

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
