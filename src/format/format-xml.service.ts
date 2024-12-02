import { Injectable, Logger } from '@nestjs/common';
import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import * as path from 'path';
import * as tmp from 'tmp-promise';
import * as url from 'url';
import { ExpandObject } from 'xmlbuilder2/lib/interfaces';

import { AppConfigService } from '../app-config/app-config.service';
import { InvoiceServiceOptions } from '../invoice/invoice.service';
import {
	SerializerOptions,
	SerializerService,
} from '../serializer/serializer.service';

@Injectable()
export class FormatXMLService {
	private readonly logger = new Logger(FormatXMLService.name);

	constructor(
		protected readonly appConfigService: AppConfigService,
		private readonly serializerService: SerializerService,
	) {}

	get mimeType(): string {
		return 'application/xml';
	}

	renderXML(data: ExpandObject, serializerOptions: SerializerOptions): string {
		return this.serializerService.serialize(data, serializerOptions);
	}

	protected async getInvoicePdf(
		options: InvoiceServiceOptions,
	): Promise<Buffer> {
		if (options.pdf) {
			return options.pdf;
		} else if (!options.data) {
			throw new Error(
				'Either a data spreadsheet file or an invoice PDF' +
					' are mandatory for Factur-X invoices!',
			);
		}

		const libreoffice = this.appConfigService.get('programs').libreOffice;
		const userDir = await tmp.tmpName();
		const userDirUrl = url.pathToFileURL(path.resolve(userDir));
		const parsedOriginalFilename = path.parse(options.data.originalname);
		const inputFilename = (
			await tmp.file({ postfix: parsedOriginalFilename.ext })
		).path;
		await fs.writeFile(inputFilename, options.data.buffer);
		const outputDir = (await tmp.dir()).path;

		const args = [
			'--headless',
			`-env:UserInstallation=${userDirUrl.href}`,
			'--convert-to',
			'pdf',
			'--outdir',
			outputDir,
			inputFilename,
		];
		this.logger.log(
			`Executing command '${libreoffice}' with args '${args.join(' ')}'`,
		);

		await new Promise<void>((resolve, reject) => {
			const child = spawn(libreoffice, args, { stdio: 'inherit' });

			child.on('error', err => {
				this.logger.error(`Error spawning process: ${err.message}`);
				reject(err);
			});

			child.on('close', code => {
				if (code === 0) {
					this.logger.log(`LibreOffice command executed successfully`);
					resolve();
				} else {
					const errorMsg = `LibreOffice command failed with exit code ${code}`;
					this.logger.error(errorMsg);
					reject(new Error(errorMsg));
				}
			});
		});

		const parsedInputFilename = path.parse(inputFilename);
		const outputFilename = path.join(
			outputDir,
			parsedInputFilename.name + '.pdf',
		);

		this.logger.log(`Reading converted file from '${outputFilename}'`);

		try {
			const pdfBuffer = await fs.readFile(outputFilename);
			return pdfBuffer;
		} catch (error) {
			this.logger.error(`Error reading output PDF: ${error.message}`);
			throw error;
		}
	}
}
