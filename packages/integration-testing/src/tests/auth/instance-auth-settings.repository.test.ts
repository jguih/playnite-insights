import { faker } from "@faker-js/faker";
import type { InstanceSessionId } from "@playatlas/auth/domain";
import type { PlayAtlasApiV1 } from "@playatlas/bootstrap/application";
import type { DomainEvent } from "@playatlas/common/application";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { makeTestEnvironmentAsync, type TestEnvironment } from "../../lib/environments";
import { recordDomainEvents } from "../../test.lib";

const buildRequest = (sessionId: InstanceSessionId): Request => {
	const request = new Request("https://playatlas-test.com/api/games", {
		method: "GET",
	});
	request.headers.set("Authorization", `Bearer ${sessionId}`);
	return request;
};

describe("Auth / Instance authentication lifecycle", () => {
	let unsubscribe: () => void;
	let events: DomainEvent[];
	let env: TestEnvironment;
	let api: PlayAtlasApiV1;

	beforeEach(async () => {
		env = await makeTestEnvironmentAsync();
		({ api } = env);
		({ events, unsubscribe } = recordDomainEvents(api));
	});

	afterEach(async () => {
		unsubscribe();
		await env.disposeAsync();
	});

	it("does not register instance more than once", async () => {
		// Arrange
		const password = faker.internet.password();

		// Act
		const result1 = await api.auth.getInstanceAuthService().registerAsync({ password });
		const result2 = await api.auth.getInstanceAuthService().registerAsync({ password });

		// Assert
		expect(result1.success).toBe(true);
		expect(result1.reason_code).toBe("instance_registered");

		expect(result2.success).toBe(false);
		expect(result2.reason_code).toBe("instance_already_registered");

		expect(events).toHaveLength(1);
		expect(events).toEqual([
			expect.objectContaining({
				name: "instance-registered",
			} satisfies Partial<DomainEvent>),
		]);
	});

	it("returns a valid session id on login", async () => {
		// Arrange
		const password = faker.internet.password();
		const registerResult = await api.auth.getInstanceAuthService().registerAsync({ password });
		expect(registerResult.success).toBe(true);

		events.length = 0;

		// Act
		const loginResult = await api.auth.getInstanceAuthService().loginAsync({ password });
		const sessionId = loginResult.success ? loginResult.sessionId : null;
		expect(sessionId).not.toBe(null);
		const verify = api.auth.getInstanceAuthService().verify({ request: buildRequest(sessionId!) });

		// Assert
		expect(verify.authenticated).toBe(true);

		expect(events).toHaveLength(1);
		expect(events).toEqual([
			expect.objectContaining({
				name: "instance-login",
			} satisfies Partial<DomainEvent>),
		]);
	});
});
