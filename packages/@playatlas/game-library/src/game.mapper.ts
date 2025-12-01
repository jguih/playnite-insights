import { type EntityMapper } from "@playatlas/common/application";
import { MakeGameRelationshipProps } from "./domain";
import { type Game, makeGame } from "./domain/game.entity";
import { GameResponseDto } from "./dtos/game.response";
import { type GameModel } from "./infra";

export type GameMapper = EntityMapper<Game, GameModel> & {
  toDomain: (
    model: GameModel,
    relationships: MakeGameRelationshipProps
  ) => Game;
  toDto: (game: Game) => GameResponseDto;
  toDtoList: (games: Game[]) => GameResponseDto[];
};

const _toDto = (game: Game): GameResponseDto => {
  const Developers = game.relationships.developers.isLoaded()
    ? game.relationships.developers.get()
    : [];
  const Publishers = game.relationships.publishers.isLoaded()
    ? game.relationships.publishers.get()
    : [];
  const Genres = game.relationships.genres.isLoaded()
    ? game.relationships.genres.get()
    : [];
  const Platforms = game.relationships.platforms.isLoaded()
    ? game.relationships.platforms.get()
    : [];
  const dto: GameResponseDto = {
    Id: game.getId(),
    Name: game.getName(),
    Description: game.getDescription(),
    ReleaseDate: game.getReleaseDate()?.toISOString() ?? null,
    Playtime: game.getPlaytime(),
    LastActivity: game.getLastActivity()?.toISOString() ?? null,
    Added: game.getAdded()?.toISOString() ?? null,
    InstallDirectory: game.getInstallDirectory(),
    IsInstalled: +game.isInstalled(),
    BackgroundImage: game.getBackgroundImage(),
    CoverImage: game.getCoverImage(),
    Icon: game.getIcon(),
    Hidden: +game.isHidden(),
    CompletionStatusId: game.getCompletionStatusId(),
    ContentHash: game.getContentHash(),
    Developers,
    Publishers,
    Genres,
    Platforms,
  };
  return dto;
};

export const gameMapper: GameMapper = {
  toPersistence: (game: Game): GameModel => {
    const record: GameModel = {
      Id: game.getId(),
      Name: game.getName(),
      Description: game.getDescription(),
      ReleaseDate: game.getReleaseDate()?.toISOString() ?? null,
      Playtime: game.getPlaytime(),
      LastActivity: game.getLastActivity()?.toISOString() ?? null,
      Added: game.getAdded()?.toISOString() ?? null,
      InstallDirectory: game.getInstallDirectory(),
      IsInstalled: +game.isInstalled(),
      BackgroundImage: game.getBackgroundImage(),
      CoverImage: game.getCoverImage(),
      Icon: game.getIcon(),
      Hidden: +game.isHidden(),
      CompletionStatusId: game.getCompletionStatusId(),
      ContentHash: game.getContentHash(),
    };
    return record;
  },
  toDomain: (
    game: GameModel,
    relationships: MakeGameRelationshipProps = {}
  ): Game => {
    const entity: Game = makeGame({
      id: game.Id,
      name: game.Name,
      description: game.Description,
      releaseDate: game.ReleaseDate ? new Date(game.ReleaseDate) : null,
      playtime: game.Playtime,
      lastActivity: game.LastActivity ? new Date(game.LastActivity) : null,
      added: game.Added ? new Date(game.Added) : null,
      installDirectory: game.InstallDirectory,
      isInstalled: Boolean(game.IsInstalled),
      backgroundImage: game.BackgroundImage,
      coverImage: game.CoverImage,
      icon: game.Icon,
      hidden: Boolean(game.Hidden),
      developerIds: relationships.developerIds,
      genreIds: relationships.genreIds,
      platformIds: relationships.platformIds,
      publisherIds: relationships.publisherIds,
      completionStatusId: game.CompletionStatusId,
      contentHash: game.ContentHash,
    });
    return entity;
  },
  toDto: _toDto,
  toDtoList: (games: Game[]): GameResponseDto[] => {
    const dtos: GameResponseDto[] = [];
    for (const game of games) dtos.push(_toDto(game));
    return dtos;
  },
};
