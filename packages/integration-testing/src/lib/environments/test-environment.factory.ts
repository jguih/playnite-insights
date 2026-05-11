import { makeTestCompositionRoot } from "@playatlas/bootstrap/testing";
import type { JobDefinition } from "@playatlas/job-queue/application";
import { rm } from "fs/promises";
import { createTempDataDirAsync } from "../infra/create-tmp-dir";
import type { TestEnvironment } from "./test-environment.type";

export type TestEnvironmentDeps = {
	jobDefinitions?: JobDefinition[];
};

export const makeTestEnvironmentAsync = async ({
	jobDefinitions,
}: TestEnvironmentDeps = {}): Promise<TestEnvironment> => {
	const _data_dir = process.env.PLAYATLAS_DATA_DIR ?? (await createTempDataDirAsync());
	const _job_definitions = jobDefinitions ?? [];

	const root = makeTestCompositionRoot({
		env: {
			PLAYATLAS_LOG_LEVEL: process.env.PLAYATLAS_LOG_LEVEL,
			PLAYATLAS_MIGRATIONS_DIR: process.env.PLAYATLAS_MIGRATIONS_DIR,
			PLAYATLAS_USE_IN_MEMORY_DB: process.env.PLAYATLAS_USE_IN_MEMORY_DB,
			PLAYATLAS_DATA_DIR: _data_dir,
		},
	});

	const { api, testApi } = await root.buildAsync({ jobDefinitions: _job_definitions });

	const _dispose_async: TestEnvironment["disposeAsync"] = async () => {
		api.getLogService().warning(`Deleting integration test data dir at ${_data_dir}`);
		await rm(_data_dir, { force: true, recursive: true });
	};

	return { root, api, testApi, disposeAsync: _dispose_async };
};
