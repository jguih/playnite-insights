import {
  makeCompany,
  makeCompletionStatus,
  makeGame,
  makeGenre,
  makePlatform,
  type Company,
  type CompletionStatus,
  type Game,
  type Genre,
  type Platform,
} from "@playatlas/game-library/domain";
import { SyncGamesCommandItem } from "./sync-games.command";

export type ExtractedSyncData = {
  genres: Genre[];
  platforms: Platform[];
  developers: Company[];
  publishers: Company[];
  completionStatuses: CompletionStatus[];
  games: Game[];
};

export const extractSyncData = (
  items: SyncGamesCommandItem[]
): ExtractedSyncData => {
  const genres = new Map<string, Genre>();
  const platforms = new Map<string, Platform>();
  const developers = new Map<string, Company>();
  const publishers = new Map<string, Company>();
  const completionStatuses = new Map<string, CompletionStatus>();
  const games: Game[] = [];

  for (const dto of items) {
    dto.Genres?.forEach((g) =>
      genres.set(g.Id, makeGenre({ id: g.Id, name: g.Name }))
    );

    dto.Platforms?.forEach((p) =>
      platforms.set(
        p.Id,
        makePlatform({
          id: p.Id,
          specificationId: p.SpecificationId,
          name: p.Name,
          icon: p.Icon,
          cover: p.Cover,
          background: p.Background,
        })
      )
    );

    dto.Developers?.forEach((d) =>
      developers.set(d.Id, makeCompany({ id: d.Id, name: d.Name }))
    );

    dto.Publishers?.forEach((p) =>
      publishers.set(p.Id, makeCompany({ id: p.Id, name: p.Name }))
    );

    if (dto.CompletionStatus) {
      completionStatuses.set(
        dto.CompletionStatus.Id,
        makeCompletionStatus({
          id: dto.CompletionStatus.Id,
          name: dto.CompletionStatus.Name,
        })
      );
    }

    games.push(
      makeGame({
        id: dto.Id,
        name: dto.Name,
        added: dto.Added ? new Date(dto.Added) : null,
        contentHash: dto.ContentHash,
        backgroundImage: dto.BackgroundImage,
        coverImage: dto.CoverImage,
        icon: dto.Icon,
        completionStatusId: dto.CompletionStatus?.Id,
        description: dto.Description,
        developerIds: dto.Developers?.map((d) => d.Id) ?? [],
        genreIds: dto.Genres?.map((g) => g.Id) ?? [],
        publisherIds: dto.Publishers?.map((p) => p.Id) ?? [],
        platformIds: dto.Platforms?.map((p) => p.Id) ?? [],
        hidden: dto.Hidden,
        installDirectory: dto.InstallDirectory,
        isInstalled: dto.IsInstalled,
        lastActivity: dto.LastActivity ? new Date(dto.LastActivity) : null,
        playtime: dto.Playtime,
        releaseDate: dto.ReleaseDate ? new Date(dto.ReleaseDate) : null,
      })
    );
  }

  return {
    genres: [...genres.values()],
    platforms: [...platforms.values()],
    developers: [...developers.values()],
    publishers: [...publishers.values()],
    completionStatuses: [...completionStatuses.values()],
    games,
  };
};
