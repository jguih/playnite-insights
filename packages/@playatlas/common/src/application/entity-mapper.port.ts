export type EntityMapper<TEntity, TModel, TDto = never> = {
  toPersistence: (entity: TEntity) => TModel;
  toDomain: (model: TModel) => TEntity;
} & (TDto extends never
  ? {}
  : {
      toDto: (entity: TEntity) => TDto;
      toDtoList: (entity: TEntity[]) => TDto[];
    });
