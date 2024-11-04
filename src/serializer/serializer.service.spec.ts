import { Test, TestingModule } from '@nestjs/testing';

import { SerializerOptions, SerializerService } from './serializer.service';

const options: SerializerOptions = {
	prettyPrint: true,
	indent: '\t',
};

describe('SerializerService', () => {
	let service: SerializerService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [SerializerService],
		}).compile();

		service = module.get<SerializerService>(SerializerService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	it('should serialize an object', () => {
		const xml = service.serialize(
			{
				Root: {},
				'Root@xmlns': 'urn:mine',
			},
			options,
		);

		expect(xml).toBe(
			'<?xml version="1.0" encoding="utf-8"?>\n<Root xmlns="urn:mine"/>',
		);
	});

	it('should serialize a nested object', () => {
		const xml = service.serialize(
			{
				Root: {
					foo: {
						bar: 'foobar',
					},
					baz: 'bazoo',
				},
				'Root@xmlns': 'urn:mine',
			},
			options,
		);

		expect(xml).toMatchSnapshot();
	});

	it('should serialize attributes of text nodes', () => {
		const xml = service.serialize(
			{
				attributes: {
					foo: 'bar',
					'foo@baz': 'bazoo',
				},
				'attributes@xmlns': 'urn:mine',
			},
			options,
		);

		expect(xml).toMatchSnapshot();
	});

	it('should serialize attributes of object nodes', () => {
		const xml = service.serialize(
			{
				attributes: {
					foo: {
						bar: 'baz',
					},
					'foo@baz': 'bazoo',
				},
				'attributes@xmlns': 'urn:mine',
			},
			options,
		);

		expect(xml).toMatchSnapshot();
	});

	it('should serialize arrays', () => {
		const xml = service.serialize(
			{
				attributes: {
					foo: [
						{
							bar: 1,
							baz: 11,
						},
						{
							bar: 2,
							baz: 22,
						},
						{
							bar: 3,
							baz: 33,
						},
					],
				},
				'attributes@xmlns': 'urn:mine',
			},
			options,
		);

		expect(xml).toMatchSnapshot();
	});
});
