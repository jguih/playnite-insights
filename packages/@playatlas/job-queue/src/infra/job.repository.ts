import { ISODateSchema } from "@playatlas/common/common";
import {
	jobIdSchema,
	JobStatus,
	jobStatuses,
	jobTypes,
	workerIdSchema,
} from "@playatlas/common/domain";
import { makeBaseRepository, type BaseRepositoryDeps } from "@playatlas/common/infra";
import z from "zod";
import type { IJobMapperPort } from "../application/job.mapper";
import { JOB_QUEUE_LOCK_TIMEOUT_MS } from "../domain/job.constants";
import type { IJobRepositoryPort } from "./job.repository.port";

export const jobSchema = z.object({
	Id: jobIdSchema,
	Type: z.enum(jobTypes),
	Payload: z.string(),
	Status: z.enum(jobStatuses),
	Attempts: z.number(),
	MaxAttempts: z.number(),
	Priority: z.number(),
	RunAt: ISODateSchema,
	LockedAt: ISODateSchema.nullable(),
	WorkerId: workerIdSchema.nullable(),
	LastError: z.string().nullable(),
	CreatedAt: ISODateSchema,
	LastUpdatedAt: ISODateSchema,
	DeletedAt: ISODateSchema.nullable(),
	DeleteAfter: ISODateSchema.nullable(),
});

export type JobModel = z.infer<typeof jobSchema>;

export type JobRepositoryDeps = BaseRepositoryDeps & {
	jobMapper: IJobMapperPort;
};

export const makeJobRepository = ({
	getDb,
	logService,
	jobMapper,
}: JobRepositoryDeps): IJobRepositoryPort => {
	const TABLE_NAME = "job" as const;
	const COLUMNS: (keyof JobModel)[] = [
		"Id",
		"Type",
		"Payload",
		"Status",
		"Attempts",
		"MaxAttempts",
		"Priority",
		"RunAt",
		"LockedAt",
		"WorkerId",
		"LastError",
		"CreatedAt",
		"LastUpdatedAt",
		"DeletedAt",
		"DeleteAfter",
	] as const;

	const base = makeBaseRepository({
		getDb,
		logService,
		config: {
			tableName: TABLE_NAME,
			idColumn: "Id",
			insertColumns: COLUMNS,
			updateColumns: COLUMNS.filter((c) => c !== "Id"),
			mapper: jobMapper,
			modelSchema: jobSchema,
			getOrderBy: () => `ORDER BY LastUpdatedAt ASC, Id ASC`,
		},
	});

	const add: IJobRepositoryPort["add"] = (job) => {
		base._add(job);
	};

	const upsert: IJobRepositoryPort["upsert"] = (job) => {
		base._upsert(job);
	};

	const update: IJobRepositoryPort["update"] = (job) => {
		base._update(job);
	};

	const claimNext: IJobRepositoryPort["claimNext"] = ({ workerId, now }) => {
		return base.run(({ db }) => {
			const staleCutoff = new Date(now.getTime() - JOB_QUEUE_LOCK_TIMEOUT_MS).toISOString();
			const nowString = now.toISOString();
			const query = `
				UPDATE job
				SET
					Status = ?,
					LockedAt = ?,
					WorkerId = ?,
					Attempts = Attempts + 1,
					LastError = NULL,
					LastUpdatedAt = ?
				WHERE Id = (
					SELECT Id
					FROM job
					WHERE
						Status = ?
						AND RunAt <= ?
						AND DeletedAt IS NULL
						AND (
							LockedAt IS NULL
							OR LockedAt <= ?
						)
					ORDER BY Priority DESC, RunAt ASC, CreatedAt ASC
					LIMIT 1
				)
				AND Status = ?;
			`;

			const stmt = db.prepare(query);
			const result = stmt.run(
				JobStatus.processing,
				nowString,
				workerId,
				nowString,
				JobStatus.queued,
				nowString,
				staleCutoff,
				JobStatus.queued,
			);

			if (result.changes === 0) {
				return null;
			}

			const getJobQuery = `
				SELECT * 
				FROM job 
				WHERE WorkerId = ? 
					AND Status = ?
				ORDER BY LockedAt DESC LIMIT 1;
			`;
			const record = db.prepare(getJobQuery).get(workerId, JobStatus.processing);

			if (!record) {
				return null;
			}

			const { success, data: model, error } = jobSchema.safeParse(record);

			if (!success) {
				throw base.buildValidationError(error, { entity: "job", operation: "load" });
			}

			logService.debug(`Query returned record ${model.Id}`);

			return jobMapper.toDomain(model);
		}, `claimNext()`);
	};

	return { ...base.public, add, upsert, update, claimNext };
};
