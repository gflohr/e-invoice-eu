import { spawn } from 'child_process';
import { EventEmitter } from 'events';
import { promises as fs } from 'fs';
import * as path from 'path';
import * as tmp from 'tmp-promise';

import { renderSpreadsheet } from './render-spreadsheet';

const mockLogger = {
	log: jest.fn(),
	error: jest.fn(),
	warn: jest.fn(),
};

jest.mock('child_process', () => ({
	spawn: jest.fn(),
}));

jest.mock('fs', () => ({
	promises: {
		writeFile: jest.fn(),
		readFile: jest.fn(),
	},
}));

jest.mock('tmp-promise', () => ({
	tmpName: jest.fn(),
	file: jest.fn(),
	dir: jest.fn(),
}));

jest.mock('path', () => ({
	...jest.requireActual('path'),
	parse: jest.fn(),
	join: jest.fn(),
}));

describe('renderSpreadsheet', () => {
	const libreofficePath = '/usr/bin/libreoffice';
	const filename = 'test.xlsx';
	const buffer = new Uint8Array([1, 2, 3]);
	const mockUserDir = '/tmp/userdir';
	const mockInputFile = '/tmp/input.xlsx';
	const mockOutputDir = '/tmp/output';
	const mockOutputFile = '/tmp/output/test.pdf';

	beforeEach(() => {
		jest.clearAllMocks();

		(tmp.tmpName as jest.Mock).mockResolvedValue(mockUserDir);
		(tmp.file as jest.Mock).mockResolvedValue({ path: mockInputFile });
		(tmp.dir as jest.Mock).mockResolvedValue({ path: mockOutputDir });
		(fs.writeFile as jest.Mock).mockResolvedValue(undefined);
		(fs.readFile as jest.Mock).mockResolvedValue(Buffer.from('PDF data'));
		(path.parse as jest.Mock).mockReturnValue({ ext: '.xlsx', name: 'test' });
		(path.join as jest.Mock).mockReturnValue(mockOutputFile);
	});

	it('should convert a spreadsheet to PDF successfully', async () => {
		const mockChildProcess = {
			on: jest.fn((event, callback) => {
				if (event === 'close') {
					setImmediate(() => callback(0));
				}
			}),
		};

		(spawn as jest.Mock).mockReturnValue(mockChildProcess);

		const pdfBuffer = await renderSpreadsheet(
			filename,
			buffer,
			libreofficePath,
			mockLogger,
		);

		expect(tmp.tmpName).toHaveBeenCalled();
		expect(tmp.file).toHaveBeenCalled();
		expect(tmp.dir).toHaveBeenCalled();
		expect(fs.writeFile).toHaveBeenCalledWith(mockInputFile, buffer);
		expect(spawn).toHaveBeenCalledWith(libreofficePath, expect.any(Array), {
			stdio: 'inherit',
		});
		expect(mockLogger.log).toHaveBeenCalledWith(
			expect.stringContaining('Executing command'),
		);
		expect(fs.readFile).toHaveBeenCalledWith(mockOutputFile);
		expect(pdfBuffer).toEqual(Buffer.from('PDF data'));
	});

	it('should throw an error if LibreOffice fails', async () => {
		const mockChildProcess = {
			on: jest.fn((event, callback) => {
				if (event === 'close') {
					setImmediate(() => callback(1));
				}
			}),
		};
		(spawn as jest.Mock).mockReturnValue(mockChildProcess);

		await expect(
			renderSpreadsheet(filename, buffer, libreofficePath, mockLogger),
		).rejects.toThrow('LibreOffice command failed with exit code 1');
		expect(mockLogger.error).toHaveBeenCalledWith(
			expect.stringContaining('LibreOffice command failed'),
		);
	});

	it('should throw an error if reading the output PDF fails', async () => {
		(fs.readFile as jest.Mock).mockRejectedValue(new Error('File not found'));

		const mockChildProcess = {
			on: jest.fn((event, callback) => {
				if (event === 'close') {
					setImmediate(() => callback(0));
				}
			}),
		};
		(spawn as jest.Mock).mockReturnValue(mockChildProcess);

		await expect(
			renderSpreadsheet(filename, buffer, libreofficePath, mockLogger),
		).rejects.toThrow('File not found');
		expect(mockLogger.error).toHaveBeenCalledWith(
			expect.stringContaining('Error reading output PDF'),
		);
	});

	it('should reject when spawn emits an error event', async () => {
		const mockChild = new EventEmitter();
		(spawn as jest.Mock).mockReturnValue(mockChild);

		const promise = renderSpreadsheet(
			filename,
			buffer,
			libreofficePath,
			mockLogger,
		);

		const testError = new Error('spawn failed');
		process.nextTick(() => {
			mockChild.emit('error', testError);
		});

		await expect(promise).rejects.toThrow('spawn failed');
	});
});
