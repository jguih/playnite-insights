export type CommandHandler<TCommand, TResult> = {
  execute: (command: TCommand) => TResult;
};

export type AsyncCommandHandler<TCommand, TResult> = {
  executeAsync: (command: TCommand) => Promise<TResult>;
};
