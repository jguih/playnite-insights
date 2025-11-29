import { DatabaseSync } from "node:sqlite";
import type { LogService } from "../application/log-service.port";

export type BaseRepositoryDeps = {
  logService: LogService;
  getDb: () => DatabaseSync;
};

export type MakeRepositoryBaseDeps = {
  logService: LogService;
  getDb: () => DatabaseSync;
};
