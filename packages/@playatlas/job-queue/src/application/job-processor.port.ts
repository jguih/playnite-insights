import type { JobProcessResult } from "./job-processor.types";

export type IJobProcessorPort = {
	processNext: () => JobProcessResult;
};
