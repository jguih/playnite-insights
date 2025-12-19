import { BaseEntity, InvalidStateError } from "@playatlas/common/domain";
import { PlayniteMediaFileStreamResult } from "../infra/playnite-media-files-handler.types";
import { MakePlayniteMediaFilesContextProps } from "./playnite-media-files-context.entity.types";

export type PlayniteMediaFilesContextId = string;
export type PlayniteMediaFilesContext =
  BaseEntity<PlayniteMediaFilesContextId> & {
    getGameId: () => string;
    setGameId: (value: string) => void;
    getContentHash: () => string;
    setContentHash: (value: string) => void;
    getStreamResults: () => PlayniteMediaFileStreamResult[];
    setStreamResults: (value: PlayniteMediaFileStreamResult[]) => void;
    getTmpDirPath: () => string;
  };

export const makePlayniteMediaFilesContext = (
  props: MakePlayniteMediaFilesContextProps
): PlayniteMediaFilesContext => {
  let _game_id: string | null = props.gameId ?? null;
  let _content_hash: string | null = props.contentHash ?? null;
  let _stream_results: PlayniteMediaFileStreamResult[] | null =
    props.streamResults ?? null;
  const _tmp_dir_path = props.tmpDirPath;

  return {
    getId: () => {
      if (!_game_id) throw new InvalidStateError("Game id is not set.");
      return _game_id;
    },
    getSafeId: () => {
      if (!_game_id) throw new InvalidStateError("Game id is not set.");
      return _game_id;
    },
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
  };
};
