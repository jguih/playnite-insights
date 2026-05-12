# Engineering Note Guidelines

This folder contains engineering notes for features or bug fixes. Each document here aims to aid the developer by documenting a plan for solving complex problems.

## Purpose

Engineering notes are tactical, execution-oriented documents used to define implementation plans, refactor paths, or technical investigations. They serve as the technical blueprint for a specific change within PlayAtlas.

## When to use

Use an engineering note when a task requires technical coordination or design clarity before implementation begins. While ADRs handle strategic architectural decisions, engineering notes focus on the "how" of a specific feature or refactor.

## Content Expectations

The core of every note is the transition from current state to the proposed solution:
- existing behavior: describe exactly how the system functions today, identifying the specific limitations or pain points being addressed
- desired outcome: define the specific behavior, state transitions, or guarantees that will exist after implementation

Technical depth is preferred and achieved through structured narrative that describes concrete system behavior.

## File Naming Convention

When creating a new note, use the following file name pattern `<short-topic>.md`, for example `job-queue.md`

## Suggested Structure

### Title

The note's title should be a main heading `#` and follow the pattern `[Environment] - Feature`, for example `[Server] - Job Queue`. Environment must be one of: `Server` or `Client`.

### Sections (`##`)

- **Status**: define the current phase of the document; must be one of: Exploratory, Confirmed, In Progress, Abandoned or Superseded
- **Summary**: describe the change and the expected outcome in 1-2 concise paragraphs focusing on concrete behavior
- **Motivation**: describe the problem or opportunity being addressed
- **Existing Behavior**: describe exactly how the system functions today, identifying the specific limitations or pain points being addressed
- **Desired Outcome**: define the specific behavior, state transitions, or guarantees that will exist after implementation
- **Constraints**: identify specific technical or domain constraints and invariants
- **Alternatives**: briefly describe rejected options and the reasoning for not selecting them; make sure to list benefits and drawbacks of each alternative considered
- **Proposed Design**: provide a technical execution plan and narrative prose for the implementation flow
- **Validation**: list specific unit or integration test cases along with manual verification steps
- **Open Questions**: document unresolved items that require further decision-making
- **Follow-ups**: track out of scope items, future improvements, or technical debt

### Constraints

Every engineering note must be created as a markdown file and be maintained in this repository.

## Reference

Use the following existing notes for reference:

- [[Server] - Job Queue](./confirmed/job-queue.md)