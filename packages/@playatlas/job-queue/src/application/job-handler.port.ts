import type { JobHandlerResult } from "./job-handler.types";

export type IJobHandler<TPayload> = {
	handle: (payload: TPayload) => JobHandlerResult;
};
