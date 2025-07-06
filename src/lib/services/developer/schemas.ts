import { z } from 'zod';

const developerSchema = z.object({
	Id: z.string(),
	Name: z.string()
});

export type Developer = z.infer<typeof developerSchema>;

export const developerSchemas = {
	developer: developerSchema
};
