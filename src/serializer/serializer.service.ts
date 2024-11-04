import { Injectable } from '@nestjs/common';
import { create } from 'xmlbuilder2';
import { ExpandObject } from 'xmlbuilder2/lib/interfaces';

export type SerializerOptions = {
	indent?: string;
	prettyPrint?: boolean;
};

@Injectable()
export class SerializerService {
	serialize(
		data: { [elem: string]: any },
		options: SerializerOptions = {},
	): string {
		const tree = this.convert(data);

		const doc = create({ version: '1.0', encoding: 'utf-8' }).ele(tree);

		return doc.end({
			prettyPrint: options.prettyPrint,
			indent: options.indent,
		});
	}

	private convert(input: { [key: string]: any }): ExpandObject {
		let output: ExpandObject;
		if (Array.isArray(input)) {
			output = [];
			for (let i = 0; i < input.length; ++i) {
				output.push(this.convert(input[i]));
			}
		} else {
			output = {};
			for (const key in input) {
				if (typeof input[key] === 'object') {
					output[key] = this.convert(input[key]);
				} else {
					const [elem, attr] = key.split('@', 2);

					if (typeof attr !== 'undefined') {
						if (!(elem in output)) {
							throw new Error(`orphan attribute ${key}`);
						}

						if (typeof output[elem] === 'string') {
							output[elem] = {
								'#': output[elem],
								[`@${attr}`]: input[key].toString(),
							};
						} else {
							output[elem][`@${attr}`] = input[key].toString();
						}
					} else {
						output[elem] = input[key].toString();
					}
				}
			}
		}

		return output;
	}
}
