import { faker } from "@faker-js/faker";
import { MakeGameProps } from "../domain";
import { CompletionStatus } from "../domain/completion-status.entity";
import { Game, makeGame } from "../domain/game.entity";

export type GameFactoryDeps = {
  completionStatusOptions: CompletionStatus[];
};

export type GameFactory = {
  buildGame: (props?: Partial<MakeGameProps>) => Game;
  buildGameList: (n: number, props?: Partial<MakeGameProps>) => Game[];
};

export const makeGameFactory = ({
  completionStatusOptions,
}: GameFactoryDeps): GameFactory => {
  const completionStatusIds = completionStatusOptions.map((c) => c.getId());

  const buildGame = (props: Partial<MakeGameProps> = {}): Game => {
    return makeGame({
      id: props?.id ?? faker.string.uuid(),
      name: props?.name ?? faker.commerce.productName(),
      description: props?.description ?? faker.lorem.sentence(),
      releaseDate: props?.releaseDate ?? faker.date.past(),
      playtime: props?.playtime ?? faker.number.int({ min: 0, max: 500 }),
      lastActivity: props?.lastActivity ?? faker.date.recent(),
      added: props?.added ?? faker.date.past(),
      installDirectory: props?.installDirectory ?? faker.system.directoryPath(),
      isInstalled: props.isInstalled ?? faker.datatype.boolean(),
      backgroundImage: props?.backgroundImage ?? faker.image.url(),
      coverImage: props?.coverImage ?? faker.image.url(),
      icon: props?.icon ?? faker.image.url(),
      contentHash:
        props?.contentHash ?? faker.string.hexadecimal({ length: 32 }),
      hidden: props?.hidden ?? faker.datatype.boolean(),
      completionStatusId: props?.completionStatusId
        ? props?.completionStatusId
        : completionStatusIds.length > 0
        ? faker.helpers.arrayElement(completionStatusIds)
        : null,
      developerIds: props.developerIds ?? null,
    });
  };

  const buildGameList = (
    n: number,
    props: Partial<MakeGameProps> = {}
  ): Game[] => {
    return Array.from({ length: n }, () => buildGame(props));
  };

  return Object.freeze({
    buildGame,
    buildGameList,
  });
};
