import * as v from 'valibot';

export const appConfigSchema = v.object({
	server: v.object({
		port: v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(65535)),
	}),
	programs: v.object({
		libreOffice: v.pipe(v.string(), v.minLength(1)),
	}),
	uploads: v.object({
		maxAttachments: v.pipe(
			v.number(),
			v.integer(),
			v.safeInteger(),
			v.minValue(0),
		),
		maxSizeMb: v.pipe(v.number(), v.minValue(0)),
	}),
});

export type AppConfig = v.InferOutput<typeof appConfigSchema>;
