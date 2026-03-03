# Architecture Decision Records (ADRs)

## Index

| ADR | Title | Status | Date |
|-----|------|------|------|
| [ADR-0001](./0001-mobile-first-ui.md) | Mobile-first constrained layout | Accepted | 2026-03-02 |
| [ADR-0002](./0002-extension-registration-and-trust-model.md) | Extension registration and trust model | Accepted | 2026-03-03 |
| [ADR-0003](./0003-offline-first-session-ingestion.md) | Offline-first game session ingestion and reconciliation model | Accepted | 2026-03-03 |

## What this is

This directory contains Architecture Decision Records for PlayAtlas.

ADRs capture technical decisions that affect
the long-term structure, evolution, or direction of the system.

They preserve context, especially for future revisions of the project.

## Purpose

PlayAtlas evolves quickly. Some decisions are intentionally made to favor
iteration speed and product discovery over completeness.

ADRs **record**:

- What decision was made
- Why it was made
- What alternatives were considered
- What trade-offs were accepted
- When the decision should be revisited

ADRs are not tasks and not feature plans.  
They document reasoning.

## When to create an ADR

Create an ADR when a decision:

- Changes architectural direction
- Intentionally limits future flexibility
- Defines product surface boundaries (e.g., mobile-first UI)
- Impacts data modeling or system structure
- Is difficult or costly to reverse
- Will likely be questioned later

Do NOT create ADRs for:

- Minor refactors
- Small implementation details
- Bug fixes
- Temporary experiments

## Location

ADRs live inside the repository:

    /docs/adr/

They are versioned with the codebase and are NOT part of the public MkDocs documentation.

## Naming Convention

Files follow this format:

    ADR-0001-short-title.md
    ADR-0002-another-decision.md

Rules:

- Use incremental numbering
- Never renumber
- Never delete ADRs

If a decision changes, create a new ADR and mark the old one as **Superseded**.

## Status Values

Each ADR must include a status:

- 🟡 Proposed
- ✅ Accepted
- 🔁 Superseded
- ❌ Rejected

Only **Accepted** ADRs represent active architectural decisions.

## Updating Decisions

When revisiting a decision:

1. Do not rewrite historical reasoning
2. Create a new ADR referencing the previous one
3. Mark the old ADR as Superseded

This preserves architectural history.

## Philosophy

PlayAtlas is a long-term evolving system.

ADRs ensure architectural direction remains intentional rather than accidental.

They are written primarily for future maintainers,
including future versions of the original author.