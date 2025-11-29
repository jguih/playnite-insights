import { bootstrap } from "@playatlas/bootstrap/application";
import { bootstrapTest } from "@playatlas/bootstrap/testing";
import { makeGameFactory } from "@playatlas/game-library/testing";

const appApi = await bootstrap();
export const { api, factory, resetDbToMemory } = bootstrapTest({
  api: appApi,
});

beforeEach(async () => {
  await resetDbToMemory();

  const completionStatusList = factory
    .getCompletionStatusFactory()
    .buildDefaultCompletionStatusList();
  const companyList = factory.getCompanyFactory().buildCompanyList(200);
  const genreList = factory.getGenreFactory().buildGenreList(200);

  api.gameLibrary
    .getCompletionStatusRepository()
    .upsertMany(completionStatusList);
  api.gameLibrary.getCompanyRepository().upsertMany(companyList);
  api.gameLibrary.getGenreRepository().upsertMany(genreList);

  const completionStatusOptions = completionStatusList.map((c) => c.getId());
  const companyOptions = companyList.map((c) => c.getId());
  const genreOptions = genreList.map((g) => g.getId());

  factory.setGameFactory(
    makeGameFactory({ companyOptions, completionStatusOptions, genreOptions })
  );
});
