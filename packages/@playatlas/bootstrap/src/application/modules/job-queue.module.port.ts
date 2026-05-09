import type {
	IJobDefinitionRegistry,
	IJobFactoryPort,
	IJobMapperPort,
	IJobProcessorPort,
} from "@playatlas/job-queue/application";
import type {
	IClaimNextJobCommandHandler,
	IEnqueueJobCommandHandler,
} from "@playatlas/job-queue/commands";
import type { IJobRepositoryPort } from "@playatlas/job-queue/infra";

/**
 * Public capabilities exposed by the Job Queue module.
 *
 * Provides access to queue infrastructure, job processing runtime,
 * definition resolution and queue-related command handlers.
 *
 * This interface acts as the module boundary used by the composition
 * root and external modules.
 */
export type IJobQueueModulePort = Readonly<{
	getJobFactory: () => IJobFactoryPort;
	getJobMapper: () => IJobMapperPort;
	getJobRepository: () => IJobRepositoryPort;

	getJobDefinitionRegistry: () => IJobDefinitionRegistry;
	getJobProcessor: () => IJobProcessorPort;

	commands: {
		getEnqueueJobCommandHandler: () => IEnqueueJobCommandHandler;
		getClaimNextJobCommandHandler: () => IClaimNextJobCommandHandler;
	};
}>;
