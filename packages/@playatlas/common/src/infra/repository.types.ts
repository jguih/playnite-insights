export type BaseEntityRepository<EntityId, Entity> = {
  add: (entity: Entity | Entity[]) => void;
  update: (entity: Entity) => void;
  getById: (id: EntityId) => Entity | null;
  remove: (id: EntityId) => void;
  all: () => Entity[];
  exists: (id: EntityId) => boolean;
  upsert: (entity: Entity | Entity[]) => void;
};
