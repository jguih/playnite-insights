import { DatabaseSync } from "node:sqlite";
import type { LogService } from "../application/log-service.port";

export type BaseRepositoryDeps = {
  logService: LogService;
  getDb: () => DatabaseSync;
};

export type BaseEntityRepository<EntityId, Entity> = {
  add: (entity: Entity | Entity[]) => void;
  update: (entity: Entity) => void;
  getById: (id: EntityId) => Entity | null;
  remove: (id: EntityId) => void;
  all: () => Entity[];
};
