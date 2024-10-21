import { IsString } from 'class-validator';

export class GenerateInvoiceDto {
	@IsString()
	readonly id: string;
}
