import {
  BaseRepositoryDeps,
  makeRepositoryBase,
} from "@playatlas/common/infra";
import z from "zod";
import { Platform } from "../domain";
import { platformMapper } from "../platform.mapper";
import { PlatformRepository } from "./platform.repository.port";

export const platformSchema = z.object({
  Id: z.string(),
  Name: z.string(),
  SpecificationId: z.string(),
  Icon: z.string().nullable(),
  Cover: z.string().nullable(),
  Background: z.string().nullable(),
});

export type PlatformModel = z.infer<typeof platformSchema>;

export const makePlatformRepository = ({
  getDb,
  logService,
}: BaseRepositoryDeps): PlatformRepository => {
  const TABLE_NAME = "platform";
  const base = makeRepositoryBase({
    getDb,
    logService,
    config: {
      tableName: TABLE_NAME,
      idColumn: "Id",
      insertColumns: [
        "Id",
        "Name",
        "SpecificationId",
        "Icon",
        "Cover",
        "Background",
      ],
      updateColumns: [], // TODO
      toPersistence: platformMapper.toPersistence,
    },
  });

  const add: PlatformRepository["add"] = (platform) => {
    return base.run(({ db }) => {
      const query = `
          INSERT INTO ${TABLE_NAME}
            (Id, Name, SpecificationId, Icon, Cover, Background)
          VALUES
            (?, ?, ?, ?, ?, ?)
        `;
      const stmt = db.prepare(query);
      const platformModel = platformMapper.toPersistence(platform);
      stmt.run(
        platformModel.Id,
        platformModel.Name,
        platformModel.SpecificationId,
        platformModel.Icon,
        platformModel.Cover,
        platformModel.Background
      );
      logService.debug(`Created platform ${platformModel.Name}`);
      return true;
    }, `add(${platform.getId()}, ${platform.getName()})`);
  };

  const upsertMany: PlatformRepository["upsertMany"] = (platforms) => {
    return base.run(({ db }) => {
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
      for (const platform of platforms) {
        base.runTransaction(() => {
          const platformModel = platformMapper.toPersistence(platform);
          stmt.run(
            platformModel.Id,
            platformModel.Name,
            platformModel.SpecificationId,
            platformModel.Icon,
            platformModel.Cover,
            platformModel.Background
          );
        });
      }
    }, `upsertMany(${platforms.length} platforms)`);
  };

  const exists: PlatformRepository["exists"] = (id): boolean => {
    return base.run(({ db }) => {
      const query = `
          SELECT EXISTS (
            SELECT 1 FROM platform 
            WHERE Id = (?)
          )
        `;
      const stmt = db.prepare(query);
      const result = stmt.get(id);
      if (result) {
        return Object.values(result)[0] === 1;
      }
      return false;
    }, `exists(${id})`);
  };

  const update: PlatformRepository["update"] = (platform) => {
    return base.run(({ db }) => {
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
      const platformModel = platformMapper.toPersistence(platform);
      stmt.run(
        platformModel.Name,
        platformModel.SpecificationId,
        platformModel.Icon,
        platformModel.Cover,
        platformModel.Background,
        platformModel.Id
      );
      logService.debug(`Updated platform ${platformModel.Name}`);
    }, `update(${platform.getId()}, ${platform.getName()})`);
  };

  const getById: PlatformRepository["getById"] = (id) => {
    return base.run(({ db }) => {
      const query = `
        SELECT *
        FROM ${TABLE_NAME}
        WHERE Id = ?;
      `;
      const stmt = db.prepare(query);
      const result = stmt.get(id);
      if (!result) return null;
      const platformModel = platformSchema.parse(result);
      logService.debug(`Found platform ${platformModel?.Name}`);
      return platformMapper.toDomain(platformModel);
    }, `getById(${id})`);
  };

  const all: PlatformRepository["all"] = () => {
    return base.run(({ db }) => {
      const query = `SELECT * FROM ${TABLE_NAME} ORDER BY Name ASC`;
      const stmt = db.prepare(query);
      const result = stmt.all();
      const platformModels = z.array(platformSchema).parse(result);
      logService.debug(`Found ${platformModels?.length ?? 0} platforms`);
      const platforms: Platform[] = [];
      for (const platformModel of platformModels) {
        platforms.push(platformMapper.toDomain(platformModel));
      }
      return platforms;
    }, `all()`);
  };

  return {
    add,
    upsertMany,
    update,
    exists,
    getById,
    all,
  };
};
