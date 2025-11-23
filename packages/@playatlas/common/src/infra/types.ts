import { DatabaseSync } from "node:sqlite";
import type { LogService } from "../domain/log-service.types";

export type BaseRepositoryDeps = {
  logService: LogService;
  getDb: () => DatabaseSync;
};

export type MakeRepositoryBaseDeps = {
  logService: LogService;
  getDb: () => DatabaseSync;
};
