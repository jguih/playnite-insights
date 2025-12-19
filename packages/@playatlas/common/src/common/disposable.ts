export type DisposableAsync = {
  dispose: () => Promise<void>;
};

export type Disposable = {
  dispose: () => void;
};
