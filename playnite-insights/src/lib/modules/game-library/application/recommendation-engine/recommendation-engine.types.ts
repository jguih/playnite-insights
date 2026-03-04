import type { GameRecommendationRecordReadModel } from "../../infra";

export type RecommendationEngineFilterProps = { record: GameRecommendationRecordReadModel };

export type RecommendationEngineFilter = (props: RecommendationEngineFilterProps) => boolean;
