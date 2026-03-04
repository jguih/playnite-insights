import type { SyncTarget } from "$lib/modules/common/domain";
import { m } from "$lib/paraglide/messages";

export class SyncProgressViewModel {
	constructor() {}

	static getSyncProgressLabel = (activeFlow: SyncTarget | null) => {
		switch (activeFlow) {
			case "games":
				return m["progress.syncing_games"]();
			case "completionStatuses":
				return m["progress.syncing_completion_statuses"]();
			case "companies":
				return m["progress.syncing_companies"]();
			case "genres":
				return m["progress.syncing_genres"]();
			case "gameSessions":
				return m["progress.syncing_game_sessions"]();
			case "gameClassifications":
				return m["progress.syncing_game_classifications"]();
			case "platforms":
				return m["progress.syncing_platforms"]();
			default:
				return m["progress.syncing_library"]();
		}
	};
}
