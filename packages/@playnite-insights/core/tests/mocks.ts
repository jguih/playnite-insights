import { LOG_LEVELS } from "@playnite-insights/lib/client";
import { constants } from "fs/promises";
import { vi } from "vitest";
import type { LibraryManifestService } from "../src/library-manifest";
import type {
  CompanyRepository,
  CryptographyService,
  ExtensionRegistrationRepository,
  GenreRepository,
  PlatformRepository,
  PlayniteGameRepository,
  PlayniteLibraryMetricsRepository,
  SignatureService,
} from "../src/types";
import { CompletionStatusRepository } from "../src/types/completion-status.types";
import type { FileSystemService } from "../src/types/file-system.types";
import type { GameSessionRepository } from "../src/types/game-session.types";
import type { LogService } from "../src/types/log.types";
import type { StreamUtilsService } from "../src/types/stream-utils.types";

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
    rename: vi.fn(),
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
    remove: vi.fn(),
    exists: vi.fn(),
    getById: vi.fn(),
    getManifestData: vi.fn(),
    getTotal: vi.fn(),
    getTotalPlaytimeSeconds: vi.fn(),
    all: vi.fn(),
    upsertMany: vi.fn(),
    updateManyGenres: vi.fn(),
    updateManyDevelopers: vi.fn(),
    updateManyPlatforms: vi.fn(),
    updateManyPublishers: vi.fn(),
    removeMany: vi.fn(),
  } satisfies PlayniteGameRepository;

  const gameSessionRepository = {
    getById: vi.fn(),
    add: vi.fn(),
    update: vi.fn(),
    all: vi.fn(),
    findAllBy: vi.fn(),
  } satisfies GameSessionRepository;

  const playniteLibraryMetricsRepository = {
    add: vi.fn(),
    getTotalPlaytimeOverLast6Months: vi.fn(),
    getGamesOwnedLastNMonths: vi.fn(),
  } satisfies PlayniteLibraryMetricsRepository;

  const extensionRegistrationRepository = {
    add: vi.fn(),
    update: vi.fn(),
    getByExtensionId: vi.fn(),
    getByRegistrationId: vi.fn(),
    remove: vi.fn(),
    all: vi.fn(),
  } satisfies ExtensionRegistrationRepository;

  const completionStatusRepository = {
    add: vi.fn(),
    update: vi.fn(),
    getById: vi.fn(),
    hasChanges: vi.fn(),
    all: vi.fn(),
    upsertMany: vi.fn(),
  } satisfies CompletionStatusRepository;

  const genreRepository = {
    add: vi.fn(),
    exists: vi.fn(),
    update: vi.fn(),
    getById: vi.fn(),
    hasChanges: vi.fn(),
    all: vi.fn(),
    upsertMany: vi.fn(),
  } satisfies GenreRepository;

  const platformRepository = {
    add: vi.fn(),
    exists: vi.fn(),
    update: vi.fn(),
    getById: vi.fn(),
    hasChanges: vi.fn(),
    all: vi.fn(),
    upsertMany: vi.fn(),
  } satisfies PlatformRepository;

  const companyRepository = {
    add: vi.fn(),
    exists: vi.fn(),
    update: vi.fn(),
    getById: vi.fn(),
    hasChanges: vi.fn(),
    all: vi.fn(),
    upsertMany: vi.fn(),
  } satisfies CompanyRepository;

  const signatureService = {
    generateKeyPairAsync: vi.fn(),
    signAsync: vi.fn(),
    verifyExtensionSignature: vi.fn(),
  } satisfies SignatureService;

  const cryptographyService = {
    hashPasswordAsync: vi.fn(),
    createSessionId: vi.fn(),
    verifyPassword: vi.fn(),
  } satisfies CryptographyService;

  return {
    logService,
    fileSystemService,
    streamUtilsService,
    libraryManifestService,
    signatureService,
    playniteGameRepository,
    playniteLibraryMetricsRepository,
    gameSessionRepository,
    extensionRegistrationRepository,
    completionStatusRepository,
    genreRepository,
    platformRepository,
    companyRepository,
    cryptographyService,
  };
};
