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

  query = `
    INSERT INTO platform
      (Id, Name, SpecificationId, Icon, Cover, Background)
    VALUES
      (?, ?, ?, ?, ?, ?);
  `;
  const platformStmt = db.prepare(query);
  const platformData = [
    ['pc', 'PC', 'spec-pc', 'pc-icon.png', 'pc-cover.jpg', 'pc-bg.jpg'],
    ['playstation', 'PlayStation', 'spec-playstation', 'ps-icon.png', 'ps-cover.jpg', 'ps-bg.jpg'],
    ['xbox', 'Xbox', 'spec-xbox', 'xbox-icon.png', 'xbox-cover.jpg', 'xbox-bg.jpg'],
    ['nintendo', 'Nintendo', 'spec-nintendo', 'nintendo-icon.png', 'nintendo-cover.jpg', 'nintendo-bg.jpg'],
    ['mobile', 'Mobile', 'spec-mobile', 'mobile-icon.png', 'mobile-cover.jpg', 'mobile-bg.jpg'],
    ['mac', 'Mac', 'spec-mac', 'mac-icon.png', 'mac-cover.jpg', 'mac-bg.jpg'],
    ['linux', 'Linux', 'spec-linux', 'linux-icon.png', 'linux-cover.jpg', 'linux-bg.jpg'],
  ];
  for (const row of platformData) {
    platformStmt.run(...row);
  }

  query = `
    INSERT INTO genre
      (Id, Name)
    VALUES
      (?, ?);
  `;
  const genreStmt = db.prepare(query);
  const genreData = [
    ['action', 'Action'],
    ['adventure', 'Adventure'],
    ['rpg', 'RPG'],
    ['strategy', 'Strategy'],
    ['simulation', 'Simulation'],
    ['sports', 'Sports'],
    ['puzzle', 'Puzzle'],
    ['horror', 'Horror'],
    ['platformer', 'Platformer'],
    ['shooter', 'Shooter'],
  ];
  for (const row of genreData) {
    genreStmt.run(...row);
  }

  query = `
    INSERT INTO developer
      (Id, Name)
    VALUES
      (?, ?);
  `;
  const developerStmt = db.prepare(query);
  const developerData = [
    ['dev-nintendo', 'Nintendo'],
    ['dev-valve', 'Valve'],
    ['dev-sony', 'Sony Interactive Entertainment'],
    ['dev-microsoft', 'Microsoft Studios'],
    ['dev-capcom', 'Capcom'],
    ['dev-ubisoft', 'Ubisoft'],
    ['dev-squareenix', 'Square Enix'],
    ['dev-rockstar', 'Rockstar Games'],
    ['dev-bethesda', 'Bethesda Softworks'],
    ['dev-ea', 'Electronic Arts'],
  ];
  for (const row of developerData) {
    developerStmt.run(...row);
  }

  // Seed data for publisher table
  query = `
    INSERT INTO publisher
      (Id, Name)
    VALUES
      (?, ?);
  `;
  const publisherStmt = db.prepare(query);
  const publisherData = [
    ['pub-nintendo', 'Nintendo'],
    ['pub-valve', 'Valve'],
    ['pub-sony', 'Sony Interactive Entertainment'],
    ['pub-microsoft', 'Microsoft Studios'],
    ['pub-capcom', 'Capcom'],
    ['pub-ubisoft', 'Ubisoft'],
    ['pub-squareenix', 'Square Enix'],
    ['pub-rockstar', 'Rockstar Games'],
    ['pub-bethesda', 'Bethesda Softworks'],
    ['pub-ea', 'Electronic Arts'],
  ];
  for (const row of publisherData) {
    publisherStmt.run(...row);
  }

  query = `
    INSERT INTO playnite_game
      (Id, Name, Description, ReleaseDate, Playtime, LastActivity, Added, InstallDirectory, IsInstalled, BackgroundImage, CoverImage, Icon)
    VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
  `;
  const gameStmt = db.prepare(query);
  const gameData = [
    [
      'game-1',
      'The Legend of Zelda: Breath of the Wild',
      'An open-world adventure game set in Hyrule.',
      '2017-03-03',
      120.5,
      '2024-06-15T14:00:00Z',
      '2020-01-10T10:00:00Z',
      '/games/zelda-botw',
      1,
      'zelda-bg.jpg',
      'zelda-cover.jpg',
      'zelda-icon.png'
    ],
    [
      'game-2',
      'Half-Life 2',
      'A first-person shooter developed by Valve.',
      '2004-11-16',
      45.0,
      '2024-05-20T18:30:00Z',
      '2019-11-05T09:30:00Z',
      '/games/half-life-2',
      0,
      'hl2-bg.jpg',
      'hl2-cover.jpg',
      'hl2-icon.png'
    ],
    [
      'game-3',
      'God of War',
      'Action-adventure game based on Norse mythology.',
      '2018-04-20',
      60.2,
      '2024-04-10T20:00:00Z',
      '2021-03-15T12:00:00Z',
      '/games/god-of-war',
      1,
      'gow-bg.jpg',
      'gow-cover.jpg',
      'gow-icon.png'
    ],
    [
      'game-4',
      'Minecraft',
      'A sandbox game about placing blocks and going on adventures.',
      '2011-11-18',
      300.0,
      '2024-07-01T16:00:00Z',
      '2018-07-22T08:00:00Z',
      '/games/minecraft',
      1,
      'minecraft-bg.jpg',
      'minecraft-cover.jpg',
      'minecraft-icon.png'
    ],
    [
      'game-5',
      'The Witcher 3: Wild Hunt',
      'A story-driven open world RPG set in a visually stunning fantasy universe.',
      '2015-05-19',
      150.7,
      '2024-03-12T22:00:00Z',
      '2022-02-10T15:00:00Z',
      '/games/witcher-3',
      0,
      'witcher3-bg.jpg',
      'witcher3-cover.jpg',
      'witcher3-icon.png'
    ]
  ];
  for (const row of gameData) {
    gameStmt.run(...row);
  }

  query = `
    INSERT INTO playnite_game_platform
      (GameId, PlatformId)
    VALUES
      (?, ?);
  `;
  const gamePlatformStmt = db.prepare(query);
  const gamePlatformData = [
    ['game-1', 'nintendo'],
    ['game-2', 'pc'],
    ['game-3', 'playstation'],
    ['game-4', 'pc'],
    ['game-4', 'xbox'],
    ['game-4', 'nintendo'],
    ['game-5', 'pc'],
    ['game-5', 'playstation'],
    ['game-5', 'xbox'],
  ];
  for (const row of gamePlatformData) {
    gamePlatformStmt.run(...row);
  }

  query = `
    INSERT INTO playnite_game_genre
      (GameId, GenreId)
    VALUES
      (?, ?);
  `;
  const gameGenreStmt = db.prepare(query);
  const gameGenreData = [
    ['game-1', 'adventure'],
    ['game-1', 'action'],
    ['game-2', 'shooter'],
    ['game-2', 'action'],
    ['game-3', 'action'],
    ['game-3', 'adventure'],
    ['game-4', 'simulation'],
    ['game-4', 'adventure'],
    ['game-5', 'rpg'],
    ['game-5', 'adventure'],
  ];
  for (const row of gameGenreData) {
    gameGenreStmt.run(...row);
  }

  query = `
    INSERT INTO playnite_game_developer
      (GameId, DeveloperId)
    VALUES
      (?, ?);
  `;
  const gameDeveloperStmt = db.prepare(query);
  const gameDeveloperData = [
    ['game-1', 'dev-nintendo'],
    ['game-2', 'dev-valve'],
    ['game-3', 'dev-sony'],
    ['game-4', 'dev-microsoft'],
    ['game-5', 'dev-microsoft'],
  ];
  for (const row of gameDeveloperData) {
    gameDeveloperStmt.run(...row);
  }

  query = `
    INSERT INTO playnite_game_publisher
      (GameId, PublisherId)
    VALUES
      (?, ?);
  `;
  const gamePublisherStmt = db.prepare(query);
  const gamePublisherData = [
    ['game-1', 'pub-nintendo'],
    ['game-2', 'pub-valve'],
    ['game-3', 'pub-sony'],
    ['game-4', 'pub-microsoft'],
    ['game-5', 'pub-microsoft'],
  ];
  for (const row of gamePublisherData) {
    gamePublisherStmt.run(...row);
  }

  logInfo("Test data loaded successfully");
  exit(0);
}