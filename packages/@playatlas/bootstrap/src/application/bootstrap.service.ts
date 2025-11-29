import { makeLogServiceFactory } from "@playatlas/system/application";
import { bootstrapGameLibrary } from "./bootstrap.game-library";
import { bootstrapInfra } from "./bootstrap.infra";
import { PlayAtlasApi } from "./bootstrap.service.types";

export const bootstrap = async (): Promise<PlayAtlasApi> => {
  const logServiceFactory = makeLogServiceFactory();

  const infra = bootstrapInfra({
    logServiceFactory,
  });
  await infra.initDb();

  const gameLibrary = bootstrapGameLibrary({
    getDb: infra.getDb,
    logServiceFactory,
  });

  return { infra, gameLibrary };
};
