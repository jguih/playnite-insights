BEGIN TRANSACTION;

PRAGMA foreign_keys = ON;
PRAGMA foreign_keys;

CREATE TABLE IF NOT EXISTS `company` (
  `Id` TEXT NOT NULL PRIMARY KEY,
  `Name` TEXT NOT NULL
);

INSERT OR IGNORE INTO `company` (`Id`, `Name`) SELECT `Id`, `Name` FROM `developer`;
INSERT OR IGNORE INTO `company` (`Id`, `Name`) SELECT `Id`, `Name` FROM `publisher`;

CREATE TABLE IF NOT EXISTS `playnite_game_developer_new` (
  `GameId` TEXT NOT NULL,
  `DeveloperId` TEXT NOT NULL,
  PRIMARY KEY (`GameId`, `DeveloperId`),
  FOREIGN KEY (`GameId`) REFERENCES `playnite_game`(`Id`) ON DELETE CASCADE,
  FOREIGN KEY (`DeveloperId`) REFERENCES `company`(`Id`) ON DELETE CASCADE
);

INSERT INTO `playnite_game_developer_new` (`GameId`, `DeveloperId`)
SELECT DISTINCT `GameId`, `DeveloperId`
FROM `playnite_game_developer`
WHERE `DeveloperId` IN (SELECT `Id` FROM `company`)
  AND `GameId` IN (SELECT `Id` FROM `playnite_game`);

CREATE TABLE IF NOT EXISTS `playnite_game_publisher_new` (
  `GameId` TEXT NOT NULL,
  `PublisherId` TEXT NOT NULL,
  PRIMARY KEY (`GameId`, `PublisherId`),
  FOREIGN KEY (`GameId`) REFERENCES `playnite_game`(`Id`) ON DELETE CASCADE,
  FOREIGN KEY (`PublisherId`) REFERENCES `company`(`Id`) ON DELETE CASCADE
);

INSERT INTO `playnite_game_publisher_new` (`GameId`, `PublisherId`)
SELECT DISTINCT `GameId`, `PublisherId` 
FROM `playnite_game_publisher`
WHERE `PublisherId` IN (SELECT `Id` FROM `company`)
  AND `GameId` IN (SELECT `Id` FROM `playnite_game`);

DROP TABLE `playnite_game_developer`;
DROP TABLE `playnite_game_publisher`;
DROP TABLE `developer`;
DROP TABLE `publisher`;

ALTER TABLE `playnite_game_developer_new` RENAME TO `playnite_game_developer`;
ALTER TABLE `playnite_game_publisher_new` RENAME TO `playnite_game_publisher`;

UPDATE `playnite_game`
SET `ContentHash` = 'INVALIDATED';

COMMIT;