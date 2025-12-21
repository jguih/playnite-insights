import { bootstrap } from "@playatlas/bootstrap/application";
import { bootstrapTest } from "@playatlas/bootstrap/testing";
import { join } from "path";

export const { api, factory, resetDbToMemory } = bootstrapTest({
  api: await bootstrap({
    env: {
      PLAYATLAS_LOG_LEVEL: process.env.PLAYATLAS_LOG_LEVEL,
      PLAYATLAS_MIGRATIONS_DIR: process.env.PLAYATLAS_MIGRATIONS_DIR,
      PLAYATLAS_USE_IN_MEMORY_DB: process.env.PLAYATLAS_USE_IN_MEMORY_DB,
      PLAYATLAS_WORK_DIR: process.env.PLAYATLAS_WORK_DIR,
    },
  }),
});

export const fixturesDirPath = join(import.meta.dirname, "/fixtures");

export default function teardown() {
  return async () => {
    const workDir = api.config.getEnvService().getWorkDir();
    api
      .getLogService()
      .warning(`Deleting integration test work dir at ${workDir}`);
    await api.infra
      .getFsService()
      .rm(workDir, { force: true, recursive: true });
  };
}
