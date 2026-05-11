import type { JobType } from "@playatlas/common/domain";
import type { JobDefinition } from "./job-definition.type";

/**
 * Resolves job definitions given a job type.
 *
 * The registry acts as the runtime lookup mechanism used by the
 * Job Processor to locate payload schemas and handlers for
 * queued jobs.
 */
export type IJobDefinitionRegistry = {
	get: (type: JobType) => JobDefinition | null;
};
