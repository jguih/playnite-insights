BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS `game_note` (
  `Id` TEXT NOT NULL PRIMARY KEY,
  `Title` TEXT,
  `Content` TEXT,
  `ImagePath` TEXT,
  `GameId` TEXT,
  `SessionId` TEXT,
  `DeletedAt` DATETIME,
  `CreatedAt` DATETIME,
  `LastUpdatedAt` DATETIME
);

COMMIT;