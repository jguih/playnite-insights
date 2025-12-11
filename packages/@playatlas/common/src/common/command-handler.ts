export type CommandHandler<TCommand, TResult> = {
  execute: (command: TCommand) => TResult;
};
