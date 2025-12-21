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
  getOptimizedDirPath: () => string;
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
  const _optimized_dir_path = join(_tmp_dir_path, "/optimized");
  const _content_hash_header = props.contentHashHeader;

  return {
    getContextId: () => _context_id,
    getGameId: () => {
      if (!_game_id) throw new InvalidStateError("Game id is not set.");
      if (validation.isEmptyString(_game_id))
        throw new InvalidStateError("Game id cannot be empty");
      return _game_id;
    },
    setGameId: (value) => (_game_id = value),
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
    getOptimizedDirPath: () => _optimized_dir_path,
    validate: () => {
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
      await fileSystemService.mkdir(_tmp_dir_path, { recursive: true });
      logService.debug(`Created temporary folder at ${_tmp_dir_path}`);
    },
  };
};
