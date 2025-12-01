export type EnvService = {
  getWorkDir: () => string;
  getMigrationsDir: () => string | null;
  getLogLevel: () => number | null;
  getUseInMemoryDb: () => boolean;
};
