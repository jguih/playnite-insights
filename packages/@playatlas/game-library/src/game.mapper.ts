import { MakeGameRelationshipProps } from "./domain";
import { type Game, makeGame } from "./domain/game.entity";
import { type GameModel } from "./infra";

export const gameMapper = {
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
};

// export const fullGameMapper = {
//   toPersistence: (game: FullGame): FullGameModel => {
//     const record: FullGameModel = {
//       Id: game.getId(),
//       Name: game.getName(),
//       Description: game.getDescription(),
//       ReleaseDate: game.getReleaseDate()?.toISOString() ?? null,
//       Playtime: game.getPlaytime(),
//       LastActivity: game.getLastActivity()?.toISOString() ?? null,
//       Added: game.getAdded()?.toISOString() ?? null,
//       InstallDirectory: game.getInstallDirectory(),
//       IsInstalled: +game.isInstalled(),
//       BackgroundImage: game.getBackgroundImage(),
//       CoverImage: game.getCoverImage(),
//       Icon: game.getIcon(),
//       Hidden: +game.isHidden(),
//       CompletionStatusId: game.getCompletionStatusId(),
//       ContentHash: game.getContentHash(),
//       Developers: game.getDevelopers().join(GROUPADD_SEPARATOR),
//       Publishers: game.getPublishers().join(GROUPADD_SEPARATOR),
//       Genres: game.getGenres().join(GROUPADD_SEPARATOR),
//       Platforms: game.getPlatforms().join(GROUPADD_SEPARATOR),
//     };
//     return record;
//   },
//   toDomain: (game: FullGameModel): FullGame => {
//     const developers = game.Developers
//       ? game.Developers.split(GROUPADD_SEPARATOR)
//       : [];
//     const publishers = game.Publishers
//       ? game.Publishers.split(GROUPADD_SEPARATOR)
//       : [];
//     const platforms = game.Platforms
//       ? game.Platforms.split(GROUPADD_SEPARATOR)
//       : [];
//     const genres = game.Genres ? game.Genres.split(GROUPADD_SEPARATOR) : [];

//     const entity: FullGame = makeFullGame({
//       id: game.Id,
//       name: game.Name,
//       description: game.Description,
//       releaseDate: game.ReleaseDate ? new Date(game.ReleaseDate) : null,
//       playtime: game.Playtime,
//       lastActivity: game.LastActivity ? new Date(game.LastActivity) : null,
//       added: game.Added ? new Date(game.Added) : null,
//       installDirectory: game.InstallDirectory,
//       isInstalled: Boolean(game.IsInstalled),
//       backgroundImage: game.BackgroundImage,
//       coverImage: game.CoverImage,
//       icon: game.Icon,
//       hidden: Boolean(game.Hidden),
//       completionStatusId: game.CompletionStatusId,
//       contentHash: game.ContentHash,
//       developers,
//       publishers,
//       genres,
//       platforms,
//     });
//     return entity;
//   },
// };
