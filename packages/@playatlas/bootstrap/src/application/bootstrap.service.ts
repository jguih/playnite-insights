import { makeLogServiceFactory } from "@playatlas/system/application";
import { bootstrapAuth } from "./bootstrap.auth";
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

  const baseDeps = { getDb: infra.getDb, logServiceFactory };

  const gameLibrary = bootstrapGameLibrary({ ...baseDeps });
  const auth = bootstrapAuth({ ...baseDeps });

  return { config, infra, gameLibrary, auth };
};
