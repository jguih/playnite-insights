export const recommendationEngineProjectionSource = [
	"games",
	"gameClassifications",
	"gameSessions",
] as const satisfies string[];

export type RecommendationEngineProjectionSource =
	(typeof recommendationEngineProjectionSource)[number];
