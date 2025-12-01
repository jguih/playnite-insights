import { GameResponseDto } from "../../dtos/game.response";
import { type GameRepository } from "../../infra/game.repository.port";

export type GetAllGamesQueryHandlerDeps = {
  gameRepository: GameRepository;
};

export type GetAllGamesResult =
  | { type: "not_modified" }
  | { type: "ok"; data: GameResponseDto[]; etag: string };
