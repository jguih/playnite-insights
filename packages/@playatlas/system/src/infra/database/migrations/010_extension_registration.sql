BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS `extension_registration` (
  `Id` INTEGER PRIMARY KEY,
  `ExtensionId` TEXT UNIQUE NOT NULL,
  `PublicKey` TEXT NOT NULL,
  `Hostname` TEXT,
  `Os` TEXT,
  `ExtensionVersion` TEXT,
  `Status` TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'trusted', 'rejected'
  `CreatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `LastUpdatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP
);

COMMIT;