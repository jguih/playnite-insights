import { makeConsoleLogService } from "@playatlas/system/application";
import { initDatabase } from "@playatlas/system/infra";
import { bootstrapGameLibrary } from "./bootstrap.game-library";
import { bootstrapInfra } from "./bootstrap.infra";
import { PlayAtlasApi } from "./bootstrap.service.types";

export const bootstrap = async (): Promise<PlayAtlasApi> => {
  const infra = bootstrapInfra();

  await initDatabase({
    db: infra.getDb(),
    fileSystemService: infra.getFsService(),
    logService: makeConsoleLogService("InitDatabase"),
    migrationsDir: infra.getSystemConfig().getMigrationsDir(),
  });

  const gameLibrary = bootstrapGameLibrary({ getDb: infra.getDb });

  return { infra, gameLibrary };
};
