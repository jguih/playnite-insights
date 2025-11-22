import { faker } from "@faker-js/faker";
import { type CompanyId } from "../domain/company.entity";
import { type CompletionStatus } from "../domain/completion-status.entity";
import { type Game, makeGame } from "../domain/game.entity";
import { type MakeGameProps } from "../domain/game.entity.types";

export type GameFactoryDeps = {
  completionStatusOptions: CompletionStatus[];
  companyOptions: CompanyId[];
};

export type GameFactory = {
  buildGame: (props?: Partial<MakeGameProps>) => Game;
  buildGameList: (n: number, props?: Partial<MakeGameProps>) => Game[];
};

export const makeGameFactory = ({
  completionStatusOptions,
  companyOptions,
}: GameFactoryDeps): GameFactory => {
  const completionStatusIds = completionStatusOptions.map((c) => c.getId());

  const buildGame = (props: Partial<MakeGameProps> = {}): Game => {
    const completionStatusId = props?.completionStatusId
      ? props?.completionStatusId
      : completionStatusIds.length > 0
      ? faker.helpers.arrayElement(completionStatusIds)
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
      genreIds: props.genreIds ?? null,
      platformIds: props.platformIds ?? null,
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
