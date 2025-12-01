import { bootstrap } from "@playatlas/bootstrap/application";
import { bootstrapTest } from "@playatlas/bootstrap/testing";
import { makeGameFactory } from "@playatlas/game-library/testing";

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

beforeEach(async () => {
  await resetDbToMemory();

  const completionStatusList = factory
    .getCompletionStatusFactory()
    .buildDefaultCompletionStatusList();
  const companyList = factory.getCompanyFactory().buildCompanyList(200);
  const genreList = factory.getGenreFactory().buildGenreList(200);
  const platformList = factory.getPlatformFactory().buildPlatformList(30);

  api.gameLibrary
    .getCompletionStatusRepository()
    .upsertMany(completionStatusList);
  api.gameLibrary.getCompanyRepository().upsertMany(companyList);
  api.gameLibrary.getGenreRepository().upsertMany(genreList);
  api.gameLibrary.getPlatformRepository().upsertMany(platformList);

  const completionStatusOptions = completionStatusList.map((c) => c.getId());
  const companyOptions = companyList.map((c) => c.getId());
  const genreOptions = genreList.map((g) => g.getId());
  const platformOptions = platformList.map((p) => p.getId());

  factory.setGameFactory(
    makeGameFactory({
      companyOptions,
      completionStatusOptions,
      genreOptions,
      platformOptions,
    })
  );
});
