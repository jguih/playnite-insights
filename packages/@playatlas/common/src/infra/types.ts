import { DatabaseSync } from "node:sqlite";
import type { LogService } from "../domain/log-service.types";

export type BaseRepositoryDeps = {
  getDb: () => DatabaseSync;
  logService: LogService;
};
