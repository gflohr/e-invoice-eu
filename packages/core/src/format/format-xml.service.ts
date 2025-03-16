import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import * as path from 'path';
import * as tmp from 'tmp-promise';
import * as url from 'url';
import { create } from 'xmlbuilder2';

import { InvoiceServiceOptions } from '../invoice/invoice.service';
import { Logger } from '../logger.interface';
import { EInvoiceMIMEType } from './format.factory.service';

export class FormatXMLService {
	constructor(private readonly logger: Logger) {}

	get mimeType(): EInvoiceMIMEType {
		return 'application/xml';
	}

	renderXML(data: object): string {
		this.cleanAttributes(data);

		return create({ encoding: 'utf-8' }, data).end({
			prettyPrint: true,
			indent: '\t',
		});
	}

	private cleanAttributes(data: { [key: string]: any }) {
		for (const property in data) {
			const [elem, attr] = property.split('@', 2);

			if (typeof attr !== 'undefined' && elem !== '') {
				if (typeof data[elem] === 'string') {
					data[elem] = {
						'#': data[elem],
					};
				}
				data[elem][`@${attr}`] = data[property];
				delete data[property];
			}

			if (typeof data[property] === 'object') {
				this.cleanAttributes(data[property]);
			}
		}
	}

	protected async getInvoicePdf(
		options: InvoiceServiceOptions,
	): Promise<Buffer> {
		if (options.pdf) {
			return options.pdf.buffer;
		} else if (!options.data) {
			console.trace('here');
			throw new Error(
				'Either a data spreadsheet file or an invoice PDF is needed!',
			);
		}

		const libreoffice = options.libreOfficePath;
		if (typeof libreoffice === 'undefined') {
			throw new Error('LibreOffice path is required for conversion to PDF!');
		}
		const userDir = await tmp.tmpName();
		const userDirUrl = url.pathToFileURL(path.resolve(userDir));
		const parsedOriginalFilename = path.parse(options.data.filename);
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
