import { GAME_CLASSIFICATION_DIMENSIONS } from "../../domain";

export class RecommendationEngineVectorUtils {
	static magnitude = (vector: Float32Array): number => {
		let mag = 0;
		for (let i = 0; i < vector.length; i++) mag += vector[i] * vector[i];
		mag = Math.sqrt(mag);
		return mag;
	};

	static createEmptyVector = (): Float32Array => {
		return new Float32Array(GAME_CLASSIFICATION_DIMENSIONS);
	};
}
