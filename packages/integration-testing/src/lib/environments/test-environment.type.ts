import type { PlayAtlasApiV1 } from "@playatlas/bootstrap/application";
import type { ITestCompositionRootPort, PlayAtlasTestApiV1 } from "@playatlas/bootstrap/testing";

export type TestEnvironment = {
	root: ITestCompositionRootPort;
	api: PlayAtlasApiV1;
	testApi: PlayAtlasTestApiV1;
	disposeAsync: () => Promise<void>;
};
