import type { JobDefinition } from "@playatlas/job-queue/application";
import type { PlayAtlasApiV1 } from "../application";
import type { PlayAtlasTestApiV1 } from "./test.api.v1";

export type TestCompositionRootBuildDeps = {
	jobDefinitions: JobDefinition[];
};

export type TestCompositionRootBuildResult = { api: PlayAtlasApiV1; testApi: PlayAtlasTestApiV1 };
