export type LogService = {
  error: (message: string, error?: unknown) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
  success: (message: string) => void;
  debug: (message: string) => void;
};
