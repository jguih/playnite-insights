import type { ClientApiGetter } from "$lib/modules/bootstrap/application";
import type { HomePageGameReadModel } from "./home-page-game-model";
import type { HomePageSection } from "./home-page-section-key";

export type HomePageStoreDeps = {
	api: ClientApiGetter;
};

type HomePageStoreState = Record<
	HomePageSection,
	{ loading: boolean; items: HomePageGameReadModel[] }
>;

export class HomePageStore {
	storeSignal: HomePageStoreState = $state({ hero: { loading: false, items: [] } });

	constructor(private readonly deps: HomePageStoreDeps) {}

	private withLoading = async (
		section: keyof HomePageStoreState,
		fn: () => Promise<void>,
	): Promise<void> => {
		if (this.storeSignal[section].loading) return;

		this.storeSignal[section].loading = true;
		try {
			return await fn();
		} finally {
			this.storeSignal[section].loading = false;
		}
	};

	private loadHeroItemsAsync = async () => {
		return this.withLoading("hero", async () => {
			const { games } = await this.deps
				.api()
				.GameLibrary.Query.GetGamesRanked.executeAsync({ limit: 6 });

			const homePageModels: HomePageGameReadModel[] = games.map((game) => ({
				Id: game.Id,
				Name: game.Playnite?.Name ?? "Unknown",
				CoverImageFilePath: game.Playnite?.CoverImagePath,
				Similarity: game.Similarity,
			}));

			this.storeSignal.hero.items = homePageModels;
		});
	};

	loadGamesAsync = async () => {
		await this.loadHeroItemsAsync();
	};
}
