import { makeLogServiceFactory } from "@playatlas/system/application";
import { makeFileSystemService } from "@playatlas/system/infra";
import { bootstrapConfig } from "./bootstrap.config";
import { bootstrapGameLibrary } from "./bootstrap.game-library";
import { bootstrapInfra } from "./bootstrap.infra";
import { BootstrapDeps, PlayAtlasApi } from "./bootstrap.service.types";

export const bootstrap = async ({
  env,
}: BootstrapDeps): Promise<PlayAtlasApi> => {
  const _fsService = makeFileSystemService();

  const config = bootstrapConfig({
    fsService: _fsService,
    env,
  });

  const logServiceFactory = makeLogServiceFactory({
    getCurrentLogLevel: () => config.getEnvService().getLogLevel(),
  });

  const infra = bootstrapInfra({
    logServiceFactory,
    fsService: _fsService,
    envService: config.getEnvService(),
    systemConfig: config.getSystemConfig(),
  });
  await infra.initDb();

  const gameLibrary = bootstrapGameLibrary({
    getDb: infra.getDb,
    logServiceFactory,
  });

  return { config, infra, gameLibrary };
};
