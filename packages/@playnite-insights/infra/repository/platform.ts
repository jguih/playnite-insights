import { platformSchema, type Platform } from "@playnite-insights/lib";
import type { LogService, PlatformRepository } from "@playnite-insights/core";
import type { DatabaseSync } from "node:sqlite";
import z from "zod";
import { getDb as _getDb } from "../database";
import { defaultLogger } from "../services/log";

type PlatformRepositoryDeps = {
  getDb: () => DatabaseSync;
  logService: LogService;
};

export const makePlatformRepository = (
  { getDb, logService }: PlatformRepositoryDeps = {
    getDb: _getDb,
    logService: defaultLogger,
  }
): PlatformRepository => {
  const add = (platform: Platform): boolean => {
    const db = getDb();
    const query = `
        INSERT INTO platform
          (Id, Name, SpecificationId, Icon, Cover, Background)
        VALUES
          (?, ?, ?, ?, ?, ?)
      `;
    try {
      const stmt = db.prepare(query);
      stmt.run(
        platform.Id,
        platform.Name,
        platform.SpecificationId,
        platform.Icon,
        platform.Cover,
        platform.Background
      );
      logService.debug(`Added platform ${platform.Name}`);
      return true;
    } catch (error) {
      logService.error(
        `Failed to add platform ${platform.Name}`,
        error as Error
      );
      return false;
    }
  };

  const exists = (platform: Pick<Platform, "Id" | "Name">): boolean => {
    const db = getDb();
    const query = `
        SELECT EXISTS (
          SELECT 1 FROM platform 
          WHERE Id = (?)
        )
      `;
    try {
      const stmt = db.prepare(query);
      const result = stmt.get(platform.Id);
      if (result) {
        return Object.values(result)[0] === 1;
      }
      return false;
    } catch (error) {
      logService.error(
        `Failed to check if platform ${platform.Name} exists`,
        error as Error
      );
      return false;
    }
  };

  const update = (platform: Platform): boolean => {
    const db = getDb();
    const query = `
      UPDATE platform
      SET
        Name = ?,
        SpecificationId = ?,
        Icon = ?,
        Cover = ?,
        Background = ?
      WHERE Id = ?;
    `;
    try {
      const stmt = db.prepare(query);
      stmt.run(
        platform.Name,
        platform.SpecificationId,
        platform.Icon,
        platform.Cover,
        platform.Background,
        platform.Id
      );
      logService.debug(`Updated data for platform ${platform.Name}`);
      return true;
    } catch (error) {
      logService.error(
        `Failed to update platform ${platform.Name}`,
        error as Error
      );
      return false;
    }
  };

  const getById = (id: string): Platform | undefined => {
    const db = getDb();
    const query = `
      SELECT *
      FROM platform
      WHERE Id = ?;
    `;
    try {
      const stmt = db.prepare(query);
      const result = stmt.get(id);
      const platform = z.optional(platformSchema).parse(result);
      logService.debug(`Found platform ${platform?.Name}`);
      return platform;
    } catch (error) {
      logService.error(`Failed to get platform with if ${id}`, error as Error);
      return;
    }
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

  return {
    add,
    update,
    exists,
    getById,
    hasChanges,
  };
};
