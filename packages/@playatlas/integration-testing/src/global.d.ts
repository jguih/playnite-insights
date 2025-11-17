import {
  CompletionStatusRepository,
  GameRepository,
} from "@playatlas/game-library/infra";

declare global {
  const repository: {
    game: GameRepository;
    completionStatus: CompletionStatusRepository;
  };
}
