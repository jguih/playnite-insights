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
  const TABLE_NAME = "game_note";

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
    getById: `SELECT * FROM ${TABLE_NAME} WHERE Id = (?)`,
    update: `
        UPDATE ${TABLE_NAME} 
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
      INSERT INTO ${TABLE_NAME} (
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
    all: `SELECT * FROM game_note`,
  };

  const params = {
    add: {
      fromNote: (note: GameNote) => [
        note.Id,
        note.Title,
        note.Content,
        note.ImagePath,
        note.GameId,
        note.SessionId,
        note.DeletedAt,
        note.CreatedAt,
        note.LastUpdatedAt,
      ],
    },
    update: {
      fromNote: (note: GameNote) => [
        note.Title,
        note.Content,
        note.ImagePath,
        note.GameId,
        note.SessionId,
        note.DeletedAt,
        note.CreatedAt,
        note.LastUpdatedAt,
        note.Id,
      ],
    },
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
        stmt.run(...params.add.fromNote(note));
        logService.debug(`Created note (${note.Id}, ${note.Title})`);
        return note;
      },
      `add(${note.Id}, ${note.Title})`
    );
  };

  const addMany: GameNoteRepository["addMany"] = (notes) => {
    return repositoryCall(
      logService,
      () => {
        if (notes.length === 0) return;
        const db = getDb();
        const query = queries.add;
        const now = new Date().toISOString();
        const stmt = db.prepare(query);
        db.exec("BEGIN TRANSACTION");
        try {
          for (const note of notes) {
            note.CreatedAt = now;
            note.LastUpdatedAt = now;
            note.DeletedAt = null;
            stmt.run(...params.add.fromNote(note));
          }
          db.exec("COMMIT");
        } catch (error) {
          db.exec("ROLLBACK");
          throw error;
        }
      },
      `addMany(${notes.length} notes)`
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
        stmt.run(...params.update.fromNote(updatedNote));
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
        let query = queries.all;
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

  const reconcileFromSource: GameNoteRepository["reconcileFromSource"] = (
    notes
  ) => {
    return repositoryCall(
      logService,
      () => {
        if (notes.length === 0) return;
        const db = getDb();
        const stmts = {
          getById: db.prepare(queries.getById),
          add: db.prepare(queries.add),
          update: db.prepare(queries.update),
          all: db.prepare(queries.all),
        };
        let added = 0;
        let skipped = 0;
        let updated = 0;
        db.exec("BEGIN TRANSACTION");
        try {
          const existingNotes = z.array(gameNoteSchema).parse(stmts.all.all());
          logService.info(
            `Notes reconciliation started: ${notes.length} incoming notes, ${existingNotes.length} notes in database`
          );
          for (const note of notes) {
            const existing = stmts.getById.get(note.Id);
            if (!existing) {
              stmts.add.run(...params.add.fromNote(note));
              added++;
              continue;
            }
            const existingNote = gameNoteSchema.parse(existing);
            if (note.LastUpdatedAt > existingNote.LastUpdatedAt) {
              stmts.update.run(...params.update.fromNote(note));
              updated++;
            } else {
              skipped++;
            }
          }
          db.exec("COMMIT");
          logService.success(
            `Notes reconciliation complete: ${added} added, ${updated} updated and ${skipped} skipped`
          );
        } catch (error) {
          db.exec("ROLLBACK");
          throw error;
        }
      },
      `reconcileFromSource(${notes.length} notes)`
    );
  };

  return {
    add,
    addMany,
    getById,
    update,
    remove,
    all,
    reconcileFromSource,
  };
};
