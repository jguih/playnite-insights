import type {
  CompanyRepository,
  GenreRepository,
  PlatformRepository,
  PlayniteGameRepository,
} from "@playnite-insights/core";
import {
  fullGameRawSchema,
  playniteGameSchema,
  type FullGame,
  type GameManifestData,
} from "@playnite-insights/lib/client";
import z from "zod";
import {
  defaultRepositoryDeps,
  repositoryCall,
  type BaseRepositoryDeps,
} from "../repository/base";
import { defaultCompanyRepository } from "../repository/company";
import { defaultGenreRepository } from "../repository/genre";
import { defaultPlatformRepository } from "../repository/platform";
import { getWhereClauseAndParamsFromFilters } from "./filtering-and-sorting";

type PlayniteGameRepositoryDeps = BaseRepositoryDeps & {
  platformRepository: PlatformRepository;
  genreRepository: GenreRepository;
  companyRepository: CompanyRepository;
};

const defaultDeps: Required<PlayniteGameRepositoryDeps> = {
  ...defaultRepositoryDeps,
  platformRepository: defaultPlatformRepository,
  genreRepository: defaultGenreRepository,
  companyRepository: defaultCompanyRepository,
};

export const makePlayniteGameRepository = (
  deps: Partial<PlayniteGameRepositoryDeps> = {}
): PlayniteGameRepository => {
  const {
    getDb,
    logService,
    platformRepository,
    genreRepository,
    companyRepository,
  } = { ...defaultDeps, ...deps };

  const getTotal: PlayniteGameRepository["getTotal"] = (filters) => {
    return repositoryCall(
      logService,
      () => {
        const db = getDb();
        let query = `
          SELECT 
            COUNT(*) AS Total
          FROM playnite_game pg
        `;
        const { where, params } = getWhereClauseAndParamsFromFilters(filters);
        query += where;
        const total = (db.prepare(query).get(...params)?.Total as number) ?? 0;
        return total;
      },
      `getTotal(${JSON.stringify(filters)})`
    );
  };

  const getById: PlayniteGameRepository["getById"] = (id) => {
    return repositoryCall(
      logService,
      () => {
        const db = getDb();
        const query = `SELECT * FROM playnite_game WHERE Id = (?)`;
        const stmt = db.prepare(query);
        const result = stmt.get(id);
        const game = z.optional(playniteGameSchema).parse(result);
        logService.debug(`Found game ${game?.Name}`);
        return game ?? null;
      },
      `getById(${id})`
    );
  };

  const exists: PlayniteGameRepository["exists"] = (gameId) => {
    return repositoryCall(
      logService,
      () => {
        const db = getDb();
        const query = `
        SELECT EXISTS (
          SELECT 1 FROM playnite_game WHERE Id = (?)
        );
        `;
        const stmt = db.prepare(query);
        const result = stmt.get(gameId) as object;
        if (result) {
          return Object.values(result)[0] === 1;
        }
        return false;
      },
      `exists(${gameId})`
    );
  };

  const addDeveloperFor: PlayniteGameRepository["addDeveloperFor"] = (
    game,
    developer
  ) => {
    return repositoryCall(
      logService,
      () => {
        const db = getDb();
        const query = `
          INSERT INTO playnite_game_developer
            (GameId, DeveloperId)
          VALUES
            (?, ?)
        `;
        const stmt = db.prepare(query);
        stmt.run(game.Id, developer.Id);
        logService.debug(
          `Added developer ${developer.Name} for game ${game.Name}`
        );
        return true;
      },
      `addDeveloperFor(${game.Id}, ${game.Name}, ${developer.Name})`
    );
  };

  const deleteDevelopersFor: PlayniteGameRepository["deleteDevelopersFor"] = (
    game
  ) => {
    return repositoryCall(
      logService,
      () => {
        const db = getDb();
        const query = `DELETE FROM playnite_game_developer WHERE GameId = (?)`;
        const stmt = db.prepare(query);
        const result = stmt.run(game.Id);
        logService.debug(
          `Deleted ${result.changes} developer relationships for ${game.Name}`
        );
        return true;
      },
      `deleteDevelopersFor(${game.Id}, ${game.Name})`
    );
  };

  const addPlatformFor: PlayniteGameRepository["addPlatformFor"] = (
    game,
    platform
  ) => {
    return repositoryCall(
      logService,
      () => {
        const db = getDb();
        const query = `
          INSERT INTO playnite_game_platform
            (GameId, PlatformId)
          VALUES
            (?, ?)
        `;
        const stmt = db.prepare(query);
        stmt.run(game.Id, platform.Id);
        logService.debug(
          `Added platform ${platform.Name} for game ${game.Name}`
        );
        return true;
      },
      `addPlatformFor(${game.Id}, ${game.Name}, ${platform.Name})`
    );
  };

  const deletePlatformsFor: PlayniteGameRepository["deletePlatformsFor"] = (
    game
  ) => {
    return repositoryCall(
      logService,
      () => {
        const db = getDb();
        const query = `DELETE FROM playnite_game_platform WHERE GameId = (?)`;
        const stmt = db.prepare(query);
        const result = stmt.run(game.Id);
        logService.debug(
          `Deleted ${result.changes} platform relationships for ${game.Name}`
        );
        return true;
      },
      `deletePlatformsFor(${game.Id}, ${game.Name})`
    );
  };

  const addGenreFor: PlayniteGameRepository["addGenreFor"] = (game, genre) => {
    return repositoryCall(
      logService,
      () => {
        const db = getDb();
        const query = `
          INSERT INTO playnite_game_genre
            (GameId, GenreId)
          VALUES
            (?, ?)
        `;
        const stmt = db.prepare(query);
        stmt.run(game.Id, genre.Id);
        logService.debug(`Added genre ${genre.Name} for game ${game.Name}`);
        return true;
      },
      `addGenreFor(${game.Id}, ${game.Name}, ${genre.Name})`
    );
  };

  const deleteGenresFor: PlayniteGameRepository["deleteGenresFor"] = (game) => {
    return repositoryCall(
      logService,
      () => {
        const db = getDb();
        const query = `DELETE FROM playnite_game_genre WHERE GameId = (?)`;
        const stmt = db.prepare(query);
        const result = stmt.run(game.Id);
        logService.debug(
          `Deleted ${result.changes} genre relationships for ${game.Name}`
        );
        return true;
      },
      `deleteGenresFor(${game.Id}, ${game.Name})`
    );
  };

  const addPublisherFor: PlayniteGameRepository["addPublisherFor"] = (
    game,
    publisher
  ) => {
    return repositoryCall(
      logService,
      () => {
        const db = getDb();
        const query = `
        INSERT INTO playnite_game_publisher
          (GameId, PublisherId)
        VALUES
          (?, ?)
        `;
        const stmt = db.prepare(query);
        stmt.run(game.Id, publisher.Id);
        logService.debug(
          `Added publisher ${publisher.Name} for game ${game.Name}`
        );
        return true;
      },
      `addPublisherFor(${game.Id}, ${game.Name}, ${publisher.Name})`
    );
  };

  const deletePublishersFor: PlayniteGameRepository["deletePublishersFor"] = (
    game
  ) => {
    return repositoryCall(
      logService,
      () => {
        const db = getDb();
        const query = `DELETE FROM playnite_game_publisher WHERE GameId = (?)`;
        const stmt = db.prepare(query);
        const result = stmt.run(game.Id);
        logService.debug(
          `Deleted ${result.changes} publisher relationships for ${game.Name}`
        );
        return true;
      },
      `deletePublishersFor(${game.Id}, ${game.Name})`
    );
  };

  const add: PlayniteGameRepository["add"] = (
    game,
    developers,
    platforms,
    genres,
    publishers
  ) => {
    return repositoryCall(
      logService,
      () => {
        const db = getDb();
        const query = `
        INSERT INTO playnite_game (
          Id, 
          Name, 
          Description, 
          ReleaseDate, 
          Playtime, 
          LastActivity, 
          Added, 
          InstallDirectory, 
          IsInstalled, 
          BackgroundImage, 
          CoverImage, 
          Icon, 
          ContentHash
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
        `;
        const stmt = db.prepare(query);
        stmt.run(
          game.Id,
          game.Name ?? null,
          game.Description ?? null,
          game.ReleaseDate ?? null,
          game.Playtime ?? null,
          game.LastActivity ?? null,
          game.Added ?? null,
          game.InstallDirectory ?? null,
          +game.IsInstalled,
          game.BackgroundImage ?? null,
          game.CoverImage ?? null,
          game.Icon ?? null,
          game.ContentHash
        );
        logService.debug(`Created game ${game.Name}`);
        if (developers) {
          const uniqueDevs = Array.from(
            new Map(developers.map((dev) => [dev.Id, dev])).values()
          );
          for (const developer of uniqueDevs) {
            if (!companyRepository.exists(developer)) {
              companyRepository.add(developer);
            }
            addDeveloperFor({ Id: game.Id, Name: game.Name }, developer);
          }
        }
        if (platforms) {
          const uniquePlatforms = Array.from(
            new Map(platforms.map((plat) => [plat.Id, plat])).values()
          );
          for (const platform of uniquePlatforms) {
            if (!platformRepository.exists(platform)) {
              platformRepository.add(platform);
            }
            addPlatformFor({ Id: game.Id, Name: game.Name }, platform);
          }
        }
        if (genres) {
          const uniqueGenres = Array.from(
            new Map(genres.map((genre) => [genre.Id, genre])).values()
          );
          for (const genre of uniqueGenres) {
            if (!genreRepository.exists(genre)) {
              genreRepository.add(genre);
            }
            addGenreFor({ Id: game.Id, Name: game.Name }, genre);
          }
        }
        if (publishers) {
          const uniquePublishers = Array.from(
            new Map(publishers.map((pub) => [pub.Id, pub])).values()
          );
          for (const publisher of uniquePublishers) {
            if (!companyRepository.exists(publisher)) {
              companyRepository.add(publisher);
            }
            addPublisherFor({ Id: game.Id, Name: game.Name }, publisher);
          }
        }
        return true;
      },
      `add(${game.Id}, ${game.Name}, developers: ${
        developers?.length ?? 0
      }, platforms: ${platforms?.length ?? 0}, genres: ${
        genres?.length ?? 0
      }, publishers: ${publishers?.length ?? 0})`
    );
  };

  const update: PlayniteGameRepository["update"] = (
    game,
    developers,
    platforms,
    genres,
    publishers
  ) => {
    return repositoryCall(
      logService,
      () => {
        const db = getDb();
        const query = `
          UPDATE playnite_game
          SET
            Name = ?,
            Description = ?,
            ReleaseDate = ?,
            Playtime = ?,
            LastActivity = ?,
            Added = ?,
            InstallDirectory = ?,
            IsInstalled = ?,
            BackgroundImage = ?,
            CoverImage = ?,
            Icon = ?,
            ContentHash = ?
          WHERE Id = ?;
        `;
        const stmt = db.prepare(query);
        stmt.run(
          game.Name ?? null,
          game.Description ?? null,
          game.ReleaseDate ?? null,
          game.Playtime ?? null,
          game.LastActivity ?? null,
          game.Added ?? null,
          game.InstallDirectory ?? null,
          +game.IsInstalled,
          game.BackgroundImage ?? null,
          game.CoverImage ?? null,
          game.Icon ?? null,
          game.ContentHash,
          game.Id // WHERE Id
        );
        logService.debug(`Updated game ${game.Name}`);
        if (developers) {
          deleteDevelopersFor({ Id: game.Id, Name: game.Name });
          const uniqueDevs = Array.from(
            new Map(developers.map((dev) => [dev.Id, dev])).values()
          );
          for (const developer of uniqueDevs) {
            const existing = companyRepository.getById(developer.Id);
            if (existing) {
              if (companyRepository.hasChanges(existing, developer)) {
                companyRepository.update(developer);
              }
            } else {
              companyRepository.add(developer);
            }
            addDeveloperFor({ Id: game.Id, Name: game.Name }, developer);
          }
        }
        if (platforms) {
          deletePlatformsFor({ Id: game.Id, Name: game.Name });
          const uniquePlatforms = Array.from(
            new Map(platforms.map((plat) => [plat.Id, plat])).values()
          );
          for (const platform of uniquePlatforms) {
            const existing = platformRepository.getById(platform.Id);
            if (existing) {
              if (platformRepository.hasChanges(existing, platform)) {
                platformRepository.update(platform);
              }
            } else {
              platformRepository.add(platform);
            }
            addPlatformFor({ Id: game.Id, Name: game.Name }, platform);
          }
        }
        if (genres) {
          deleteGenresFor({ Id: game.Id, Name: game.Name });
          const uniqueGenres = Array.from(
            new Map(genres.map((genre) => [genre.Id, genre])).values()
          );
          for (const genre of uniqueGenres) {
            const existing = genreRepository.getById(genre.Id);
            if (existing) {
              if (genreRepository.hasChanges(existing, genre)) {
                genreRepository.update(genre);
              }
            } else {
              genreRepository.add(genre);
            }
            addGenreFor({ Id: game.Id, Name: game.Name }, genre);
          }
        }
        if (publishers) {
          deletePublishersFor({ Id: game.Id, Name: game.Name });
          const uniquePublishers = Array.from(
            new Map(publishers.map((pub) => [pub.Id, pub])).values()
          );
          for (const publisher of uniquePublishers) {
            const existing = companyRepository.getById(publisher.Id);
            if (existing) {
              if (companyRepository.hasChanges(existing, publisher)) {
                companyRepository.update(publisher);
              }
            } else {
              companyRepository.add(publisher);
            }
            addPublisherFor({ Id: game.Id, Name: game.Name }, publisher);
          }
        }
        return true;
      },
      `update(${game.Id}, ${game.Name}, developers: ${
        developers?.length ?? 0
      }, platforms: ${platforms?.length ?? 0}, genres: ${
        genres?.length ?? 0
      }, publishers: ${publishers?.length ?? 0})`
    );
  };

  const remove: PlayniteGameRepository["remove"] = (gameId) => {
    return repositoryCall(
      logService,
      () => {
        const db = getDb();
        const query = `DELETE FROM playnite_game WHERE Id = (?)`;
        const stmt = db.prepare(query);
        const result = stmt.run(gameId);
        logService.debug(`Game with id ${gameId} deleted`);
        return result.changes == 1; // Number of rows affected
      },
      `remove(${gameId})`
    );
  };

  const getManifestData: PlayniteGameRepository["getManifestData"] = () => {
    return repositoryCall(
      logService,
      () => {
        const db = getDb();
        const query = `SELECT Id, ContentHash FROM playnite_game`;
        const stmt = db.prepare(query);
        const result = stmt.all();
        const data: GameManifestData = [];
        for (const entry of result) {
          const value = {
            Id: entry.Id as string,
            ContentHash: entry.ContentHash as string,
          };
          data.push(value);
        }
        logService.debug(
          `Fetched manifest game data, total games in library: ${data.length}`
        );
        return data;
      },
      `getManifestData()`
    );
  };

  const getTotalPlaytimeSeconds: PlayniteGameRepository["getTotalPlaytimeSeconds"] =
    () => {
      return repositoryCall(
        logService,
        () => {
          const db = getDb();
          const query = `SELECT SUM(Playtime) as totalPlaytimeSeconds FROM playnite_game;`;
          const stmt = db.prepare(query);
          const result = stmt.get();
          if (!result) return 0;
          const data = result.totalPlaytimeSeconds as number;
          logService.debug(`Calculated total playtime: ${data} seconds`);
          return data;
        },
        `getTotalPlaytimeSeconds()`
      );
    };

  const all: PlayniteGameRepository["all"] = () => {
    return repositoryCall(
      logService,
      () => {
        const db = getDb();
        const separator = ",";
        const query = `
          SELECT 
          pg.*, 
          (
            SELECT GROUP_CONCAT(GenreId)
            FROM playnite_game_genre
            WHERE GameId = pg.Id
          ) AS Genres,
          (
            SELECT GROUP_CONCAT(PlatformId)
            FROM playnite_game_platform
            WHERE GameId = pg.Id
          ) AS Platforms,
          (
            SELECT GROUP_CONCAT(DeveloperId)
            FROM playnite_game_developer
            WHERE GameId = pg.Id
          ) AS Developers,
          (
            SELECT GROUP_CONCAT(PublisherId)
            FROM playnite_game_publisher
            WHERE GameId = pg.Id
          ) AS Publishers
          FROM playnite_game pg
          ORDER BY pg.Id ASC;`;
        const stmt = db.prepare(query);
        const result = stmt.all();
        const raw = z.array(fullGameRawSchema).parse(result);
        const games = raw.map((g) => {
          const devs = g.Developers ? g.Developers.split(separator) : [];
          const publishers = g.Publishers ? g.Publishers.split(separator) : [];
          const platforms = g.Platforms ? g.Platforms.split(separator) : [];
          const genres = g.Genres ? g.Genres.split(separator) : [];
          return {
            ...g,
            Developers: devs,
            Publishers: publishers,
            Platforms: platforms,
            Genres: genres,
          } as FullGame;
        });
        logService.debug(`Found ${games?.length ?? 0} games`);
        return games;
      },
      `all()`
    );
  };

  return {
    add,
    update,
    remove,
    exists,
    addDeveloperFor,
    addGenreFor,
    addPlatformFor,
    addPublisherFor,
    deleteDevelopersFor,
    deleteGenresFor,
    deletePlatformsFor,
    deletePublishersFor,
    getById,
    getTotalPlaytimeSeconds,
    getManifestData,
    getTotal,
    all,
  };
};

export const defaultPlayniteGameRepository: PlayniteGameRepository =
  makePlayniteGameRepository();
