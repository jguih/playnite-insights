import type { LogService } from "@playatlas/common/application";
import type { AsyncCommandHandler } from "@playatlas/common/common";
import type {
  CompanyRepository,
  CompletionStatusRepository,
  GameRepository,
  GenreRepository,
  PlatformRepository,
} from "@playatlas/game-library/infra";
import type { LibraryManifestService } from "../../application";
import type { SyncGamesCommand } from "./sync-games.command";

export type SyncGamesCommandResult = {
  success: boolean;
  reason: string;
  reason_code: "game_not_found" | "success" | "integrity_check_failed";
};

export type SyncGamesCommandHandler = AsyncCommandHandler<
  SyncGamesCommand,
  SyncGamesCommandResult
>;

export type SyncGamesServiceDeps = {
  logService: LogService;
  gameRepository: GameRepository;
  genreRepository: GenreRepository;
  platformRepository: PlatformRepository;
  companyRepository: CompanyRepository;
  completionStatusRepository: CompletionStatusRepository;
  libraryManifestService: LibraryManifestService;
};
