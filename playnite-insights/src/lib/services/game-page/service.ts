import type { PlayniteGameRepository } from '../playnite-game';
import type { GamePageData } from './schemas';

type GamePageServiceDeps = {
	playniteGameRepository: PlayniteGameRepository;
};

export type GamePageService = {
	getData: (id: string) => GamePageData;
};

export const makeGamePageService = ({
	playniteGameRepository
}: GamePageServiceDeps): GamePageService => {
	const getData = (id: string) => {
		const game = playniteGameRepository.getById(id);
		if (game) {
			const Developers =
				playniteGameRepository.getDevelopers({ Id: game.Id, Name: game.Name }) ?? [];
			return { game: { ...game, Developers } };
		}
		return;
	};

	return { getData };
};
