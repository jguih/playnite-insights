import type { PlayAtlasApiV1 } from "@playatlas/bootstrap/application";
import type { PlayAtlasTestApiV1 } from "@playatlas/bootstrap/testing";
import { JobStatus, MINUTE_MS, WorkerIdParser } from "@playatlas/common/domain";
import type { EnqueueJobCommand } from "@playatlas/job-queue/commands";
import { JOB_QUEUE_LOCK_TIMEOUT_MS } from "@playatlas/job-queue/domain";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { makeTestEnvironmentAsync, type TestEnvironment } from "../../lib/environments";

const createEnqueueJobCommand = (override: Partial<EnqueueJobCommand> = {}): EnqueueJobCommand => {
	const command: EnqueueJobCommand = {
		payload: "{}",
		priority: 1,
		type: "game-library-sync",
		...override,
	};
	return command;
};

describe("Job Queue", () => {
	let env: TestEnvironment;
	let api: PlayAtlasApiV1;
	let testApi: PlayAtlasTestApiV1;

	beforeEach(async () => {
		env = await makeTestEnvironmentAsync();
		({ api, testApi } = env);
		testApi.getClock().setCurrent(new Date("2026-03-03"));
	});

	afterEach(async () => {
		await env.disposeAsync();
	});

	it("enqueues and claims job", () => {
		// Arrange
		const command = createEnqueueJobCommand();
		const workerId = WorkerIdParser.fromTrusted(crypto.randomUUID());
		const now = testApi.getClock().now();

		// Act
		api.jobQueue.commands.getEnqueueJobCommandHandler().execute(command);
		const { success, job } = api.jobQueue.commands
			.getClaimNextJobCommandHandler()
			.execute({ now, workerId });

		// Assert
		expect(success).toBe(true);
		expect(job).not.toBe(null);
		expect(job?.getStatus()).toBe(JobStatus.processing);
		expect(job?.getAttempts()).toBe(1);
		expect(job?.getWorkerId()).toBe(workerId);
	});

	it("does not claim a processing job", () => {
		// Arrange
		const command = createEnqueueJobCommand();
		const workerId = WorkerIdParser.fromTrusted(crypto.randomUUID());
		const now = testApi.getClock().now();

		// Act
		api.jobQueue.commands.getEnqueueJobCommandHandler().execute(command);
		const claim1 = api.jobQueue.commands.getClaimNextJobCommandHandler().execute({ now, workerId });
		testApi.getClock().advance(10 * MINUTE_MS);
		const claim2 = api.jobQueue.commands.getClaimNextJobCommandHandler().execute({ now, workerId });

		// Assert
		expect(claim1.success).toBe(true);
		expect(claim1.job).not.toBe(null);
		expect(claim1.job?.getStatus()).toBe(JobStatus.processing);
		expect(claim2.success).toBe(false);
		expect(claim2.job).toBe(null);
	});

	it.each([
		{ priorities: [0, 50, 100] },
		{ priorities: [-1, 0, 10] },
		{ priorities: [-10, 0, 99] },
	])("claims highest priority job first", ({ priorities }) => {
		// Arrange
		const workerId = WorkerIdParser.fromTrusted(crypto.randomUUID());
		const now = testApi.getClock().now();
		const expected = [...priorities].sort((a, b) => b - a);

		// Act
		priorities.forEach((p) => {
			const command = createEnqueueJobCommand({ priority: p });
			api.jobQueue.commands.getEnqueueJobCommandHandler().execute(command);
		});
		expected.forEach((priority) => {
			const claim = api.jobQueue.commands
				.getClaimNextJobCommandHandler()
				.execute({ now, workerId });

			// Assert
			expect(claim.success).toBe(true);
			expect(claim.job).not.toBe(null);
			expect(claim.job?.getWorkerId()).toBe(workerId);
			expect(claim.job?.getPriority()).toBe(priority);
		});
	});

	it("claims jobs ordered by run time when priority matches", () => {
		// Arrange
		const workerId = WorkerIdParser.fromTrusted(crypto.randomUUID());
		const baseNow = testApi.getClock().now();
		const runTimes = [
			testApi.getClock().addMinutes(baseNow, 3),
			testApi.getClock().addMinutes(baseNow, 1),
			testApi.getClock().addMinutes(baseNow, 2),
		];

		runTimes.forEach((runAt) => {
			const command = createEnqueueJobCommand({
				priority: 100,
				runAt,
			});

			api.jobQueue.commands.getEnqueueJobCommandHandler().execute(command);
		});

		const expectedClaimOrder = [...runTimes].sort((a, b) => a.getTime() - b.getTime());

		// Act / Assert
		expectedClaimOrder.forEach((expectedRunAt) => {
			testApi.getClock().setCurrent(expectedRunAt);

			const claim = api.jobQueue.commands.getClaimNextJobCommandHandler().execute({
				now: expectedRunAt,
				workerId,
			});

			expect(claim.success).toBe(true);
			expect(claim.job).not.toBe(null);
			expect(claim.job?.getRunAt()).toEqual(expectedRunAt);
		});

		// Queue exhausted
		const emptyClaim = api.jobQueue.commands.getClaimNextJobCommandHandler().execute({
			now: testApi.getClock().now(),
			workerId,
		});

		expect(emptyClaim.success).toBe(false);
		expect(emptyClaim.job).toBe(null);
	});

	it("claims next returns null when no job is available", () => {
		// Arrange
		const workerId = WorkerIdParser.fromTrusted(crypto.randomUUID());
		const now = testApi.getClock().now();

		// Act
		const { success, job } = api.jobQueue.commands
			.getClaimNextJobCommandHandler()
			.execute({ now, workerId });

		// Assert
		expect(success).toBe(false);
		expect(job).toBe(null);
	});

	it("doesn't claim job before run at", () => {
		// Arrange
		const command = createEnqueueJobCommand({ runAt: testApi.getClock().now() });
		const workerId = WorkerIdParser.fromTrusted(crypto.randomUUID());

		// Act
		api.jobQueue.commands.getEnqueueJobCommandHandler().execute(command);

		testApi.getClock().regress(60 * MINUTE_MS);

		const claim1 = api.jobQueue.commands
			.getClaimNextJobCommandHandler()
			.execute({ now: testApi.getClock().now(), workerId });

		testApi.getClock().advance(60 * MINUTE_MS);

		const claim2 = api.jobQueue.commands
			.getClaimNextJobCommandHandler()
			.execute({ now: testApi.getClock().now(), workerId });

		// Assert
		expect(claim1.success).toBe(false);
		expect(claim1.job).toBe(null);

		expect(claim2.success).toBe(true);
		expect(claim2.job).not.toBe(null);
		expect(claim2.job?.getStatus()).toBe(JobStatus.processing);
	});

	it.each([
		{ time_to_advance_ms: JOB_QUEUE_LOCK_TIMEOUT_MS + MINUTE_MS },
		{ time_to_advance_ms: JOB_QUEUE_LOCK_TIMEOUT_MS },
	])(
		"reclaims a job with an expired lock after $time_to_advance_ms ms",
		({ time_to_advance_ms }) => {
			// Arrange
			const command = createEnqueueJobCommand();
			const worker1Id = WorkerIdParser.fromTrusted(crypto.randomUUID());
			const worker2Id = WorkerIdParser.fromTrusted(crypto.randomUUID());
			const startTime = testApi.getClock().now();

			// 1. enqueue and claim with worker 1 to set status to 'processing'
			api.jobQueue.commands.getEnqueueJobCommandHandler().execute(command);
			api.jobQueue.commands
				.getClaimNextJobCommandHandler()
				.execute({ now: startTime, workerId: worker1Id });

			// 2. advance clock past the 15-minute timeout (e.g., 20 minutes)
			// note: ensure this exceeds your JOB_QUEUE_LOCK_TIMEOUT_MS constant
			testApi.getClock().advance(time_to_advance_ms);

			// Act
			// 3. try to claim the same job with worker 2
			const { success, job } = api.jobQueue.commands
				.getClaimNextJobCommandHandler()
				.execute({ now: testApi.getClock().now(), workerId: worker2Id });

			// Assert
			expect(success).toBe(true);
			expect(job).not.toBe(null);
			expect(job?.getWorkerId()).toBe(worker2Id);
			expect(job?.getAttempts()).toBe(2);
			expect(job?.getStatus()).toBe(JobStatus.processing);
		},
	);
});
