# ADR-0003: Offline-first game session ingestion and reconciliation model

## Status

**✅ Accepted**: 2026-03-03

## Context

The PlayAtlas Exporter runs inside Playnite and cannot assume:

- Reliable network connectivity
- Graceful shutdown
- Immediate server availability
- Crash-free execution

The system must guarantee that:

- Session start time is never lost
- A game cannot have multiple concurrent open sessions
- The exporter can function fully offline
- The server remains the final authority for domain invariants

A naive in-memory session model would lose the session start time if Playnite crashes before the session is closed.

Additionally, opening a new session while a previous one is still marked as active (for example after a power outage) must be handled deterministically.

## Decision

The exporter implements an offline-first, file-backed session ingestion model with local invariant enforcement and eventual reconciliation.

### Local durability

When `OpenSessionAsync` is called:

- A `GameSession` is immediately serialized to a JSON file on disk
- An active index file maps `GameId → SessionId`

This guarantees that session start time is durably persisted before any server interaction.

### Session identity

- `SessionId = SHA256(gameId + startTime)`
- Session identity is generated client-side
- The server does not assign session IDs

This allows sessions to be opened without server roundtrip and supports at-least-once delivery.

### Active session invariant

An active index tracks currently open sessions.

Invariant:

A game cannot have more than one open session.

Before opening a new session, the exporter checks the active index and reconciles any existing session.

### Reconciliation on open

If an open session already exists:

- The session is loaded from disk
- Its age is calculated (`now - startTime`)
- A deterministic rule is applied:

  - If age > 3 hours → mark session as `Stale`
  - Otherwise → close session using computed duration

The updated session is persisted and removed from the active index before a new session is created.

### Synchronization model

`ProcessPendingSessionsAsync` iterates over all session files:

- Invalid files are deleted
- Non-in-progress sessions are sent and deleted on success
- In-progress sessions are reconciled according to age rules
- Sessions older than retention threshold (14 days) may be deleted

Delivery model:

At-least-once.  
The server must tolerate duplicate close attempts.

### Domain authority split

Exporter responsibilities:

- Local durability
- Single-open-session enforcement
- Deterministic reconciliation
- Retry logic
- Garbage collection

Server responsibilities:

- Validate legal state transitions
- Reject invalid operations
- Enforce domain invariants

Examples:

- Opening a session is not idempotent
- Closing a session is idempotent
- Illegal transitions are rejected server-side

## Consequences

### Positive

- Session start time is never lost due to crash
- Offline operation is fully supported
- No concurrent open sessions are allowed
- Crash recovery is deterministic
- Close operations are safe to retry
- Responsibility boundaries are clearly defined

### Negative

- Time-based reconciliation (3h threshold) is heuristic
- Relies on wall clock and is susceptible to clock drift
- JSON file storage is not transactional
- No concurrency handling across separate installations
- Client-generated IDs depend on timestamp precision

## Alternatives considered

### In-memory session state

Rejected because session start time could be lost on crash.

### Server-generated session IDs

Rejected because it would require server availability at open time.

### Fully server-authoritative lifecycle

Rejected because it would violate offline requirements.

### Embedded database instead of JSON files

Deferred due to added complexity at current scale.

## When to revisit

This decision should be revisited when one or more conditions are met:

- Multiple concurrent installations must reconcile shared state
- Stronger crash-consistency guarantees are required
- Atomic file writes become necessary
- Monotonic time abstraction is introduced
- The retention policy or reconciliation heuristics prove insufficient