import { DatabaseSync } from "node:sqlite";
import type { LogService } from "./service/log";

export type BaseRepositoryDeps = {
  getDb: () => DatabaseSync;
  logService: LogService;
};
