# Job Queue Implementation Plan

## References

- engineering note: [[server] - job queue](../engineering-notes/confirmed/job_queue.md)

## Infrastructure & Worker Logic

- [x] create job table migration
- [x] create job repository
- [x] create atomic claim query
- [x] create job definition (payload schema + handler) registry
- [x] implement payload validation
- [x] implement retry scheduling
- [ ] implement worker loop
- [x] implement lock expiration recovery
- [ ] implement recovery of orphaned jobs
- [ ] include orphaned job recovery during composition root build

## Event Reliability & Transactional Dispatch

- [ ] implement generic domain event buffer
- [ ] dispatch events after commit
- [ ] add domain event buffer to game-library uow
- [ ] migrate sync flow to deferred events

## Game Library Migration

- [ ] move rescoring to jobs
- [ ] move manifest generation to jobs

## Automated Verification

### Domain & Lifecycle

- [x] job domain entity automated unit tests
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
- [x] schedules retry after failed execution
- [ ] marks job as failed after max attempts reached

### Operational Reliability

- [ ] dispatches domain events after successful transaction commit
- [ ] does not dispatch domain events after rollback
- [ ] preserves event ordering within transaction
- [x] allows expired processing lock to be reclaimed
- [ ] restart recovery test (verify orphaned jobs are reset)
- [x] failed job retry test

### Migration Quality

- [ ] rescoring remains idempotent
- [ ] manifest generation survives retry execution
- [ ] duplicate job execution remains safe