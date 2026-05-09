import type { IJobHandlerPort, JobDefinition } from "@playatlas/job-queue/application";
import { vi } from "vitest";
import z from "zod";

const testSchema = z.object({
	test: z.literal(true),
});

type TestPayload = z.infer<typeof testSchema>;

export const makeTestJobDefinition = (): {
	handler: IJobHandlerPort<TestPayload>;
	definition: JobDefinition<TestPayload>;
} => {
	const handler: IJobHandlerPort<TestPayload> = {
		handle: vi.fn(),
	};

	const definition: JobDefinition<TestPayload> = {
		type: "game-library-sync",
		handler,
		schema: testSchema,
	};

	return { handler, definition };
};
