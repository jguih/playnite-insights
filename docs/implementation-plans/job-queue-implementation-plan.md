# Job Queue Implementation Plan

## References

- Engineering Note: [[Server] - Job Queue](../engineering-notes/confirmed/job_queue.md)

## Core Queue Infrastructure

### Persistence

- [x] create job table migration
- [x] create job repository
- [x] create atomic claim query
- [x] create job definition (payload schema + handler) registry

### Processing

- [ ] implement payload validation
- [x] implement retry scheduling
- [ ] implement worker loop
- [ ] implement lock expiration recovery

### Processing Validation

- [x] job domain entity automated unit tests

#### Job Lifecycle Automated Integration Tests

- [x] claiming a job
- [x] fails to claim when no job exists
- [x] fails to claim a job before it's scheduled run time
- [x] increments attempt count when claimed
- [x] marks job as processing when claimed
- [x] assigns worker id when claimed
- [x] prevents claiming an already processing job
- [x] claims jobs ordered by priority
- [x] claims jobs ordered by run time when priority matches
- [ ] marks job as completed after successful execution
- [ ] stores failure reason after failed execution
- [ ] schedules retry after failed execution
- [ ] marks job as failed after max attempts reached

## Transactional Event Dispatch

### Domain Event Buffering

- [ ] implement generic domain event buffer
- [ ] dispatch events after commit
- [ ] add domain event buffer to game-library uow
- [ ] migrate sync flow to deferred events

### Validation

- [ ] dispatches domain events after successful transaction commit
- [ ] does not dispatch domain events after rollback
- [ ] preserves event ordering within transaction

## Operational Reliability

### Worker Recovery

- [ ] implement lock expiration recovery
- [ ] allows expired processing lock to be reclaimed
- [ ] restart recovery test

### Retry Safety

- [x] failed job retry test

## Game Sync Migration

### Async Derived Processing

- [ ] move rescoring to jobs
- [ ] move manifest generation to jobs
- [ ] add orchestration subscribers

### Migration Validation

- [ ] synchronization request latency reduced
- [ ] rescoring remains idempotent
- [ ] manifest generation survives retry execution
- [ ] duplicate job execution remains safe