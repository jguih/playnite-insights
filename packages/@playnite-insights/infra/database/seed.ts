import { DatabaseSync } from "node:sqlite";
import { faker } from "@faker-js/faker";
import type { LogService } from "@playnite-insights/core";

export const seedDb = (db: DatabaseSync, logService: LogService) => {
  logService.info("Seeding database...");
  let query = `
    INSERT INTO playnite_library_sync
      (Timestamp, TotalPlaytimeSeconds, TotalGames)
    VALUES
      (?, ?, ?);
  `;
  const stmt = db.prepare(query);
  const data = [
    ["2024-07-01T12:00:00Z", 5400000, 1500],
    ["2024-07-01T12:00:00Z", 5436000, 1501],
    ["2024-08-01T12:00:00Z", 5472000, 1502],
    ["2024-08-01T12:00:00Z", 5508000, 1503],
    ["2024-09-01T12:00:00Z", 5544000, 1504],
    ["2024-09-01T12:00:00Z", 5580000, 1505],
    ["2024-10-01T12:00:00Z", 5616000, 1506],
    ["2024-10-01T12:00:00Z", 5652000, 1507],
    ["2024-11-01T12:00:00Z", 5688000, 1508],
    ["2024-11-01T12:00:00Z", 5724000, 1509],
    ["2024-12-01T12:00:00Z", 5760000, 1510],
    ["2024-12-01T12:00:00Z", 5796000, 1511],
    ["2025-01-01T12:00:00Z", 5832000, 1512],
    ["2025-01-01T12:00:00Z", 5868000, 1513],
    ["2025-02-01T12:00:00Z", 5904000, 1514],
    ["2025-02-01T12:00:00Z", 5940000, 1515],
    ["2025-03-01T12:00:00Z", 5976000, 1516],
    ["2025-03-01T12:00:00Z", 6012000, 1517],
    ["2025-04-01T12:00:00Z", 6048000, 1518],
    ["2025-04-01T12:00:00Z", 6084000, 1519],
    ["2025-05-01T12:00:00Z", 6120000, 1520],
    ["2025-05-01T12:00:00Z", 6156000, 1521],
    ["2025-06-01T12:00:00Z", 6192000, 1522],
    ["2025-06-01T12:00:00Z", 6228000, 1523],
    ["2025-07-01T12:00:00Z", 6264000, 1524],
    ["2025-07-01T12:00:00Z", 6300000, 1525],
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
    ["pc", "PC", "spec-pc", "pc-icon.png", "pc-cover.jpg", "pc-bg.jpg"],
    [
      "playstation",
      "PlayStation",
      "spec-playstation",
      "ps-icon.png",
      "ps-cover.jpg",
      "ps-bg.jpg",
    ],
    [
      "xbox",
      "Xbox",
      "spec-xbox",
      "xbox-icon.png",
      "xbox-cover.jpg",
      "xbox-bg.jpg",
    ],
    [
      "nintendo",
      "Nintendo",
      "spec-nintendo",
      "nintendo-icon.png",
      "nintendo-cover.jpg",
      "nintendo-bg.jpg",
    ],
    [
      "mobile",
      "Mobile",
      "spec-mobile",
      "mobile-icon.png",
      "mobile-cover.jpg",
      "mobile-bg.jpg",
    ],
    ["mac", "Mac", "spec-mac", "mac-icon.png", "mac-cover.jpg", "mac-bg.jpg"],
    [
      "linux",
      "Linux",
      "spec-linux",
      "linux-icon.png",
      "linux-cover.jpg",
      "linux-bg.jpg",
    ],
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
    ["action", "Action"],
    ["adventure", "Adventure"],
    ["rpg", "RPG"],
    ["strategy", "Strategy"],
    ["simulation", "Simulation"],
    ["sports", "Sports"],
    ["puzzle", "Puzzle"],
    ["horror", "Horror"],
    ["platformer", "Platformer"],
    ["shooter", "Shooter"],
  ];
  for (const row of genreData) {
    genreStmt.run(...row);
  }

  query = `
    INSERT INTO company
      (Id, Name)
    VALUES
      (?, ?);
  `;
  const companyStmt = db.prepare(query);
  const companyData = [
    ["dev-nintendo", "Nintendo"],
    ["dev-valve", "Valve"],
    ["dev-sony", "Sony Interactive Entertainment"],
    ["dev-microsoft", "Microsoft Studios"],
    ["dev-capcom", "Capcom"],
    ["dev-ubisoft", "Ubisoft"],
    ["dev-squareenix", "Square Enix"],
    ["dev-rockstar", "Rockstar Games"],
    ["dev-bethesda", "Bethesda Softworks"],
    ["dev-ea", "Electronic Arts"],
  ];
  for (const row of companyData) {
    companyStmt.run(...row);
  }

  query = `
    INSERT INTO playnite_game
      (Id, Name, Description, ReleaseDate, Playtime, LastActivity, Added, InstallDirectory, IsInstalled, BackgroundImage, CoverImage, Icon, ContentHash)
    VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
  `;
  const gameStmt = db.prepare(query);
  const gameData = [
    ...Array(200)
      .fill(null)
      .map((_, i) => {
        return [
          `game-${i}`,
          faker.lorem.words({ min: 2, max: 5 }), // Name
          faker.lorem.sentence(), // Description
          faker.date
            .between({ from: "2000-01-01", to: "2024-01-01" })
            .toISOString()
            .slice(0, 10), // ReleaseDate
          Number(faker.number.float({ min: 1, max: 500 })), // Playtime
          faker.date.recent({ days: 365 }).toISOString(), // LastActivity
          faker.date.past({ years: 10 }).toISOString(), // Added
          `/games/${faker.word
            .words({ count: 2 })
            .replace(/\s/g, "-")
            .toLowerCase()}`, // InstallDirectory
          faker.datatype.boolean() ? 1 : 0, // IsInstalled
          "placeholder\\background.png", // BackgroundImage
          "placeholder\\cover.png", // CoverImage
          "placeholder\\icon.png", // Icon
          faker.lorem.words({ min: 30, max: 30 }), // ContentHash
        ];
      }),
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
    ...gameData.map((data) => {
      return [
        data[0],
        platformData[Math.floor(Math.random() * platformData.length)][0],
      ];
    }),
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
    ...gameData.map((data) => {
      return [
        data[0],
        genreData[Math.floor(Math.random() * genreData.length)][0],
      ];
    }),
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
    ...gameData.map((data) => {
      return [
        data[0],
        companyData[Math.floor(Math.random() * companyData.length)][0],
      ];
    }),
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
    ...gameData.map((data) => {
      return [
        data[0],
        companyData[Math.floor(Math.random() * companyData.length)][0],
      ];
    }),
  ];
  for (const row of gamePublisherData) {
    gamePublisherStmt.run(...row);
  }

  logService.info("Database seed data loaded");
};
