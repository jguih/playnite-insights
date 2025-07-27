import { vi } from "vitest";
import { LogService } from "../log.types";
import { LOG_LEVELS } from "@playnite-insights/lib/client/log";
import { FileSystemService } from "../file-system.types";
import { constants } from "fs/promises";
import { StreamUtilsService } from "../stream-utils.types";
import { PlayniteGameRepository } from "../playnite-game.types";
import { LibraryManifestService } from "../library-manifest";
import { PlayniteLibrarySyncRepository } from "../playnite-library-sync.types";
import { GameSessionRepository } from "../game-session.types";

export const makeMocks = () => {
  const logService = {
    CURRENT_LOG_LEVEL: 1,
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
    LOG_LEVELS: LOG_LEVELS,
  } satisfies LogService;

  const fileSystemService = {
    access: vi.fn(),
    constants: constants,
    mkdir: vi.fn(),
    readdir: vi.fn(),
    readfile: vi.fn(),
    rm: vi.fn(),
    stat: vi.fn(),
    unlink: vi.fn(),
    writeFile: vi.fn(),
  } satisfies FileSystemService;

  const streamUtilsService = {
    createWriteStream: vi.fn(),
    pipeline: vi.fn(),
    readableFromWeb: vi.fn(),
  } satisfies StreamUtilsService;

  const libraryManifestService = {
    write: vi.fn(),
    get: vi.fn(),
  } satisfies LibraryManifestService;

  const playniteGameRepository = {
    add: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    exists: vi.fn(),
    addDeveloperFor: vi.fn(),
    deleteDevelopersFor: vi.fn(),
    addPlatformFor: vi.fn(),
    deletePlatformsFor: vi.fn(),
    addGenreFor: vi.fn(),
    deleteGenresFor: vi.fn(),
    addPublisherFor: vi.fn(),
    deletePublishersFor: vi.fn(),
    getById: vi.fn(),
    getManifestData: vi.fn(),
    getTotal: vi.fn(),
    getTotalPlaytimeSeconds: vi.fn(),
    getTopMostPlayedGamesForDashPage: vi.fn(),
    getGamesForDashPage: vi.fn(),
    all: vi.fn(),
  } satisfies PlayniteGameRepository;

  const gameSessionRepository = {
    getById: vi.fn(),
    add: vi.fn(),
    update: vi.fn(),
    all: vi.fn(),
    unlinkSessionsForGame: vi.fn(),
  } satisfies GameSessionRepository;

  const playniteLibrarySyncRepository = {
    add: vi.fn(),
    getTotalPlaytimeOverLast6Months: vi.fn(),
    getTotalGamesOwnedOverLast6Months: vi.fn(),
  } satisfies PlayniteLibrarySyncRepository;

  return {
    logService,
    fileSystemService,
    streamUtilsService,
    libraryManifestService,
    playniteGameRepository,
    playniteLibrarySyncRepository,
    gameSessionRepository,
  };
};
