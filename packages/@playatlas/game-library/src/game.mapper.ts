import { FullGame, Game } from "./domain/game.entity";
import { FullGameModel, GameModel, GROUPADD_SEPARATOR } from "./infra";

export const gameMapper = {
  toPersistence: (game: Game): GameModel => {},
  toDomain: (game: GameModel): Game => {},
};

export const fullGameMapper = {
  toPersistence: (game: FullGame): FullGameModel => {},
  toDomain: (game: FullGameModel): FullGame => {
    const developers = game.Developers
      ? game.Developers.split(GROUPADD_SEPARATOR)
      : [];
    const publishers = game.Publishers
      ? game.Publishers.split(GROUPADD_SEPARATOR)
      : [];
    const platforms = game.Platforms
      ? game.Platforms.split(GROUPADD_SEPARATOR)
      : [];
    const genres = game.Genres ? game.Genres.split(GROUPADD_SEPARATOR) : [];
  },
};
