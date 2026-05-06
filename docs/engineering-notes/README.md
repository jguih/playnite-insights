# Engineering Notes

This folder contains implementation plans, architectural notes, refactor proposals, and technical decisions that are more tactical than ADRs.

## Purpose

Use Engineering Notes for:

- feature implementation plans
- refactor execution plans
- performance investigations
- operational runbooks
- technical debt tracking
- migration checklists
- experiments and spikes

Use ADRs for strategic architecture decisions with long-term impact.

## Suggested File Naming

```text
short-topic.md
```

Example:

```text
recommendation-ranking-penalties.md
```

## Recommended Structure

```md
# Title

## Status

- 🔍 Exploratory
- ✅ Confirmed
- 🚧 In Progress
- ❌ Abandoned
- ⌛ Superseded

## Summary

Short explanation of:

- what is changing
- why it matters
- expected outcome

## Motivation

Why this note exists.

Examples:

- operational issue
- scalability concern
- implementation friction
- upcoming feature dependency
- architectural inconsistency

## Existing Behavior

Relevant parts of the current system behavior.

Focus on:

- important flows
- ownership boundaries
- invariants
- known limitations

## Desired Outcome

Describe the intended end state.

Prefer concrete behavioral outcomes.

Examples:

- jobs survive restart
- retries are safe
- synchronization latency is reduced

## Constraints and Invariants

Things that must remain true.

Examples:

- server remains source of truth
- delivery remains at-least-once
- workers remain stateless
- operations remain idempotent

## Alternatives Considered

### Alternative A

Description, benefits, drawbacks.

### Alternative B

Description, benefits, drawbacks.

Document:

- why an option was rejected
- trade-offs
- unknowns
- operational impact

Keep this lightweight.

## Proposed Design

Describe the proposed implementation.

This section is intentionally flexible.

It may include:

- execution flow
- persistence strategy
- data model
- APIs
- concurrency model
- retry behavior
- migration notes

Use whatever structure best communicates the design.

## Validation Strategy

How the proposal will be validated.

Examples:

- integration tests
- restart recovery tests
- stress testing
- observability metrics
- manual verification

## Open Questions

Unresolved concerns or uncertainties.

## Follow-ups

Future improvements intentionally excluded from scope.
```

## Writing Conventions

For consistency across engineering notes:

- bullet lists should use lower-case entries unless grammatically required otherwise
- bullet list items should not end with periods
- headings should remain concise and descriptive
- prefer short explanatory paragraphs over large prose blocks
- prefer concrete behavioral language over abstract architectural terminology

## Relationship With Existing Docs

- `docs/adr/` = durable decisions
- `docs/engineering-notes/` = execution-oriented notes
- `docs/mkdocs/` = product/user-facing documentation

## Notes From Prior Discussions

Keep these notes pragmatic and lightweight. Prefer documents that help future execution instead of theoretical overdesign.

