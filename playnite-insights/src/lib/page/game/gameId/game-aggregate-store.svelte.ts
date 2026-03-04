import type { ClientApiGetter } from "$lib/modules/bootstrap/application";
import type { GameId } from "$lib/modules/common/domain";
import {
	CompanyIdParser,
	CompletionStatusIdParser,
	type Company,
	type CompletionStatus,
	type Game,
	type GameClassification,
} from "$lib/modules/game-library/domain";
import type { ClassificationId } from "@playatlas/common/domain";
import { SvelteMap } from "svelte/reactivity";

type GameAggregateStoreDeps = {
	api: ClientApiGetter;
	getGameId: () => GameId;
};

export class GameAggregateStore {
	game: Game | null = $state(null);
	completionStatus: CompletionStatus | null = $state(null);
	developers: Company[] = $state([]);
	publishers: Company[] = $state([]);
	latestGameClassifications: SvelteMap<ClassificationId, GameClassification> = $state(
		new SvelteMap(),
	);

	constructor(private readonly deps: GameAggregateStoreDeps) {}

	private loadPublishersAsync = async () => {
		if (!this.game || this.game.Publishers.length === 0) return;

		const { companies } = await this.deps.api().GameLibrary.Query.GetCompaniesByIds.executeAsync({
			companyIds: this.game.Publishers.map(CompanyIdParser.fromTrusted),
		});
		this.publishers = companies;
	};

	private loadDevelopersAsync = async () => {
		if (!this.game || this.game.Developers.length === 0) return;

		const { companies } = await this.deps.api().GameLibrary.Query.GetCompaniesByIds.executeAsync({
			companyIds: this.game.Developers.map(CompanyIdParser.fromTrusted),
		});
		this.developers = companies;
	};

	private loadCompletionStatusAsync = async () => {
		if (!this.game || !this.game.Playnite?.CompletionStatusId) return;

		const { completionStatuses } = await this.deps
			.api()
			.GameLibrary.Query.GetCompletionStatusesByIds.executeAsync({
				completionStatusesIds: [
					CompletionStatusIdParser.fromTrusted(this.game.Playnite.CompletionStatusId),
				],
			});
		this.completionStatus = completionStatuses.at(0) ?? null;
	};

	private loadGameClassifications = async () => {
		if (!this.game) return;

		const { gameClassifications } = await this.deps
			.api()
			.GameLibrary.ScoringEngine.Query.GetLatestGameClassificationByGameId.executeAsync({
				gameId: this.game.Id,
			});

		if (!gameClassifications) return;

		const latestGameClassifications = new SvelteMap<ClassificationId, GameClassification>(
			gameClassifications,
		);

		this.latestGameClassifications = latestGameClassifications;
	};

	initAsync = async () => {
		const gameId = this.deps.getGameId();

		const { games } = await this.deps.api().GameLibrary.Query.GetGamesByIds.executeAsync({
			gameIds: [gameId],
		});

		this.game = games.at(0) ?? null;

		if (!this.game) return;

		await Promise.allSettled([
			this.loadCompletionStatusAsync(),
			this.loadDevelopersAsync(),
			this.loadPublishersAsync(),
			this.loadGameClassifications(),
		]);
	};
}
