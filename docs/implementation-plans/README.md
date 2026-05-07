# Implementation Plans

This folder contains implementation plans for features or bug fixes. Each document here aims to aid the developer by breaking the problem into smaller issues that can be implemented more easily.

## Purpose

Use Implementation Plans to list all activities related to a feature or bug fix that you'll work on.

## Suggested File Naming

```text
<topic>-implementation-plan.md
```

Example:

```text
job-queue-implementation-plan.md
```

## Recommended Structure

The recommended structure is to use checklist like this:

```md
## Phase <n> - <title>

- [x] completed task
- [ ] pending task
  - [ ] sub task
```

Example:

```md
# Job Queue Implementation Plan

## References

- Engineering Note: [[Server] - Job Queue](../engineering-notes/confirmed/job_queue.md)

## Phase 1 - Persistence

- [x] create job table migration
- [x] create job repository
- [x] create atomic claim query
- [ ] create payload schema registry

## Phase 2 - Worker Runtime

- [ ] implement worker loop
- [ ] implement payload validation
- [ ] implement retry scheduling
- [ ] implement lock expiration recovery

(...)
```

Keep it simple!
