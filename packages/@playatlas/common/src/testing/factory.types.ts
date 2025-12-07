export type TestEntityFactory<TMakeEntityProps, TEntity> = {
  build: (props?: Partial<TMakeEntityProps>) => TEntity;
  buildList: (n: number, props?: Partial<TMakeEntityProps>) => TEntity[];
};
