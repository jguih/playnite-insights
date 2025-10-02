BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS `image` (
  `Id` INTEGER PRIMARY KEY,
  `FileExtension` TEXT NOT NULL,
  `FilePath` TEXT NOT NULL,
  `FileName` TEXT NOT NULL,
  `FileSize` REAL NOT NULL,
  `CreatedAt` DATETIME NOT NULL,
  `DeletedAt` DATETIME,
  `CheckSum` TEXT UNIQUE NOT NULL,
  `MimeType` TEXT,
  `Source` TEXT NOT NULL,
  `Width` INTEGER,
  `Height` INTEGER
);

COMMIT;