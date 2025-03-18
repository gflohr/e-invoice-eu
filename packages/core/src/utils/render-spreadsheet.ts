import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import * as path from 'path';
import * as tmp from 'tmp-promise';
import * as url from 'url';

import { Logger } from '../logger.interface';

export const renderSpreadsheet = async (
	filename: string,
	buffer: Buffer,
	libreoffice: string,
	logger: Logger,
): Promise<Buffer> => {
	const userDir = await tmp.tmpName();
	const userDirUrl = url.pathToFileURL(path.resolve(userDir));
	const parsedOriginalFilename = path.parse(filename);
	const inputFilename = (
		await tmp.file({ postfix: parsedOriginalFilename.ext })
	).path;
	await fs.writeFile(inputFilename, buffer);
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
	logger.log(
		`Executing command '${libreoffice}' with args '${args.join(' ')}'`,
	);

	await new Promise<void>((resolve, reject) => {
		const child = spawn(libreoffice, args, { stdio: 'inherit' });

		child.on('error', err => {
			logger.error(`Error spawning process: ${err.message}`);
			reject(err);
		});

		child.on('close', code => {
			if (code === 0) {
				logger.log(`LibreOffice command executed successfully`);
				resolve();
			} else {
				const errorMsg = `LibreOffice command failed with exit code ${code}`;
				logger.error(errorMsg);
				reject(new Error(errorMsg));
			}
		});
	});

	const parsedInputFilename = path.parse(inputFilename);
	const outputFilename = path.join(
		outputDir,
		parsedInputFilename.name + '.pdf',
	);

	logger.log(`Reading converted file from '${outputFilename}'`);

	try {
		const pdfBuffer = await fs.readFile(outputFilename);
		return pdfBuffer;
	} catch (error) {
		logger.error(`Error reading output PDF: ${error.message}`);
		throw error;
	}
};
