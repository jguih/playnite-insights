import type { ILogServicePort } from "@playatlas/common/application";
import { WorkerIdParser } from "@playatlas/common/domain";
import type { IClockPort } from "@playatlas/common/infra";
import type { IClaimNextJobCommandHandler } from "../commands";
import type { Job } from "../domain/job.entity";
import type { IJobRepositoryPort } from "../infra/job.repository.port";
import type { IJobDefinitionRegistry } from "./job-definition-registry.port";
import type { IJobProcessorPort } from "./job-processor.port";

export type JobProcessorDeps = {
	claimNextJobCommandHandler: IClaimNextJobCommandHandler;
	clock: IClockPort;
	logService: ILogServicePort;
	jobDefinitionRegistry: IJobDefinitionRegistry;
	jobRepository: IJobRepositoryPort;
};

/**
 * Creates an instance of {@link IJobProcessorPort}.
 *
 * @see {@link IJobProcessorPort}
 */
export const makeJobProcessor = ({
	claimNextJobCommandHandler,
	clock,
	logService,
	jobDefinitionRegistry,
	jobRepository,
}: JobProcessorDeps): IJobProcessorPort => {
	const workerId = WorkerIdParser.fromTrusted(crypto.randomUUID());

	const _build_job_description = (job: Job) => {
		return {
			workerId,
			jobId: job.getId(),
			jobType: job.getType(),
			jobStatus: job.getStatus(),
		};
	};

	const _get_json_payload = (job: Job): string | null => {
		try {
			const jsonPayload = JSON.parse(job.getPayload());
			return jsonPayload;
		} catch (error) {
			logService.error(
				`Failed to parse JSON payload for job ${job.getId()}`,
				error,
				_build_job_description(job),
			);

			return null;
		}
	};

	const _fail_job = (job: Job, message: string) => {
		job.fail(message);
		jobRepository.update(job);
	};

	logService.info(`Created job processor: ${workerId}`);

	return {
		processNext: () => {
			const now = clock.now();
			const { success, job } = claimNextJobCommandHandler.execute({ workerId, now });

			if (!success) {
				return { processed: false };
			}

			logService.info(`Claimed job for ${job.getType()}`, _build_job_description(job));

			const definition = jobDefinitionRegistry.get(job.getType());

			if (!definition) {
				logService.error(
					`No definition found while processing job of type ${job.getType()}`,
					_build_job_description(job),
				);

				_fail_job(job, "No definition found");

				return { processed: false };
			}

			const jsonPayload = _get_json_payload(job);

			if (jsonPayload === null) {
				_fail_job(job, "Failed to parse payload as JSON");
				return { processed: false };
			}

			const parsedPayloadResult = definition.schema.safeParse(jsonPayload);

			if (!parsedPayloadResult.success) {
				logService.error(
					`Failed to parse payload for job ${job.getId()}`,
					parsedPayloadResult.error,
					_build_job_description(job),
				);

				_fail_job(job, "Failed to parse payload using definition");

				return { processed: false };
			}

			const parsedPayload = parsedPayloadResult.data;
			const result = definition.handler.handle(parsedPayload);

			if (result.success) {
				logService.success(`Job completed successfully`, _build_job_description(job));

				job.complete();
				jobRepository.update(job);

				return {
					processed: true,
					status: "completed",
					jobId: job.getId(),
				};
			}

			logService.error(`Job failed`, _build_job_description(job));

			_fail_job(job, "handler failed to process job");

			return {
				processed: true,
				status: "failed",
				jobId: job.getId(),
			};
		},
	};
};
