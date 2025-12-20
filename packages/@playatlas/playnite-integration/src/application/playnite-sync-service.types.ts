import type { LogService } from "@playatlas/common/application";
import type { GameRepository } from "@playatlas/game-library/infra";
import type { PlayniteMediaFilesHandler } from "../infra";

export type PlayniteSyncServiceDeps = {
  playniteMediaFilesHandler: PlayniteMediaFilesHandler;
  gameRepository: GameRepository;
  logService: LogService;
};
