// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { DatabaseSync } from 'node:sqlite';
import { exit } from 'process';
import { logInfo } from './config.js';


/**
 * Seeds the database with test data for the `playnite_library_sync` table.
 *
 * @param {DatabaseSync} db - The SQLite database instance to seed.
 */
export const seedDb = (db) => {
  logInfo("Loading testing data...");
  let query = `
    INSERT INTO playnite_library_sync
      (timestamp, totalPlaytimeHours, totalGames)
    VALUES
      (?, ?, ?);
  `;
  const stmt = db.prepare(query);
  const data = [
    ['2024-07-01T12:00:00Z', 120, 50],
    ['2024-07-01T12:00:00Z', 125, 51],
    ['2024-08-01T12:00:00Z', 140, 52],
    ['2024-08-01T12:00:00Z', 145, 53],
    ['2024-09-01T12:00:00Z', 135, 53],
    ['2024-09-01T12:00:00Z', 140, 54],
    ['2024-10-01T12:00:00Z', 150, 55],
    ['2024-10-01T12:00:00Z', 155, 56],
    ['2024-11-01T12:00:00Z', 160, 56],
    ['2024-11-01T12:00:00Z', 165, 57],
    ['2024-12-01T12:00:00Z', 155, 58],
    ['2024-12-01T12:00:00Z', 160, 59],
    ['2025-01-01T12:00:00Z', 170, 60],
    ['2025-01-01T12:00:00Z', 175, 61],
    ['2025-02-01T12:00:00Z', 165, 62],
    ['2025-02-01T12:00:00Z', 170, 63],
    ['2025-03-01T12:00:00Z', 180, 65],
    ['2025-03-01T12:00:00Z', 185, 66],
    ['2025-04-01T12:00:00Z', 190, 68],
    ['2025-04-01T12:00:00Z', 195, 69],
    ['2025-05-01T12:00:00Z', 200, 70],
    ['2025-05-01T12:00:00Z', 205, 71],
    ['2025-06-01T12:00:00Z', 210, 72],
    ['2025-06-01T12:00:00Z', 215, 73],
    ['2025-07-01T12:00:00Z', 220, 92],
    ['2025-07-01T12:00:00Z', 225, 93],
  ];
  for (const row of data) {
    stmt.run(...row);
  }

  logInfo("Test data loaded successfully");
  exit(0);
}