import type {
  CompanyRepository,
  CompletionStatusRepository,
  CryptographyService,
  ExtensionRegistrationRepository,
  FileSystemService,
  GameSessionRepository,
  GenreRepository,
  InstanceAuthenticationRepository,
  InstanceSessionsRepository,
  LibraryManifestService,
  LogService,
  PlatformRepository,
  PlayniteGameRepository,
  PlayniteLibraryMetricsRepository,
  SignatureService,
  StreamUtilsService,
} from "@playnite-insights/core";
import { LOG_LEVELS, type IFetchClient } from "@playnite-insights/lib/client";
import { constants } from "fs/promises";
import { join } from "path";
import { vi } from "vitest";
import { config as infraConfig } from "../../infra/config";
import { monorepoRoot } from "./paths";

export const makeMocks = () => {
  const config = {
    DATA_DIR: "",
    PLAYNITE_GAMES_JSON_FILE: "",
    LIBRARY_MANIFEST_FILE: "",
    TMP_DIR: "",
    FILES_DIR: "",
    UPLOAD_DIR: "",
    SCREENSHOTS_DIR: "",
    SECURITY_DIR: "",
    DB_FILE: "",
    CONTENT_HASH_FILE_NAME: "contentHash.txt",
    MIGRATIONS_DIR: join(
      monorepoRoot,
      "packages/@playnite-insights/infra/migrations"
    ),
    PLAYNITE_HOST_ADDRESS: undefined,
  } satisfies typeof infraConfig;

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

  const fetchClient = {
    httpDeleteAsync: vi.fn(),
    httpGetAsync: vi.fn(),
    httpPostAsync: vi.fn(),
    httpPutAsync: vi.fn(),
  } satisfies IFetchClient;

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

  const instanceAuthenticationRepository = {
    get: vi.fn(),
    set: vi.fn(),
  } satisfies InstanceAuthenticationRepository;

  const instanceSessionsRepository = {
    add: vi.fn(),
    getById: vi.fn(),
  } satisfies InstanceSessionsRepository;

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
    instanceAuthenticationRepository,
    instanceSessionsRepository,
    cryptographyService,
    fetchClient,
    config,
  };
};
