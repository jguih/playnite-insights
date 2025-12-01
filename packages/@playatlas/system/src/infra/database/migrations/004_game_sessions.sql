BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS `game_session` (
  `SessionId` TEXT NOT NULL PRIMARY KEY,
  `GameId` TEXT NOT NULL,
  `StartTime` DATETIME NOT NULL,
  `EndTime` DATETIME,
  `Duration` REAL,
  FOREIGN KEY (`GameId`) REFERENCES `playnite_game`(`Id`)
);

COMMIT;