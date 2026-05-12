# AI Use Guidelines

## Purpose

This document describes the workflow used during the development of PlayAtlas when collaborating with AI systems to produce engineering documentation, implementation plans, architectural notes, and technical analysis.

AI was primarily used as a research and organizational tool during development.

All generated output is reviewed, validated, refined, and ultimately approved manually by the author before becoming part of the project. AI-generated content is never treated as authoritative by itself.

The goal is not to outsource architecture decisions to AI, but instead:

- reduce cognitive overhead
- externalize exploratory thinking quickly
- preserve architectural intent
- maintain consistency across documents
- transform unstructured thoughts into durable engineering artifacts

This workflow exists primarily for future maintenance and long-term project continuity.

## Core Principle

The workflow is separated into three phases:

1. exploratory thinking
2. structural organization
3. refinement and validation

Instead of trying to produce polished documentation while thinking through a problem, raw ideas are captured first and structured later.

This reduces friction during architecture exploration and prevents losing important insights due to premature organization.

## Motivation

PlayAtlas is a long-term solo project involving multiple interacting systems:

- offline-first synchronization
- deterministic scoring engines
- domain event propagation
- reconciliation flows
- trust and authorization boundaries
- background processing
- distributed state coordination

Working alone on a project with these characteristics creates a significant cognitive burden over time.

Many architectural insights emerge during exploration instead of during formal design sessions. Attempting to simultaneously think through a problem while organizing documentation often slows down the exploration process itself.

This workflow was created to allow ideas to be captured quickly without worrying about structure first.

AI is then used later to transform those exploratory notes into structured engineering artifacts that are easier to maintain, revisit, and evolve over time.

## Workflow

### Phase 1 - Exploratory Thinking

The first phase intentionally ignores structure.

Notes are written quickly while thinking through a problem.

These notes may contain:

- fragmented ideas
- partial solutions
- constraints
- concerns
- invariants
- edge cases
- questions
- implementation friction
- architectural observations
- possible alternatives
- acceptance criteria

Grammar, formatting, and organization are intentionally deprioritized.

**The primary goal is preserving thought velocity**.

Example:

```text
[Server] - Job Queue

Implement a job queue for background processing to allow faster server responses.

- Initially, jobs will be used for games and media files sync
- Operations like score engine computation and image processing will be done in the background through a job
- Scheduled jobs must survive server restart
- Backup tool may use jobs for background processing as well, but this is for future reference only since there's no backup tool at this time
- A job must be tracked by one of its possible statuses: queued, processing, done or failed
- A job must not be locked in processing for longer than 15 minutes
(...)
```

Suggested tools for taking these notes are anything that provides easy access from any device and anywhere:

- Google Keep
- Notion
- Obsidian

### Phase 2 - Structural Organization

Once enough exploratory thinking exists, the raw notes are provided to the AI together with a structural blueprint.

Examples:

- [engineering note guidelines](docs/engineering-notes/README.md)
- [implementation plan templates](docs/implementation-plans/README.md)
- [ADR conventions](docs/adr/README.md)
- writing standards

The AI is then asked to:

- organize information
- identify sections
- group related concerns
- clarify wording
- preserve intent
- normalize terminology
- expose implicit assumptions

The AI is not expected to invent architecture.

Instead, it transforms exploratory knowledge into durable structure.

Example prompt pattern:

```text
REQUEST:
Draft a Engineering Note for PlayAtlas based on the raw input below.

CONSTRAINTS:
- do not consider the formatting or structure on the raw input

RAW INPUT:
[Server] - Job Queue
Implement background processing for image resizing and game sync.
- Must use SQLite for persistence.
- Exponential backoff on retries.
- Workers must be idempotent.
(...)
```

### Phase 3 - Refinement and Validation

After the initial engineering note or implementation plan exists, the document is iteratively refined through architecture-focused review discussions.

At this stage, the goal is no longer organization, but validation.

AI becomes useful for challenging assumptions, identifying architectural gaps, and stress-testing the proposed design against PlayAtlas constraints and invariants.

Examples of refinement topics include:

- validating offline-first guarantees
- reviewing synchronization flows
- identifying reconciliation edge cases
- verifying ownership boundaries
- reviewing idempotency assumptions
- analyzing restart recovery behavior
- checking event propagation consistency
- reviewing retry safety
- identifying hidden coupling between modules

Typical refinement prompts are much more concrete and architecture-specific than generic brainstorming prompts.

Example:

```text
In certain scenarios, a job may be stuck in 'processing' state indefinitely, for example when the server restarts while a handler is processing a job.

Review the proposed design and identify:

- other scenarios where this same issue could happen
- propose possible solutions without using an arbitrary stale lock time
- consider PlayAtlas as a single process application with a single job worker
```

This phase often results in:

- additional invariants
- improved terminology
- architectural simplification
- new validation tests
- additional implementation tasks
- clarification of responsibility boundaries

## Role of Templates and Guidelines

Templates and documentation guidelines are critical to this workflow.

The AI performs significantly better when given:

- expected document structure
- terminology conventions
- writing standards
- architectural vocabulary
- scope boundaries

These documents act as normalization rules for transforming unstructured thought into consistent artifacts.

Without explicit guidelines, output quality becomes less predictable.

## Effective Prompting Patterns

The most effective prompts usually contain:

- **Context**: what system or subsystem is involved
- **Existing Behavior**: how the current implementation behaves
- **Problem**: what friction, risk, or limitation exists
- **Constraints**: things that must remain true
- **Desired Outcome**: the intended behavioral result
- **Questions**: specific areas requiring analysis or refinement

Ideally, you want to cover all those topics during Phase 1.

## What AI Is Best Used For

Within PlayAtlas, AI is especially effective for:

- engineering notes
- implementation plans
- refactor planning
- migration sequencing
- architectural reviews
- testing strategy discussions
- invariant identification
- terminology normalization
- documentation synthesis

## Intentional Limitations

The workflow intentionally avoids:

- blindly generating architecture
- generating large systems without constraints
- accepting implementation decisions without review
- replacing domain understanding
- treating generated output as authoritative

AI-generated content is always reviewed and refined manually.

## Benefits Observed

This workflow significantly reduces the friction involved in documenting complex architectural thinking.

Instead of interrupting the exploration process to organize information, thoughts can be captured immediately and refined later. This makes it easier to preserve architectural context that would otherwise be lost during implementation.

Over time, the resulting engineering notes, ADRs, and implementation plans become a durable project memory system. Decisions, invariants, trade-offs, and operational assumptions become externalized instead of remaining implicit inside the developer's head. **The accumulated documentation also improves future AI-assisted discussions because architectural vocabulary, constraints, and system boundaries become increasingly explicit**.

The workflow also improves consistency across the project. Terminology, responsibility boundaries, and architectural language become more uniform because documents are generated and refined against shared guidelines and conventions.

## Anti-Patterns

The following approaches tend to produce weak results:

### Asking for Architecture Without Constraints

Example:

```text
Design the best queue system
```

This lacks operational context and usually produces generic output.

### Requesting Implementation Too Early

Generating code before understanding behavior often results in weak architecture.

### Over-Structuring Too Early

Premature formatting can interrupt exploratory thinking.

### Treating AI Output as Final

Generated documents should be reviewed, refined, and challenged.

## Long-Term Goal

The long-term goal of this workflow is not merely documentation generation.

The goal is building a durable engineering memory system for the project.

Over time, these artifacts help preserve:

- architectural intent
- operational assumptions
- invariants
- trade-offs
- historical reasoning
- implementation sequencing

This becomes increasingly valuable as the system evolves.
