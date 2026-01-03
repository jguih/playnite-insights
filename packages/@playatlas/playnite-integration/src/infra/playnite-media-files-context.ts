import { validation } from "@playatlas/common/application";
import { DisposableAsync } from "@playatlas/common/common";
import { InvalidStateError } from "@playatlas/common/domain";
import { join } from "path";
import {
  MakePlayniteMediaFilesContextDeps,
  MakePlayniteMediaFilesContextProps,
} from "./playnite-media-files-context.types";
import { PlayniteMediaFileStreamResult } from "./playnite-media-files-handler.types";

export type PlayniteMediaFilesContextId = string;
export type PlayniteMediaFilesContext = DisposableAsync & {
  getContextId: () => string;
  getGameId: () => string;
  setGameId: (value: string) => void;
  getContentHash: () => string;
  setContentHash: (value: string) => void;
  getContentHashHeader: () => string;
  getStreamResults: () => PlayniteMediaFileStreamResult[];
  setStreamResults: (value: PlayniteMediaFileStreamResult[]) => void;
  getTmpDirPath: () => string;
  getTmpOptimizedDirPath: () => string;
  /**
   * Returns the final path where media files should be stored permanently
   */
  getGameDirPath: () => string;
  /**
   * Ensures the game directory is created
   */
  ensureGameDir: (args?: { cleanUp?: boolean }) => Promise<void>;
  validate: () => void;
  /**
   * Creates the resources required by this context
   */
  init: () => Promise<void>;
};

export const makePlayniteMediaFilesContext = (
  {
    fileSystemService,
    logService,
    systemConfig,
  }: MakePlayniteMediaFilesContextDeps,
  props: MakePlayniteMediaFilesContextProps
): PlayniteMediaFilesContext => {
  const _context_id = crypto.randomUUID();
  let _game_id: string | null = props.gameId ?? null;
  let _content_hash: string | null = props.contentHash ?? null;
  let _stream_results: PlayniteMediaFileStreamResult[] | null =
    props.streamResults ?? null;
  const _tmp_dir_path = join(systemConfig.getTmpDir(), _context_id);
  const _tmp_optimized_dir_path = join(_tmp_dir_path, "/optimized");
  let _game_dir_path: string | null = null;
  const _content_hash_header = props.contentHashHeader;
  let initialized: boolean = false;

  const _getGameDirPath = () => {
    if (!_game_dir_path)
      throw new InvalidStateError("Game dir path is not set.");
    if (validation.isEmptyString(_game_dir_path))
      throw new InvalidStateError(
        validation.message.isEmptyString("GameDirPath")
      );
    return _game_dir_path;
  };

  return {
    getContextId: () => _context_id,
    getGameId: () => {
      if (!_game_id) throw new InvalidStateError("Game id is not set.");
      if (validation.isEmptyString(_game_id))
        throw new InvalidStateError("Game id cannot be empty");
      return _game_id;
    },
    setGameId: (value) => {
      _game_id = value;
      _game_dir_path = join(systemConfig.getLibFilesDir(), _game_id);
    },
    getContentHash: () => {
      if (!_content_hash)
        throw new InvalidStateError("Content hash is not set.");
      if (validation.isEmptyString(_content_hash))
        throw new InvalidStateError("Content hash cannot be empty");
      return _content_hash;
    },
    setContentHash: (value) => (_content_hash = value),
    getContentHashHeader: () => {
      if (!_content_hash_header)
        throw new InvalidStateError("Content hash header is not set.");
      if (validation.isEmptyString(_content_hash_header))
        throw new InvalidStateError(
          validation.message.isEmptyString("ContentHashHeader")
        );
      return _content_hash_header;
    },
    getStreamResults: () => {
      if (!_stream_results)
        throw new InvalidStateError("Stream results is not set.");
      return _stream_results;
    },
    setStreamResults: (value) => (_stream_results = value),
    getTmpDirPath: () => _tmp_dir_path,
    getTmpOptimizedDirPath: () => _tmp_optimized_dir_path,
    getGameDirPath: _getGameDirPath,
    ensureGameDir: async (args = {}) => {
      const createGameDir = () =>
        fileSystemService.mkdir(_getGameDirPath(), {
          recursive: true,
          mode: "0744",
        });
      try {
        await fileSystemService.access(_getGameDirPath());
        if (args.cleanUp) {
          await fileSystemService.rm(_getGameDirPath(), {
            force: true,
            recursive: true,
          });
          await createGameDir();
        }
      } catch {
        logService.debug(`Created game media folder at ${_getGameDirPath()}`);
        await createGameDir();
      }
    },
    validate: () => {
      if (!initialized) throw new InvalidStateError("Context not initialized.");
      if (!_game_id) throw new InvalidStateError("Game id is not set.");
      if (validation.isEmptyString(_game_id))
        throw new InvalidStateError(validation.message.isEmptyString("GameId"));
      if (!_content_hash)
        throw new InvalidStateError("Content hash is not set.");
      if (validation.isEmptyString(_content_hash))
        throw new InvalidStateError(
          validation.message.isEmptyString("ContentHash")
        );
      if (!_stream_results)
        throw new InvalidStateError("Stream results is not set.");
      if (!_game_dir_path)
        throw new InvalidStateError("Game dir path is not set.");
      if (validation.isEmptyString(_game_dir_path))
        throw new InvalidStateError(
          validation.message.isEmptyString("GameDirPath")
        );
    },
    dispose: async () => {
      logService.debug(`Disposing Playnite media files context ${_context_id}`);
      fileSystemService.rm(_tmp_dir_path, { recursive: true, force: true });
      logService.debug(`Deleted temporary folder at ${_tmp_dir_path}.`);
    },
    init: async () => {
      logService.debug(
        `Initializing Playnite media files context ${_context_id}`
      );
      await fileSystemService.mkdir(_tmp_dir_path, {
        recursive: true,
        mode: "0744",
      });
      await fileSystemService.mkdir(_tmp_optimized_dir_path, { mode: "0744" });
      logService.debug(`Created temporary folder at ${_tmp_dir_path}`);
      initialized = true;
    },
  };
};
