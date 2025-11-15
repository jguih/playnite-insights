import { MakeGameProps } from "./game.entity.types";

export type Game = {
  getId: () => string;
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
};

export const makeGame = (props: MakeGameProps): Game => {
  const _id = props.Id;
  let _name = props.Name ?? null;
  let _description = props.Description ?? null;
  let _releaseDate = props.ReleaseDate ?? null;
  let _playtime = props.Playtime ?? 0;
  let _lastActivity = props.LastActivity ?? null;
  let _added = props.Added ?? null;
  let _installDirectory = props.InstallDirectory ?? null;
  let _isInstalled = Boolean(props.IsInstalled);
  let _backgroundImage = props.BackgroundImage ?? null;
  let _coverImage = props.CoverImage ?? null;
  let _icon = props.Icon ?? null;
  let _hidden = Boolean(props.Hidden);
  let _completionStatusId = props.CompletionStatusId ?? null;
  const _contentHash = props.ContentHash;

  return {
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
  };
};
