import type { JobProcessResult } from "./job-processor.types";

/**
 * Coordinates execution of queued jobs.
 *
 * The Job Processor is responsible for:
 * - claiming jobs from the queue
 * - resolving job definitions
 * - parsing and validating payloads
 * - invoking job handlers
 * - updating job lifecycle state
 * - handling retry and failure transitions
 */
export type IJobProcessorPort = {
	processNext: () => JobProcessResult;
};
