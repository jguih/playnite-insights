import { MakeFullGameProps, MakeGameProps } from "./game.entity.types";

export type GameId = string;

export type Game = Readonly<{
  getId: () => GameId;
  getName: () => string | null;
  getDescription: () => string | null;
  getReleaseDate: () => Date | null;
  getPlaytime: () => number;
  getLastActivity: () => Date | null;
  getAdded: () => Date | null;
  getInstallDirectory: () => string | null;
  isInstalled: () => boolean;
  isHidden: () => boolean;
  getBackgroundImage: () => string | null;
  getCoverImage: () => string | null;
  getIcon: () => string | null;
  getCompletionStatusId: () => string | null;
  getContentHash: () => string;
}>;

export const makeGame = (props: MakeGameProps): Game => {
  const _id = props.id;
  let _name = props.name ?? null;
  let _description = props.description ?? null;
  let _releaseDate = props.releaseDate ?? null;
  let _playtime = props.playtime ?? 0;
  let _lastActivity = props.lastActivity ?? null;
  let _added = props.added ?? null;
  let _installDirectory = props.installDirectory ?? null;
  let _isInstalled = Boolean(props.isInstalled);
  let _backgroundImage = props.backgroundImage ?? null;
  let _coverImage = props.coverImage ?? null;
  let _icon = props.icon ?? null;
  let _hidden = Boolean(props.hidden);
  let _completionStatusId = props.completionStatusId ?? null;
  const _contentHash = props.contentHash;

  return Object.freeze({
    getId: () => _id,
    getName: () => _name,
    getDescription: () => _description,
    getReleaseDate: () => _releaseDate,
    getPlaytime: () => _playtime,
    getLastActivity: () => _lastActivity,
    getAdded: () => _added,
    getInstallDirectory: () => _installDirectory,
    isInstalled: () => _isInstalled,
    isHidden: () => _hidden,
    getBackgroundImage: () => _backgroundImage,
    getCoverImage: () => _coverImage,
    getIcon: () => _icon,
    getCompletionStatusId: () => _completionStatusId,
    getContentHash: () => _contentHash,
  });
};

export type FullGame = Readonly<
  Game & {
    /** Returns a list of developer ids */
    getDevelopers: () => string[];
    /** Returns a list of publisher ids */
    getPublishers: () => string[];
    /** Returns a list of genre ids */
    getGenres: () => string[];
    /** Returns a list of platform ids */
    getPlatforms: () => string[];
  }
>;

export const makeFullGame = (props: MakeFullGameProps): FullGame => {
  const game = makeGame(props);
  const _developers = props.developers;
  const _publishers = props.publishers;
  const _genres = props.genres;
  const _platforms = props.platforms;

  return Object.freeze({
    ...game,
    getDevelopers: () => _developers,
    getPublishers: () => _publishers,
    getGenres: () => _genres,
    getPlatforms: () => _platforms,
  });
};
