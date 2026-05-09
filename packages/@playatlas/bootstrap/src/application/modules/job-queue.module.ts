import type { ILogServiceFactoryPort } from "@playatlas/common/application";
import type { DbGetter, IClockPort } from "@playatlas/common/infra";
import {
	makeJobDefinitionRegistry,
	makeJobFactory,
	makeJobMapper,
	makeJobProcessor,
	type JobDefinitionRegistryDeps,
} from "@playatlas/job-queue/application";
import {
	makeClaimNextJobCommandHandler,
	makeEnqueueJobCommandHandler,
} from "@playatlas/job-queue/commands";
import { makeJobRepository } from "@playatlas/job-queue/infra";
import type { IJobQueueModulePort } from "./job-queue.module.port";

export type IJobQueueModuleDeps = {
	logServiceFactory: ILogServiceFactoryPort;
	clock: IClockPort;
	getDb: DbGetter;
	jobDefinitions: JobDefinitionRegistryDeps["jobDefinitions"];
};

export const makeJobQueueModule = ({
	logServiceFactory,
	clock,
	getDb,
	jobDefinitions,
}: IJobQueueModuleDeps): IJobQueueModulePort => {
	const buildLog = (ctx: string) => logServiceFactory.build(ctx);

	const jobFactory = makeJobFactory({ clock });
	const jobMapper = makeJobMapper({ jobFactory });
	const jobRepository = makeJobRepository({
		jobMapper,
		getDb,
		logService: buildLog("JobRepository"),
	});

	const enqueueJobCommandHandler = makeEnqueueJobCommandHandler({ jobFactory, jobRepository });
	const claimNextJobCommandHandler = makeClaimNextJobCommandHandler({ jobRepository });

	const jobDefinitionRegistry = makeJobDefinitionRegistry({ jobDefinitions });
	const jobProcessor = makeJobProcessor({
		claimNextJobCommandHandler,
		clock,
		jobDefinitionRegistry,
		jobRepository,
		logService: buildLog("JobProcessor"),
	});

	const api: IJobQueueModulePort = {
		getJobFactory: () => jobFactory,
		getJobMapper: () => jobMapper,
		getJobRepository: () => jobRepository,
		getJobDefinitionRegistry: () => jobDefinitionRegistry,
		getJobProcessor: () => jobProcessor,
		commands: {
			getEnqueueJobCommandHandler: () => enqueueJobCommandHandler,
			getClaimNextJobCommandHandler: () => claimNextJobCommandHandler,
		},
	};

	return Object.freeze(api);
};
