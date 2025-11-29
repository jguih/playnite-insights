import { bootstrapGameLibrary } from "./bootstrap.game-library";
import { bootstrapInfra } from "./bootstrap.infra";
import { PlayAtlasApi } from "./bootstrap.service.types";

export const bootstrap = async (): Promise<PlayAtlasApi> => {
  const infra = bootstrapInfra();
  await infra.initDb();
  const gameLibrary = bootstrapGameLibrary({ getDb: infra.getDb });
  return { infra, gameLibrary };
};
