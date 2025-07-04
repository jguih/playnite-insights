CREATE TABLE IF NOT EXISTS `playnite_library_sync` (
  `id` INTEGER NOT NULL PRIMARY KEY, 
  `timestamp` DATETIME NOT NULL,
  `totalPlaytimeHours` REAL NOT NULL,
  `totalGames` INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS `platform` (
  `Id` TEXT NOT NULL PRIMARY KEY,
  `Name` TEXT NOT NULL,
  `SpecificationId` TEXT NOT NULL,
  `Icon` TEXT,
  `Cover` TEXT,
  `Background` TEXT
);

CREATE TABLE IF NOT EXISTS `genre` (
  `Id` TEXT NOT NULL PRIMARY KEY,
  `Name` TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS `developer` (
  `Id` TEXT NOT NULL PRIMARY KEY,
  `Name` TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS `publisher` (
  `Id` TEXT NOT NULL PRIMARY KEY,
  `Name` TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS `playnite_game` (
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
  `ContentHash` TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS `playnite_game_platform` (
  `GameId` TEXT NOT NULL,
  `PlatformId` TEXT NOT NULL,
  PRIMARY KEY (`GameId`, `PlatformId`),
  FOREIGN KEY (`GameId`) REFERENCES `playnite_game`(`Id`),
  FOREIGN KEY (`PlatformId`) REFERENCES `platform`(`Id`)
);

CREATE TABLE IF NOT EXISTS `playnite_game_genre` (
  `GameId` TEXT NOT NULL,
  `GenreId` TEXT NOT NULL,
  PRIMARY KEY (`GameId`, `GenreId`),
  FOREIGN KEY (`GameId`) REFERENCES `playnite_game`(`Id`),
  FOREIGN KEY (`GenreId`) REFERENCES `genre`(`Id`)
);

CREATE TABLE IF NOT EXISTS `playnite_game_developer` (
  `GameId` TEXT NOT NULL,
  `DeveloperId` TEXT NOT NULL,
  PRIMARY KEY (`GameId`, `DeveloperId`),
  FOREIGN KEY (`GameId`) REFERENCES `playnite_game`(`Id`),
  FOREIGN KEY (`DeveloperId`) REFERENCES `developer`(`Id`)
);

CREATE TABLE IF NOT EXISTS `playnite_game_publisher` (
  `GameId` TEXT NOT NULL,
  `PublisherId` TEXT NOT NULL,
  PRIMARY KEY (`GameId`, `PublisherId`),
  FOREIGN KEY (`GameId`) REFERENCES `playnite_game`(`Id`),
  FOREIGN KEY (`PublisherId`) REFERENCES `publisher`(`Id`)
);