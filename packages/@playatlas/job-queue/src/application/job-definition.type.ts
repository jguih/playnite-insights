import type { JobType } from "@playatlas/common/domain";
import type z from "zod";
import type { IJobHandler } from "./job-handler.port";

/**
 * Defines how a job type should be processed.
 *
 * A job definition links a job type with:
 * - a payload schema used for runtime validation
 * - a handler responsible for processing the parsed payload
 *
 * Definitions are registered in the Job Definition Registry and
 * resolved by the Job Processor during execution.
 */
export type JobDefinition<TPayload> = {
	type: JobType;
	schema: z.ZodType<TPayload>;
	handler: IJobHandler<TPayload>;
};
