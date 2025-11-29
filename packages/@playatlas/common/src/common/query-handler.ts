export type QueryHandler<P, R> = {
  execute: (props: P) => R;
};
