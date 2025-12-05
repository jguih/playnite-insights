import {
  createRelationship,
  type Relationship,
} from "@playatlas/common/common";
import { BaseEntity } from "@playatlas/common/domain";
import { CompanyId } from "./company.entity";
import { MakeGameProps } from "./game.entity.types";
import { GenreId } from "./genre.entity";
import { PlatformId } from "./platform.entity";

export type GameId = string;

export type GameRelationshipMap = {
  developers: CompanyId;
  publishers: CompanyId;
  genres: GenreId;
  platforms: PlatformId;
};

export type GameRelationship = keyof GameRelationshipMap;

export type GameRelationshipProps = {
  [K in GameRelationship]: Relationship<GameRelationshipMap[K]>;
};

export type Game = BaseEntity<GameId> &
  Readonly<{
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
    relationships: GameRelationshipProps;
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

  const game: Game = {
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
    relationships: {
      developers: createRelationship(props.developerIds ?? null),
      genres: createRelationship(props.genreIds ?? null),
      platforms: createRelationship(props.platformIds ?? null),
      publishers: createRelationship(props.publisherIds ?? null),
    },
    validate: () => {},
  };
  return Object.freeze(game);
};
