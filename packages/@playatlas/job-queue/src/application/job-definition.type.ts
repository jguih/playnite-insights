import type { JobType } from "@playatlas/common/domain";
import type z from "zod";
import type { IJobHandler } from "./job-handler.port";

export type JobDefinition<TPayload> = {
	type: JobType;
	schema: z.ZodType<TPayload>;
	handler: IJobHandler<TPayload>;
};
