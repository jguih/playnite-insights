BEGIN TRANSACTION;

CREATE TABLE `playnite_library_sync_new` (
  Id INTEGER NOT NULL PRIMARY KEY,
  Timestamp DATETIME NOT NULL,
  TotalPlaytimeSeconds REAL NOT NULL,
  TotalGames INTEGER NOT NULL
);

INSERT INTO `playnite_library_sync_new` (`Id`, `Timestamp`, `TotalPlaytimeSeconds`, `TotalGames`)
SELECT `Id`, `Timestamp`, `TotalPlaytimeHours` * 3600, `TotalGames` FROM `playnite_library_sync`;

DROP TABLE `playnite_library_sync`;

ALTER TABLE `playnite_library_sync_new` RENAME TO `playnite_library_sync`;

COMMIT;
