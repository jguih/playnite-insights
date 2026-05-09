import type { JobHandlerResult } from "./job-handler.types";

/**
 * Processes a parsed and validated job payload.
 *
 * Job handlers contain the business logic associated with a
 * specific job type and are invoked by the Job Processor after
 * payload validation succeeds.
 */
export type IJobHandlerPort<TPayload> = {
	handle: (payload: TPayload) => JobHandlerResult;
};
