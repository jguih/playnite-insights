import {
  type GameId,
  type GameRelationship,
  type GameRelationshipMap,
} from "../domain/game.entity";

export type GetRelationshipsForFn = {
  <R extends GameRelationship>(props: {
    relationship: R;
    gameIds: GameId[];
  }): Map<GameId, GameRelationshipMap[R][]>;
};

export type UpdateRelationshipsForFn = {
  <R extends GameRelationship>(props: {
    relationship: R;
    gameId: GameId;
    newRelationshipIds: GameRelationshipMap[R][];
  }): void;
};
