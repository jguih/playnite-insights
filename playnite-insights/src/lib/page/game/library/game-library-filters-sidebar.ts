import { pushState } from "$app/navigation";
import { page } from "$app/state";

export class GameLibraryFiltersSidebar {
	open = () => {
		pushState("", {
			showGameLibraryFiltersSidebar: true,
		});
	};

	close = () => {
		history.back();
	};

	get shouldOpen() {
		return page.state.showGameLibraryFiltersSidebar;
	}
}
