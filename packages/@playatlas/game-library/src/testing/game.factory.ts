import { faker } from "@faker-js/faker";
import { TestEntityFactory } from "@playatlas/common/testing";
import { type CompanyId } from "../domain/company.entity";
import { type CompletionStatusId } from "../domain/completion-status.entity";
import { makeGame, type Game } from "../domain/game.entity";
import { type MakeGameProps } from "../domain/game.entity.types";
import { type GenreId } from "../domain/genre.entity";
import { type PlatformId } from "../domain/platform.entity";
import { GameResponseDto } from "../dtos";
import { gameMapper } from "../game.mapper";

export type GameFactoryDeps = {
  completionStatusOptions: CompletionStatusId[];
  companyOptions: CompanyId[];
  genreOptions: GenreId[];
  platformOptions: PlatformId[];
};

export type GameFactory = TestEntityFactory<MakeGameProps, Game> & {
  buildDto: (props?: Partial<MakeGameProps>) => GameResponseDto;
  buildDtoList: (
    n: number,
    props?: Partial<MakeGameProps>
  ) => GameResponseDto[];
};

export const makeGameFactory = ({
  completionStatusOptions,
  companyOptions,
  genreOptions,
  platformOptions,
}: GameFactoryDeps): GameFactory => {
  const propOrDefault = <T, V>(prop: T | undefined, value: V) => {
    if (prop === undefined) return value;
    return prop;
  };

  const build = (props: Partial<MakeGameProps> = {}): Game => {
    const completionStatusId = propOrDefault(
      props.completionStatusId,
      faker.helpers.arrayElement(completionStatusOptions)
    );
    const developerIds = propOrDefault(
      props.developerIds,
      faker.helpers.arrayElements(companyOptions, { min: 1, max: 3 })
    );
    const publisherIds = propOrDefault(
      props.publisherIds,
      faker.helpers.arrayElements(companyOptions, { min: 1, max: 3 })
    );
    const genreIds = propOrDefault(
      props.genreIds,
      faker.helpers.arrayElements(genreOptions, { min: 1, max: 15 })
    );
    const platformIds = propOrDefault(
      props.platformIds,
      faker.helpers.arrayElements(platformOptions, { min: 1, max: 5 })
    );

    return makeGame({
      id: props.id ?? faker.string.uuid(),
      name: propOrDefault(props.name, faker.commerce.productName()),
      description: propOrDefault(props.description, faker.lorem.sentence()),
      releaseDate: propOrDefault(props.releaseDate, faker.date.past()),
      playtime: propOrDefault(
        props.playtime,
        faker.number.int({ min: 0, max: 500 })
      ),
      lastActivity: propOrDefault(props.lastActivity, faker.date.recent()),
      added: propOrDefault(props.added, faker.date.past()),
      installDirectory: propOrDefault(
        props.installDirectory,
        faker.system.directoryPath()
      ),
      isInstalled: propOrDefault(props.isInstalled, faker.datatype.boolean()),
      backgroundImage: propOrDefault(props.backgroundImage, faker.image.url()),
      coverImage: propOrDefault(props.coverImage, faker.image.url()),
      icon: propOrDefault(props.icon, faker.image.url()),
      contentHash: propOrDefault(
        props.contentHash,
        faker.string.hexadecimal({ length: 32 })
      ),
      hidden: propOrDefault(props.hidden, faker.datatype.boolean()),
      completionStatusId,
      developerIds,
      genreIds,
      platformIds,
      publisherIds,
    });
  };

  const buildList = (n: number, props: Partial<MakeGameProps> = {}): Game[] => {
    return Array.from({ length: n }, () => build(props));
  };

  const buildDto: GameFactory["buildDto"] = (props) => {
    return gameMapper.toDto(build(props));
  };

  const buildDtoList: GameFactory["buildDtoList"] = (n, props) => {
    return Array.from({ length: n }, () => gameMapper.toDto(build(props)));
  };

  return Object.freeze({
    build,
    buildList,
    buildDto,
    buildDtoList,
  });
};
