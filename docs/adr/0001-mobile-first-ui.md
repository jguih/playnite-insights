# ADR-0001: Mobile-first constrained layout

## Status

**✅ Accepted**: 2026-03-02

## Context

PlayAtlas is currently a single-developer project under rapid iteration.
The UI structure, recommendation surfaces, and information hierarchy are still evolving.

Supporting a full responsive desktop layout at this stage would require:

* maintaining multiple layout hierarchies
* stabilizing navigation prematurely
* introducing layout-coupled components
* slowing down experimentation with recommendation presentation

However, the application still needs to be accessible from desktop browsers.

## Decision

The web application intentionally constrains the UI to a centered column (~450px width) even on desktop screens.

The document (body) remains the scroll container, but the visual layout emulates a mobile viewport.

This means PlayAtlas is currently treated as:
a mobile-first companion application that happens to be accessible via browser,
not a full desktop web application.

## Consequences

### Positive

* Fast iteration on discovery and recommendation UI
* Avoids premature component architecture lock-in
* Simplifies navigation and state management
* Encourages prioritization of surfaced content

### Negative

* Desktop users do not get a wide-screen optimized interface
* Some desktop affordances are limited
* Future desktop layout will require a deliberate redesign, not just breakpoints

## Alternatives considered

### Fully responsive layout now

Rejected because UI surfaces and interaction patterns are not yet stable.

### Separate desktop UI

Rejected due to maintenance cost for a single developer.

### Native mobile app first

Rejected because the PWA already fulfills accessibility and distribution needs.

## When to revisit

This decision should be revisited when one or more conditions are met:

* PlayAtlas usage includes long browsing sessions
* Users need library analysis or comparison views
* The recommendation model stabilizes
* Desktop usage becomes a primary access method

At that time, PlayAtlas should evolve into a dual-surface product:
mobile (play decision) and desktop (library understanding).
