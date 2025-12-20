import { validation } from "@playatlas/common/application";
import { DisposableAsync } from "@playatlas/common/common";
import { InvalidStateError } from "@playatlas/common/domain";
import {
  MakePlayniteMediaFilesContextDeps,
  MakePlayniteMediaFilesContextProps,
} from "./playnite-media-files-context.types";
import { PlayniteMediaFileStreamResult } from "./playnite-media-files-handler.types";

export type PlayniteMediaFilesContextId = string;
export type PlayniteMediaFilesContext = DisposableAsync & {
  getGameId: () => string;
  setGameId: (value: string) => void;
  getContentHash: () => string;
  setContentHash: (value: string) => void;
  getContentHashHeader: () => string;
  getStreamResults: () => PlayniteMediaFileStreamResult[];
  setStreamResults: (value: PlayniteMediaFileStreamResult[]) => void;
  getTmpDirPath: () => string;
  validate: () => void;
};

export const makePlayniteMediaFilesContext = (
  { fileSystemService }: MakePlayniteMediaFilesContextDeps,
  props: MakePlayniteMediaFilesContextProps
): PlayniteMediaFilesContext => {
  let _game_id: string | null = props.gameId ?? null;
  let _content_hash: string | null = props.contentHash ?? null;
  let _stream_results: PlayniteMediaFileStreamResult[] | null =
    props.streamResults ?? null;
  const _tmp_dir_path = props.tmpDirPath;
  const _content_hash_header = props.contentHashHeader;

  return {
    getGameId: () => {
      if (!_game_id) throw new InvalidStateError("Game id is not set.");
      return _game_id;
    },
    setGameId: (value) => (_game_id = value),
    getContentHash: () => {
      if (!_content_hash)
        throw new InvalidStateError("Content hash is not set.");
      return _content_hash;
    },
    setContentHash: (value) => (_content_hash = value),
    getContentHashHeader: () => {
      if (!_content_hash_header)
        throw new InvalidStateError("Content hash header is not set.");
      if (validation.isNullOrEmptyString(_content_hash_header))
        throw new InvalidStateError(
          "Content hash header cannot be null or an empty string"
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
    validate: () => {
      if (!_game_id) throw new InvalidStateError("Game id is not set.");
      if (!_content_hash)
        throw new InvalidStateError("Content hash is not set.");
      if (!_stream_results)
        throw new InvalidStateError("Stream results is not set.");
    },
    dispose: async () =>
      fileSystemService.rm(_tmp_dir_path, { recursive: true, force: true }),
  };
};
