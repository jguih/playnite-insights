export type EntityMapper<E, M> = {
  toPersistence: (entity: E) => M;
  toDomain: (model: M) => E;
};
