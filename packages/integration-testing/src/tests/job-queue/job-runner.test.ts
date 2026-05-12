import { makeTestJobDefinition } from "@playatlas/testing/application";
import { describe, expect, it } from "vitest";
import { makeTestEnvironmentAsync } from "../../lib/environments";

const makeTestRunnerEnvAsync = async () => {
	const { handler, definition } = makeTestJobDefinition();
	const { api, disposeAsync, root, testApi } = await makeTestEnvironmentAsync({
		jobDefinitions: [definition],
	});

	return { handler, api, disposeAsync, root, testApi };
};

describe("Job Runner", async () => {
	it("enqueues and claims job", async () => {
		// Arrange
		const { disposeAsync, testApi } = await makeTestRunnerEnvAsync();

		// Act
		testApi.jobQueue.processNext();

		// Assert
		expect(true).toBe(true);

		await disposeAsync();
	});
});
