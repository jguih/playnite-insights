import { faker } from "@faker-js/faker";
import { type CompanyId } from "../domain/company.entity";
import { type CompletionStatusId } from "../domain/completion-status.entity";
import { makeGame, type Game } from "../domain/game.entity";
import { type MakeGameProps } from "../domain/game.entity.types";
import { type GenreId } from "../domain/genre.entity";
import { type PlatformId } from "../domain/platform.entity";

export type GameFactoryDeps = {
  completionStatusOptions: CompletionStatusId[];
  companyOptions: CompanyId[];
  genreOptions: GenreId[];
  platformOptions: PlatformId[];
};

export type GameFactory = {
  buildGame: (props?: Partial<MakeGameProps>) => Game;
  buildGameList: (n: number, props?: Partial<MakeGameProps>) => Game[];
};

export const makeGameFactory = ({
  completionStatusOptions,
  companyOptions,
  genreOptions,
  platformOptions,
}: GameFactoryDeps): GameFactory => {
  const buildGame = (props: Partial<MakeGameProps> = {}): Game => {
    const completionStatusId = props?.completionStatusId
      ? props?.completionStatusId
      : completionStatusOptions.length > 0
      ? faker.helpers.arrayElement(completionStatusOptions)
      : null;
    const developerIds = props.developerIds
      ? props.developerIds
      : companyOptions.length > 0
      ? faker.helpers.arrayElements(companyOptions, { min: 1, max: 3 })
      : null;
    const publisherIds = props.publisherIds
      ? props.publisherIds
      : companyOptions.length > 0
      ? faker.helpers.arrayElements(companyOptions, { min: 1, max: 3 })
      : null;
    const genreIds = props.genreIds
      ? props.genreIds
      : genreOptions.length > 0
      ? faker.helpers.arrayElements(genreOptions, { min: 1, max: 15 })
      : null;
    const platformIds = props.platformIds
      ? props.platformIds
      : platformOptions.length > 0
      ? faker.helpers.arrayElements(platformOptions, { min: 1, max: 5 })
      : null;

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
      completionStatusId,
      developerIds,
      genreIds,
      platformIds,
      publisherIds,
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
