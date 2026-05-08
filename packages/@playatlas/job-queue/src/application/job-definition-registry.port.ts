import type { JobType } from "@playatlas/common/domain";
import type { JobDefinition } from "./job-definition.type";

export type IJobDefinitionRegistry = {
	get: (type: JobType) => JobDefinition<unknown> | null;
};
