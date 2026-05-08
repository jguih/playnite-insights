import type { JobId } from "@playatlas/common/domain";

export type JobProcessResult =
	| { processed: false }
	| {
			processed: true;
			status: "completed" | "failed" | "retry_scheduled";
			jobId: JobId;
	  };
