# Job Queue Implementation Plan

## References

- Engineering Note: [[Server] - Job Queue](../engineering-notes/confirmed/job_queue.md)

## Phase 1 - Persistence

- [x] create job table migration
- [x] create job repository
- [x] create atomic claim query
- [x] create job definition (payload schema + handler) registry

## Phase 2 - Worker Runtime

- [ ] implement worker loop
- [ ] implement payload validation
- [x] implement retry scheduling
- [ ] implement lock expiration recovery

## Phase 3 - Transactional Event Dispatch

- [ ] implement generic domain event buffer
- [ ] add domain event buffer to game-library uow
- [ ] dispatch events after commit
- [ ] migrate sync flow to deferred events

## Phase 4 - Game Sync Migration

- [ ] move rescoring to jobs
- [ ] move manifest generation to jobs
- [ ] add orchestration subscribers

## Phase 5 - Validation

- [x] job domain entity **automated unit tests**
- [ ] job lifecycle **automated integration tests**
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
  - [ ] allows expired processing lock to be reclaimed
- [ ] restart recovery test
- [ ] concurrent worker claim test
- [ ] failed job retry test