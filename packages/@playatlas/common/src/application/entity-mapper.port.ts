export type EntityMapper<TEntity, TModel> = {
  toPersistence: (entity: TEntity) => TModel;
  toDomain: (model: TModel) => TEntity;
};
