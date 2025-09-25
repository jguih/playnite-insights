import type { PlatformRepository } from "@playnite-insights/core";
import { platformSchema, type Platform } from "@playnite-insights/lib/client";
import z from "zod";
import {
  getDefaultRepositoryDeps,
  repositoryCall,
  type BaseRepositoryDeps,
} from "./base";

export const makePlatformRepository = (
  deps: Partial<BaseRepositoryDeps> = {}
): PlatformRepository => {
  const { getDb, logService } = { ...getDefaultRepositoryDeps(), ...deps };
  const TABLE_NAME = "platform";

  const add = (platform: Platform): boolean => {
    return repositoryCall(
      logService,
      () => {
        const db = getDb();
        const query = `
          INSERT INTO ${TABLE_NAME}
            (Id, Name, SpecificationId, Icon, Cover, Background)
          VALUES
            (?, ?, ?, ?, ?, ?)
        `;
        const stmt = db.prepare(query);
        stmt.run(
          platform.Id,
          platform.Name,
          platform.SpecificationId,
          platform.Icon,
          platform.Cover,
          platform.Background
        );
        logService.debug(`Created platform ${platform.Name}`);
        return true;
      },
      `add(${platform.Id}, ${platform.Name})`
    );
  };

  const upsertMany: PlatformRepository["upsertMany"] = (platforms): boolean => {
    return repositoryCall(
      logService,
      () => {
        const start = performance.now();
        const db = getDb();
        const query = `
          INSERT INTO ${TABLE_NAME}
            (Id, Name, SpecificationId, Icon, Cover, Background)
          VALUES
            (?, ?, ?, ?, ?, ?)
          ON CONFLICT DO UPDATE SET
            Name = excluded.Name,
            SpecificationId = excluded.SpecificationId,
            Icon = excluded.Icon,
            Cover = excluded.Cover,
            Background = excluded.Background;
          `;
        const stmt = db.prepare(query);
        db.exec("BEGIN TRANSACTION");
        for (const platform of platforms)
          stmt.run(
            platform.Id,
            platform.Name,
            platform.SpecificationId,
            platform.Icon,
            platform.Cover,
            platform.Background
          );
        db.exec("COMMIT");
        const duration = performance.now() - start;
        logService.debug(
          `Upserted ${platforms.length} platforms in ${duration.toFixed(1)}ms`
        );
        return true;
      },
      `upsertMany(${platforms.length} platforms)`
    );
  };

  const exists = (platform: Pick<Platform, "Id" | "Name">): boolean => {
    return repositoryCall(
      logService,
      () => {
        const db = getDb();
        const query = `
          SELECT EXISTS (
            SELECT 1 FROM platform 
            WHERE Id = (?)
          )
        `;
        const stmt = db.prepare(query);
        const result = stmt.get(platform.Id);
        if (result) {
          return Object.values(result)[0] === 1;
        }
        return false;
      },
      `exists(${platform.Id})`
    );
  };

  const update = (platform: Platform): boolean => {
    return repositoryCall(
      logService,
      () => {
        const db = getDb();
        const query = `
        UPDATE ${TABLE_NAME}
        SET
          Name = ?,
          SpecificationId = ?,
          Icon = ?,
          Cover = ?,
          Background = ?
        WHERE Id = ?;
      `;
        const stmt = db.prepare(query);
        stmt.run(
          platform.Name,
          platform.SpecificationId,
          platform.Icon,
          platform.Cover,
          platform.Background,
          platform.Id
        );
        logService.debug(`Updated platform ${platform.Name}`);
        return true;
      },
      `update(${platform.Id}, ${platform.Name})`
    );
  };

  const getById = (id: string): Platform | undefined => {
    return repositoryCall(
      logService,
      () => {
        const db = getDb();
        const query = `
        SELECT *
        FROM ${TABLE_NAME}
        WHERE Id = ?;
      `;
        const stmt = db.prepare(query);
        const result = stmt.get(id);
        const platform = z.optional(platformSchema).parse(result);
        logService.debug(`Found platform ${platform?.Name}`);
        return platform;
      },
      `getById(${id})`
    );
  };

  const hasChanges = (
    oldPlatform: Platform,
    newPlatform: Platform
  ): boolean => {
    return (
      oldPlatform.Id != newPlatform.Id ||
      oldPlatform.Name != newPlatform.Name ||
      oldPlatform.SpecificationId != newPlatform.SpecificationId ||
      oldPlatform.Background != newPlatform.Background ||
      oldPlatform.Cover != newPlatform.Cover ||
      oldPlatform.Icon != newPlatform.Icon
    );
  };

  const all: PlatformRepository["all"] = () => {
    return repositoryCall(
      logService,
      () => {
        const db = getDb();
        const query = `SELECT * FROM ${TABLE_NAME} ORDER BY Name ASC`;
        const stmt = db.prepare(query);
        const result = stmt.all();
        const platforms = z.optional(z.array(platformSchema)).parse(result);
        logService.debug(`Found ${platforms?.length ?? 0} platforms`);
        return platforms;
      },
      `all()`
    );
  };

  return {
    add,
    upsertMany,
    update,
    exists,
    getById,
    hasChanges,
    all,
  };
};

export const defaultPlatformRepository: PlatformRepository =
  makePlatformRepository();
