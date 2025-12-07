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
  const companyList = factory.getCompanyFactory().buildList(200);
  const genreList = factory.getGenreFactory().buildList(200);
  const platformList = factory.getPlatformFactory().buildList(30);

  api.gameLibrary.getCompletionStatusRepository().upsert(completionStatusList);
  api.gameLibrary.getCompanyRepository().upsert(companyList);
  api.gameLibrary.getGenreRepository().upsert(genreList);
  api.gameLibrary.getPlatformRepository().upsert(platformList);

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
