import z from 'zod';

export const overviewDataSchema = z.array(
	z.object({
		Id: z.string(),
		IsInstalled: z.number(),
		Playtime: z.number()
	})
);
export type DashPageOverviewData = z.infer<typeof overviewDataSchema>;
