import { bootstrapTestFactories } from '@playatlas/bootstrap/testing';
import { makeGameFactory } from '@playatlas/game-library/testing';

export const factory = bootstrapTestFactories();

beforeEach(async () => {
	const completionStatusList = factory
		.getCompletionStatusFactory()
		.buildDefaultCompletionStatusList();
	const companyList = factory.getCompanyFactory().buildList(200);
	const genreList = factory.getGenreFactory().buildList(200);
	const platformList = factory.getPlatformFactory().buildList(30);

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
		}),
	);
});
