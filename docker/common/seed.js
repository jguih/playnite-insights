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
    ['2024-07-01T12:00:00Z', 1500, 1500],
    ['2024-07-01T12:00:00Z', 1510, 1501],
    ['2024-08-01T12:00:00Z', 1520, 1502],
    ['2024-08-01T12:00:00Z', 1530, 1503],
    ['2024-09-01T12:00:00Z', 1540, 1504],
    ['2024-09-01T12:00:00Z', 1550, 1505],
    ['2024-10-01T12:00:00Z', 1560, 1506],
    ['2024-10-01T12:00:00Z', 1570, 1507],
    ['2024-11-01T12:00:00Z', 1580, 1508],
    ['2024-11-01T12:00:00Z', 1590, 1509],
    ['2024-12-01T12:00:00Z', 1600, 1510],
    ['2024-12-01T12:00:00Z', 1610, 1511],
    ['2025-01-01T12:00:00Z', 1620, 1512],
    ['2025-01-01T12:00:00Z', 1630, 1513],
    ['2025-02-01T12:00:00Z', 1640, 1514],
    ['2025-02-01T12:00:00Z', 1650, 1515],
    ['2025-03-01T12:00:00Z', 1660, 1516],
    ['2025-03-01T12:00:00Z', 1670, 1517],
    ['2025-04-01T12:00:00Z', 1680, 1518],
    ['2025-04-01T12:00:00Z', 1690, 1519],
    ['2025-05-01T12:00:00Z', 1700, 1520],
    ['2025-05-01T12:00:00Z', 1710, 1521],
    ['2025-06-01T12:00:00Z', 1720, 1522],
    ['2025-06-01T12:00:00Z', 1730, 1523],
    ['2025-07-01T12:00:00Z', 1740, 1524],
    ['2025-07-01T12:00:00Z', 1750, 1525],
  ];
  for (const row of data) {
    stmt.run(...row);
  }

  logInfo("Test data loaded successfully");
  exit(0);
}