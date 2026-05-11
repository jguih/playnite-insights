import type { IJobHandlerPort, JobDefinition } from "@playatlas/job-queue/application";
import { vi } from "vitest";
import z from "zod";

const testSchema = z.object({
	test: z.literal(true),
});

export const makeTestJobDefinition = () => {
	const handler = {
		handle: vi.fn(),
	} satisfies IJobHandlerPort;

	const definition = {
		type: "game-library-sync",
		handler,
		schema: testSchema,
	} satisfies JobDefinition;

	return { handler, definition };
};
