# Recommendation Ranking Penalties

## Context
The recommendation engine currently relies primarily on vector similarity between a target vector and candidate game vectors. This is strong for relevance, but incomplete for ranking.

Similarity answers: "How similar is this game?"
Ranking should answer: "How likely is the user to want to play this now?"

## Current State
Likely flow:

```text
candidate vector -> similarity score -> sort desc -> return list
```

Relevant code paths:

- `playnite-insights/src/lib/modules/game-library/application/recommendation-engine/recommendation-engine.ts`
- `recommendation-engine.types.ts`
- vector helpers under common recommendation utilities

## Problem / Opportunity
Completed, hidden, abandoned, or recently played games may rank too highly despite strong similarity.

This reduces recommendation usefulness.

## Goals

1. Preserve existing vector similarity logic.
2. Add ranking modifiers without changing vector math.
3. Keep implementation fully client-side.
4. Make rules easy to tune.
5. Return explainable score metadata.

## Constraints

- Low complexity change.
- Must not degrade current responsiveness.
- Must preserve deterministic ordering.
- Should fit existing application-layer architecture.

## Proposed Design
Use two-stage scoring:

```text
finalScore = similarity * modifier
```

Where modifier is the product of penalties/boosts.

Example:

```text
Completed       x0.70
Hidden          x0.10
Favorite        x1.10
Backlog         x1.08
Recently Played x0.80
```

## Placement
Create a dedicated policy module near the recommendation engine:

```text
playnite-insights/src/lib/modules/game-library/application/recommendation-engine/
  recommendation-ranking.policy.ts
```

Keep vector utilities pure.

## Suggested API

```ts
computeRankingModifier(game): number
computeRecommendationScore(similarity, game): number
```

## Execution Steps

### Phase 1 - Minimal Viable Ranking

1. Add `recommendation-ranking.policy.ts`.
2. Implement modifiers for:
   - completed
n   - hidden
3. In `recommendation-engine.ts`:
   - compute similarity
   - compute modifier
   - compute final score
4. Sort by final score.

### Phase 2 - Explainability

Return:

```ts
{
  similarity,
  modifier,
  score
}
```

Optional later:

```ts
reasons: ['completed_penalty']
```

### Phase 3 - More Signals

Add optional boosts/penalties for:

- favorite
n- backlog category
- recently played
- very high playtime fatigue
- manually ignored games

### Phase 4 - User Settings

Expose sliders/toggles in UI.

## Example Pseudocode

```ts
const similarity = cosineSimilarity(targetVector, gameVector);
const modifier = computeRankingModifier(game);
const score = similarity * modifier;
```

## Validation

Test scenarios:

1. Completed game with same similarity ranks lower than unfinished game.
2. Hidden game sinks near bottom.
3. Favorite unfinished game ranks above neutral equivalent.
4. No modifiers keeps old behavior.
5. Large library performance remains acceptable.

## Risks

### Over-penalization
Users may replay completed games.

Mitigation: start soft (`0.85`) and tune later.

### Rule Explosion
Too many heuristics can become noisy.

Mitigation: add rules incrementally.

### Hidden Coupling
Do not place business rules inside vector utility functions.

## Follow-ups

- Diversity re-ranking (avoid too many similar titles in top 10)
- Session-aware recommendations (short game tonight, long RPG weekend)
- Explainable UI badges
- Per-user ranking profiles

## Success Criteria
Recommendations feel more actionable than raw similarity while preserving relevance.
