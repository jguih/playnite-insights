# Engineering Notes

This folder contains implementation plans, architectural notes, refactor proposals, and technical decisions that are more tactical than ADRs.

## Purpose

Use Engineering Notes for:

- Feature implementation plans
- Refactor execution plans
- Performance investigations
- Operational runbooks
- Technical debt tracking
- Migration checklists
- Experiments and spikes

Use ADRs for strategic architecture decisions with long-term impact.

## Suggested File Naming

```text
YYYY-MM-DD-short-topic.md
```

Example:

```text
2026-04-21-recommendation-ranking-penalties.md
```

## Recommended Structure

```md
# Title

## Context
Why this note exists.

## Current State
How the system works today.

## Problem / Opportunity
What needs improvement.

## Goals
Concrete expected outcomes.

## Constraints
Technical or product constraints.

## Proposed Design
Implementation approach.

## Execution Steps
Ordered checklist.

## Validation
How to verify success.

## Risks
Potential pitfalls.

## Follow-ups
Future enhancements.
```

## Relationship With Existing Docs

- `docs/adr/` = durable decisions
- `docs/engineering-notes/` = execution-oriented notes
- `docs/mkdocs/` = product/user-facing documentation

## Notes From Prior Discussions

Keep these notes pragmatic and lightweight. Prefer documents that help future execution instead of theoretical overdesign.
