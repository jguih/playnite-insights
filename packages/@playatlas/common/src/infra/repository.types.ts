export type EntityRepository<TEntityId, TEntity> = {
  add: (entity: TEntity | TEntity[]) => void;
  update: (entity: TEntity) => void;
  getById: (id: TEntityId) => TEntity | null;
  remove: (id: TEntityId) => void;
  all: () => TEntity[];
  exists: (id: TEntityId) => boolean;
  upsert: (entity: TEntity | TEntity[]) => void;
};
