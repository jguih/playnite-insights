BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS `game_session_new` (
  `SessionId` TEXT NOT NULL PRIMARY KEY,
  `GameId` TEXT,
  `GameName` TEXT,
  `StartTime` DATETIME NOT NULL,
  `EndTime` DATETIME,
  `Duration` REAL,
  `Status` TEXT NOT NULL,
  FOREIGN KEY (`GameId`) REFERENCES `playnite_game`(`Id`)
);

INSERT INTO `game_session_new` (`SessionId`, `GameId`, `GameName`, `StartTime`, `EndTime`, `Duration`, `Status`)
SELECT 
  gs.`SessionId`, 
  gs.`GameId`, 
  (SELECT `Name` FROM `playnite_game` WHERE `Id` = gs.`GameId`),
  gs.`StartTime`, 
  gs.`EndTime`, 
  gs.`Duration`, 
  'closed' 
FROM `game_session` gs;

DROP TABLE `game_session`;
ALTER TABLE `game_session_new` RENAME TO `game_session`;

COMMIT;