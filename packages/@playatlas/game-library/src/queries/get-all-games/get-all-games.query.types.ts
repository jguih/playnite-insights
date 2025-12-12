import { GameResponseDto } from "../../dtos/game.response.dto";
import { type GameRepository } from "../../infra/game.repository.port";

export type GetAllGamesQueryHandlerDeps = {
  gameRepository: GameRepository;
};

export type GetAllGamesQueryResult =
  | { type: "not_modified" }
  | { type: "ok"; data: GameResponseDto[]; etag: string };
