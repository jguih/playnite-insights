# [Server] - Job Queue

## Status

✅ Confirmed

## Summary

Implement a persistent job queue for background processing to reduce request latency and isolate long-running operations from synchronous API flows.

Initially, the queue will be used for game synchronization and media synchronization workflows. Future features such as backup processing may also rely on the same infrastructure.

The system must support durable retries, scheduled execution, worker coordination and restart recovery.

## Motivation

Several server operations are expected to become increasingly expensive over time, including:

- game synchronization
- media synchronization
- image processing
- score engine computation

Executing these operations synchronously during request handling would increase response times and tightly couple API latency to processing duration.

A background job queue allows:

- faster API responses
- deferred processing
- retry handling
- scheduled execution
- operational visibility into long-running tasks
- future extensibility for other asynchronous workflows

## Existing Behavior

The server currently executes operations synchronously during request handling.

There is no durable background processing model and no infrastructure for:

- retrying failed operations
- scheduling future execution
- coordinating workers
- surviving server restart
- tracking processing lifecycle

## Desired Outcome

The system should support:

- durable background jobs persisted in SQLite
- scheduled execution through a mandatory run time
- restart-safe processing
- atomic job claiming
- retry with exponential-style backoff behavior
- worker coordination without double-processing
- structured payload validation using stable Zod schemas
- lifecycle observability through logging

Jobs should only execute after their scheduled run time.

Failed jobs should automatically retry until reaching their configured attempt limit.

## Constraints and Invariants

- jobs must survive server restart
- jobs must be persisted in SQLite
- job claiming must be atomic
- a job must never be processed concurrently by multiple workers
- jobs must not remain locked indefinitely
- payload validation must use stable Zod schemas
- payload schema versioning is out of scope
- existing payloads must remain parseable over time
- new payload fields must be optional
- fields must never be removed from payload schemas
- jobs cannot execute before their configured run time
- claiming a job must increment its attempt counter
- retry behavior must depend on the number of previous attempts
- maximum retry attempts must be configurable per job

## Alternatives Considered

### In-Memory Queue

Maintain jobs exclusively in memory.

Benefits:

- simple implementation
- low operational complexity

Drawbacks:

- jobs would be lost on restart
- no durable retry support
- unsuitable for scheduled execution
- difficult recovery semantics

Rejected because durability is a hard requirement.

### External Queue System

Use an external queue solution such as Redis-backed workers.

Benefits:

- mature ecosystem
- scalable worker coordination
- built-in retry primitives

Drawbacks:

- introduces additional infrastructure
- increases operational complexity
- unnecessary for current single-user deployment model

Rejected for now because SQLite-based persistence is sufficient for current scale and deployment constraints.

## Proposed Design

### Job Model

The current persistence model is defined as:

```sql
CREATE TABLE IF NOT EXISTS `job` (
  `Id` TEXT PRIMARY KEY,
  `Type` TEXT NOT NULL,
  `Payload` TEXT NOT NULL,
  `Status` TEXT NOT NULL,
  `Attempts` INTEGER NOT NULL DEFAULT 0,
  `MaxAttempts` INTEGER NOT NULL DEFAULT 3,
  `Priority` INTEGER NOT NULL DEFAULT 0,
  `RunAt` DATETIME NOT NULL,
  `LockedAt` DATETIME DEFAULT NULL,
  `WorkerId` TEXT DEFAULT NULL,
  `LastError` TEXT DEFAULT NULL,
  `CreatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `LastUpdatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `DeletedAt` DATETIME DEFAULT NULL,
  `DeleteAfter` DATETIME DEFAULT NULL
);
```

`Payload` contains a serialized JSON payload validated through a Zod schema associated with the job type.

Each job type must have a registered payload schema.

A schema registry is responsible for resolving the correct schema for a given job type.

### Job Status Lifecycle

A job may be in one of the following states:

- `queued`
- `processing`
- `done`
- `failed`

A job is considered locked when:

- status is `processing`
- worker id is assigned
- locked timestamp is not null

Processing locks must expire after 15 minutes to avoid permanent deadlocks caused by worker crashes.

### Claiming Strategy

Job claiming must be atomic and implemented in the infrastructure layer.

Claiming a job should:

- only consider jobs in `queued` state
- ignore jobs scheduled for the future
- select a single eligible job
- transition it to `processing`
- assign a worker id
- set locked timestamp
- increment attempt counter

The operation must prevent multiple workers from claiming the same job.

Eligible jobs should be claimed ordered by:

1. priority descending
2. run time ascending
3. creation time ascending

### Retry Behavior

If a job execution fails:

- the failure reason should be stored in the error field
- the worker should log the failure
- if the attempt count is below the configured limit:
  - the job returns to `queued`
  - the next run time increases proportionally to the number of attempts
- otherwise:
  - the job transitions to `failed`

Retry scheduling behavior does not need to implement a formal exponential backoff algorithm initially, but retry delay should increase as attempts increase.

### Worker Behavior

Workers are responsible for:

- claiming jobs
- validating payloads
- executing handlers
- updating job status
- logging lifecycle events

Workers should log:

- job claimed
- job execution started
- job completed
- job failed
- retry scheduled

## Validation Strategy

Validation should include:

- integration tests for atomic claiming
- retry behavior tests
- restart recovery tests
- lock expiration tests
- payload validation tests
- scheduled execution tests
- concurrency tests for worker coordination

Important behavioral guarantees to validate:

- jobs survive restart
- jobs are never double-claimed
- retries behave deterministically
- future-scheduled jobs are not processed early
- expired locks become recoverable

## Open Questions

- should failed jobs support manual replay?
- should job execution metrics be persisted for observability?

## Follow-ups

The following items are intentionally out of scope for the initial implementation:

- payload schema versioning
- priority queues
- cancellation support
- backup processing jobs
- persistent execution metrics
