import { makeLogServiceFactory } from "@playatlas/system/application";
import { bootstrapAuth } from "./bootstrap.auth";
import { bootstrapConfig } from "./bootstrap.config";
import { bootstrapGameLibrary } from "./bootstrap.game-library";
import { bootstrapInfra } from "./bootstrap.infra";
import { bootstrapPlayniteIntegration } from "./bootstrap.playnite-integration";
import { BootstrapDeps, PlayAtlasApi } from "./bootstrap.service.types";

export const bootstrap = async ({
  env,
}: BootstrapDeps): Promise<PlayAtlasApi> => {
  const config = bootstrapConfig({ env });

  const logServiceFactory = makeLogServiceFactory({
    getCurrentLogLevel: () => config.getSystemConfig().getLogLevel(),
  });
  const backendLogService = logServiceFactory.build("SvelteBackend");

  const infra = bootstrapInfra({
    logServiceFactory,
    envService: config.getEnvService(),
    systemConfig: config.getSystemConfig(),
  });

  backendLogService.info("Initializing environment");
  await infra.initEnvironment();
  backendLogService.info("Initializing database");
  await infra.initDb();

  const baseDeps = { getDb: infra.getDb, logServiceFactory };

  const gameLibrary = bootstrapGameLibrary({ ...baseDeps });

  const auth = bootstrapAuth({
    ...baseDeps,
    signatureService: infra.getSignatureService(),
  });

  const playniteIntegration = bootstrapPlayniteIntegration({
    ...baseDeps,
    fileSystemService: infra.getFsService(),
    systemConfig: config.getSystemConfig(),
    gameRepository: gameLibrary.getGameRepository(),
    companyRepository: gameLibrary.getCompanyRepository(),
    completionStatusRepository: gameLibrary.getCompletionStatusRepository(),
    genreRepository: gameLibrary.getGenreRepository(),
    platformRepository: gameLibrary.getPlatformRepository(),
  });

  return {
    config,
    infra,
    gameLibrary,
    auth,
    playniteIntegration,
    getLogService: () => backendLogService,
  };
};
