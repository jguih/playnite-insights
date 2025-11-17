import { faker } from "@faker-js/faker";
import { MakeFullGameProps, MakeGameProps } from "../domain";
import { FullGame, Game, makeFullGame, makeGame } from "../domain/game.entity";

export const makeGameFactory = () => {
  const buildFullGame = (props: Partial<MakeFullGameProps> = {}): FullGame => {
    return makeFullGame({
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
      developers:
        props?.developers ??
        Array.from({ length: 5 }, () => faker.company.name()),
      publishers:
        props?.publishers ??
        Array.from({ length: 5 }, () => faker.company.name()),
      genres: props?.genres ?? [
        ...faker.helpers.arrayElements([
          "Action",
          "RPG",
          "Strategy",
          "Adventure",
        ]),
      ],
      platforms: props?.platforms ?? [
        faker.helpers.arrayElement(["PC", "Linux", "Xbox", "PS"]),
      ],
      hidden: props?.hidden ?? faker.datatype.boolean(),
      completionStatusId: props?.completionStatusId ?? null,
    });
  };

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
      completionStatusId: props?.completionStatusId ?? null,
    });
  };

  const buildGameList = (
    n: number,
    props: Partial<MakeGameProps> = {}
  ): Game[] => {
    return Array.from({ length: n }, () => buildGame(props));
  };

  return Object.freeze({
    buildFullGame,
    buildGame,
    buildGameList,
  });
};
