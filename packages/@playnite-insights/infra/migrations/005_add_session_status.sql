BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS `game_session_new` (
  `SessionId` TEXT NOT NULL PRIMARY KEY,
  `GameId` TEXT,
  `StartTime` DATETIME NOT NULL,
  `EndTime` DATETIME,
  `Duration` REAL,
  `Status` TEXT NOT NULL,
  FOREIGN KEY (`GameId`) REFERENCES `playnite_game`(`Id`)
);

INSERT INTO `game_session_new` (`SessionId`, `GameId`, `StartTime`, `EndTime`, `Duration`, `Status`)
SELECT `SessionId`, `GameId`, `StartTime`, `EndTime`, `Duration`, 'closed' FROM `game_session`;

DROP TABLE `game_session`;
ALTER TABLE `game_session_new` RENAME TO `game_session`;

COMMIT;