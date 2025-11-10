import { DatabaseSync } from "node:sqlite";
import type { LogService } from "./log-service";

export type BaseRepositoryDeps = {
  getDb: () => DatabaseSync;
  logService: LogService;
};
