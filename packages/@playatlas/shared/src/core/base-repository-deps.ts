import { DatabaseSync } from "node:sqlite";
import { LogService } from "./log-service";

export type BaseRepositoryDeps = {
  getDb: () => DatabaseSync;
  logService: LogService;
};
