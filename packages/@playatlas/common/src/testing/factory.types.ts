export type TestEntityFactory<P, E> = {
  build: (props?: Partial<P>) => E;
  buildList: (n: number, props?: Partial<P>) => E[];
};
