PRAGMA foreign_keys = OFF;

BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS `completion_status` (
  `Id` TEXT PRIMARY KEY,
  `Name` TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS `playnite_game_new` (
  `Id` TEXT NOT NULL PRIMARY KEY,
  `Name` TEXT,
  `Description` TEXT,
  `ReleaseDate` DATETIME,
  `Playtime` REAL NOT NULL,
  `LastActivity` TEXT,
  `Added` DATETIME,
  `InstallDirectory` TEXT,
  `IsInstalled` BOOLEAN NOT NULL,
  `BackgroundImage` TEXT,
  `CoverImage` TEXT,
  `Icon` TEXT,
  `ContentHash` TEXT NOT NULL,
  `Hidden` BOOLEAN NOT NULL DEFAULT FALSE,
  `CompletionStatusId` TEXT,
  FOREIGN KEY (`CompletionStatusId`) REFERENCES `completion_status`(`Id`)
);

INSERT INTO `playnite_game_new` (
  `Id`,
  `Name`,
  `Description`,
  `ReleaseDate`,
  `Playtime`,
  `LastActivity`,
  `Added`,
  `InstallDirectory`,
  `IsInstalled`,
  `BackgroundImage`,
  `CoverImage`,
  `Icon`,
  `ContentHash`,
  `Hidden`,
  `CompletionStatusId`
) SELECT
  `Id`,
  `Name`,
  `Description`,
  `ReleaseDate`,
  `Playtime`,
  `LastActivity`,
  `Added`,
  `InstallDirectory`,
  `IsInstalled`,
  `BackgroundImage`,
  `CoverImage`,
  `Icon`,
  'INVALIDATED',
  0,
  NULL
FROM `playnite_game`;

DROP TABLE `playnite_game`;
ALTER TABLE `playnite_game_new` RENAME TO `playnite_game`;

COMMIT;

PRAGMA foreign_keys = ON;
PRAGMA foreign_key_check;