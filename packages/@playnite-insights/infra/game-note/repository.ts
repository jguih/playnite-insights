import type { GameNoteRepository } from "@playnite-insights/core";
import {
  type GameNote,
  type GameNoteFilters,
  gameNoteSchema,
} from "@playnite-insights/lib/client";
import z from "zod";
import {
  type BaseRepositoryDeps,
  getDefaultRepositoryDeps,
  repositoryCall,
} from "../repository/base";

export const makeGameNoteRepository = (
  deps: Partial<BaseRepositoryDeps> = {}
): GameNoteRepository => {
  const { getDb, logService } = { ...getDefaultRepositoryDeps(), ...deps };

  const getWhereClauseAndParamsFromFilters = (filters?: GameNoteFilters) => {
    const where: string[] = [];
    const params: string[] = [];

    if (filters?.lastUpdatedAt) {
      for (const startTimeFilter of filters.lastUpdatedAt) {
        switch (startTimeFilter.op) {
          case "between": {
            where.push(`LastUpdatedAt >= (?) AND LastUpdatedAt < (?)`);
            params.push(startTimeFilter.start, startTimeFilter.end);
            break;
          }
          case "eq": {
            where.push(`LastUpdatedAt = (?)`);
            params.push(startTimeFilter.value);
            break;
          }
          case "gte": {
            where.push(`LastUpdatedAt >= (?)`);
            params.push(startTimeFilter.value);
            break;
          }
          case "lte": {
            where.push(`LastUpdatedAt <= (?)`);
            params.push(startTimeFilter.value);
            break;
          }
          case "overlaps": {
            where.push(`LastUpdatedAt < (?) AND LastUpdatedAt >= (?)`);
            params.push(startTimeFilter.end, startTimeFilter.start);
            break;
          }
        }
      }
    }

    if (where.length === 0) return { where: "", params: [] };

    return { where: ` WHERE ${where.join(" AND ")}`, params };
  };

  const queries = {
    getById: `SELECT * FROM game_note WHERE Id = (?)`,
    update: `
        UPDATE game_note 
        SET
          Title = ?,
          Content = ?,
          ImagePath = ?,
          GameId = ?,
          SessionId = ?,
          DeletedAt = ?,
          CreatedAt = ?,
          LastUpdatedAt = ?
        WHERE Id = ?;
        `,
    add: `
      INSERT INTO game_note (
        Id, 
        Title,
        Content,
        ImagePath,
        GameId,
        SessionId,
        DeletedAt,
        CreatedAt,
        LastUpdatedAt
      ) VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?);
      `,
  };

  const getById = (id: string): GameNote | null => {
    return repositoryCall(
      logService,
      () => {
        const db = getDb();
        const query = queries.getById;
        const stmt = db.prepare(query);
        const result = stmt.get(id);
        const note = z.optional(gameNoteSchema).parse(result);
        return note ?? null;
      },
      `getById(${id})`
    );
  };

  const add: GameNoteRepository["add"] = (note) => {
    return repositoryCall(
      logService,
      () => {
        const db = getDb();
        const query = queries.add;
        const now = new Date().toISOString();
        note.CreatedAt = now;
        note.LastUpdatedAt = now;
        note.DeletedAt = null;
        const stmt = db.prepare(query);
        stmt.run(
          note.Id,
          note.Title,
          note.Content,
          note.ImagePath,
          note.GameId,
          note.SessionId,
          note.DeletedAt,
          note.CreatedAt,
          note.LastUpdatedAt
        );
        logService.debug(`Created note (${note.Id}, ${note.Title})`);
        return note;
      },
      `add(${note.Id}, ${note.Title})`
    );
  };

  const update: GameNoteRepository["update"] = (note) => {
    return repositoryCall(
      logService,
      () => {
        const db = getDb();
        const query = queries.update;
        const updatedNote = { ...note };
        const now = new Date().toISOString();
        updatedNote.LastUpdatedAt = now;
        updatedNote.DeletedAt = null;
        const stmt = db.prepare(query);
        stmt.run(
          updatedNote.Title,
          updatedNote.Content,
          updatedNote.ImagePath,
          updatedNote.GameId,
          updatedNote.SessionId,
          updatedNote.DeletedAt,
          updatedNote.CreatedAt,
          updatedNote.LastUpdatedAt,
          updatedNote.Id
        );
        logService.debug(`Updated note (${note.Id})`);
        return updatedNote;
      },
      `update(${note.Id}, ${note.Title})`
    );
  };

  const remove: GameNoteRepository["remove"] = (noteId) => {
    return repositoryCall(
      logService,
      () => {
        const db = getDb();
        const query = `
        UPDATE game_note 
        SET
          LastUpdatedAt = ?,
          DeletedAt = ?
        WHERE Id = ?;
        `;
        const now = new Date().toISOString();
        const stmt = db.prepare(query);
        stmt.run(now, now, noteId);
        logService.debug(`Marked note as deleted (${noteId})`);
      },
      `remove(${noteId})`
    );
  };

  const all: GameNoteRepository["all"] = (args = {}) => {
    return repositoryCall(
      logService,
      () => {
        const db = getDb();
        let query = `SELECT * FROM game_note`;
        const { where, params } = getWhereClauseAndParamsFromFilters(
          args.filters
        );
        query += where;
        const stmt = db.prepare(query);
        const result = stmt.all(...params);
        const notes = z.array(gameNoteSchema).parse(result);
        logService.debug(`Found ${notes.length} notes`);
        return notes;
      },
      `all()`
    );
  };

  const reconsileFromSource: GameNoteRepository["reconsileFromSource"] = (
    notes
  ) => {
    return repositoryCall(
      logService,
      () => {
        const db = getDb();
        const stmts = {
          getById: db.prepare(queries.getById),
          add: db.prepare(queries.add),
          update: db.prepare(queries.update),
        };
        db.exec("BEGIN TRANSACTION");
        try {
          for (const note of notes) {
            const existing = stmts.getById.get(note.Id);
            if (!existing) {
              stmts.add.run(note);
              continue;
            }
            const existingNote = gameNoteSchema.parse(existing);
            if (note.LastUpdatedAt > existingNote.LastUpdatedAt) {
              stmts.update.run(
                note.Title,
                note.Content,
                note.ImagePath,
                note.GameId,
                note.SessionId,
                note.DeletedAt,
                note.CreatedAt,
                note.LastUpdatedAt,
                note.Id
              );
            }
          }
          db.exec("COMMIT");
        } catch (error) {
          db.exec("ROLLBACK");
          throw error;
        }
      },
      `reconsileFromSource(${notes.length} notes)`
    );
  };

  return { add, getById, update, remove, all, reconsileFromSource };
};
