import type { SyncRunnerResult } from "./sync-runner.types";

export type ISyncFlowPort = {
	executeAsync: () => Promise<SyncRunnerResult>;
};
