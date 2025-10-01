BEGIN TRANSACTION;

ALTER TABLE `playnite_library_sync`
ADD COLUMN VisibleTotalPlaytimeSeconds REAL NOT NULL DEFAULT 0;
  
ALTER TABLE `playnite_library_sync`
ADD COLUMN VisibleTotalGames INTEGER NOT NULL DEFAULT 0;

ALTER TABLE `playnite_library_sync` RENAME TO `playnite_library_metrics`;

COMMIT;