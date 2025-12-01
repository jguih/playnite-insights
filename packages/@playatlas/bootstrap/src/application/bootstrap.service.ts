import { makeLogServiceFactory } from "@playatlas/system/application";
import { bootstrapConfig } from "./bootstrap.config";
import { bootstrapGameLibrary } from "./bootstrap.game-library";
import { bootstrapInfra } from "./bootstrap.infra";
import { BootstrapDeps, PlayAtlasApi } from "./bootstrap.service.types";

export const bootstrap = async ({
  env,
}: BootstrapDeps): Promise<PlayAtlasApi> => {
  const config = bootstrapConfig({ env });

  const logServiceFactory = makeLogServiceFactory({
    getCurrentLogLevel: () => config.getSystemConfig().getLogLevel(),
  });

  const infra = bootstrapInfra({
    logServiceFactory,
    envService: config.getEnvService(),
    systemConfig: config.getSystemConfig(),
  });
  await infra.initEnvironment();
  await infra.initDb();

  const gameLibrary = bootstrapGameLibrary({
    getDb: infra.getDb,
    logServiceFactory,
  });

  return { config, infra, gameLibrary };
};
