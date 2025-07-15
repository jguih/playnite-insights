import { publisherSchema, type Publisher } from "@playnite-insights/lib";
import type {
  LogService,
  PublisherRepository,
} from "@playnite-insights/services";
import type { DatabaseSync } from "node:sqlite";
import z from "zod";

type PublisherRepositoryDeps = {
  getDb: () => DatabaseSync;
  logService: LogService;
};

export const makePublisherRepository = (
  deps: PublisherRepositoryDeps
): PublisherRepository => {
  const add = (publisher: Publisher): boolean => {
    const db = deps.getDb();
    const query = `
    INSERT INTO publisher
      (Id, Name)
    VALUES
      (?, ?)
  `;
    try {
      const stmt = db.prepare(query);
      stmt.run(publisher.Id, publisher.Name);
      deps.logService.debug(`Added publisher ${publisher.Name}`);
      return true;
    } catch (error) {
      deps.logService.error(
        `Failed to add publisher ${publisher.Name}`,
        error as Error
      );
      return false;
    }
  };

  const exists = (publisher: Publisher): boolean => {
    const db = deps.getDb();
    const query = `
    SELECT EXISTS (
      SELECT 1 FROM publisher 
      WHERE Id = (?)
    )
  `;
    try {
      const stmt = db.prepare(query);
      const result = stmt.get(publisher.Id);
      if (result) {
        return Object.values(result)[0] === 1;
      }
      return false;
    } catch (error) {
      deps.logService.error(
        `Failed to check if publisher ${publisher.Name} exists`,
        error as Error
      );
      return false;
    }
  };

  const update = (publisher: Publisher): boolean => {
    const db = deps.getDb();
    const query = `
    UPDATE publisher
    SET
      Name = ?
    WHERE Id = ?;
  `;
    try {
      const stmt = db.prepare(query);
      stmt.run(publisher.Name, publisher.Id);
      deps.logService.debug(`Updated data for publisher ${publisher.Name}`);
      return true;
    } catch (error) {
      deps.logService.error(
        `Failed to update publisher ${publisher.Name}`,
        error as Error
      );
      return false;
    }
  };

  const getById = (id: string): Publisher | undefined => {
    const db = deps.getDb();
    const query = `
    SELECT *
    FROM publisher
    WHERE Id = ?;
  `;
    try {
      const stmt = db.prepare(query);
      const result = stmt.get(id);
      const publisher = z.optional(publisherSchema).parse(result);
      deps.logService.debug(`Found publisher ${publisher?.Name}`);
      return publisher;
    } catch (error) {
      deps.logService.error(
        `Failed to get publisher with if ${id}`,
        error as Error
      );
      return;
    }
  };

  const hasChanges = (
    oldPublisher: Publisher,
    newPublisher: Publisher
  ): boolean => {
    return (
      oldPublisher.Id != newPublisher.Id ||
      oldPublisher.Name != newPublisher.Name
    );
  };

  return {
    add,
    exists,
    update,
    getById,
    hasChanges,
  };
};
