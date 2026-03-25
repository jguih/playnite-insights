import type { GameId } from "../../domain/value-object/game-id";
import type { GameSessionId } from "../../domain/value-object/game-session-id";

export type GameSessionInput = {
	sessionId: GameSessionId;
	gameId: GameId;
};
