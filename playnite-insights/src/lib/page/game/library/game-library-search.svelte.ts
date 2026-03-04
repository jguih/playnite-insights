import { pushState } from "$app/navigation";
import { page } from "$app/state";

export class GameLibrarySearch {
	searchSignal: string | undefined = $state();

	open = () => {
		pushState("", {
			showGameLibrarySearchDrawer: true,
		});
	};

	close = () => {
		history.back();
	};

	get shouldOpen() {
		return page.state.showGameLibrarySearchDrawer;
	}

	getSignalSnapshot = (): string | undefined => {
		return $state.snapshot(this.searchSignal);
	};
}
