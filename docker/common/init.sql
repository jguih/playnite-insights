CREATE TABLE IF NOT EXISTS `playnite_library_sync` (
  `id` INTEGER NOT NULL PRIMARY KEY, 
  `timestamp` DATETIME NOT NULL,
  `totalPlaytimeHours` REAL NOT NULL,
  `totalGames` INTEGER NOT NULL
)