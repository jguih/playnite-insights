import { GameRelationship } from "../domain/game.entity";

export const TABLE_NAME = "playnite_game" as const;

export const RELATIONSHIP_TABLE_NAME = {
  gameDeveloper: "playnite_game_developer",
  gamePublisher: "playnite_game_publisher",
  gameGenre: "playnite_game_genre",
  gamePlatform: "playnite_game_platform",
} as const;

export const REL_META = {
  developers: {
    table: RELATIONSHIP_TABLE_NAME.gameDeveloper,
    column: "DeveloperId",
  },
  publishers: {
    table: RELATIONSHIP_TABLE_NAME.gamePublisher,
    column: "PublisherId",
  },
  genres: {
    table: RELATIONSHIP_TABLE_NAME.gameGenre,
    column: "GenreId",
  },
  platforms: {
    table: RELATIONSHIP_TABLE_NAME.gamePlatform,
    column: "PlatformId",
  },
} satisfies Record<GameRelationship, { table: string; column: string }>;
