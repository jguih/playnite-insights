import { faker } from "@faker-js/faker";
import { TestEntityFactory } from "@playatlas/common/testing";
import { makePlatform, Platform } from "../domain/platform.entity";
import { MakePlatformProps } from "../domain/platform.entity.types";

export type PlatformFactory = TestEntityFactory<MakePlatformProps, Platform>;

export const makePlatformFactory = (): PlatformFactory => {
  const propOrDefault = <T, V>(prop: T | undefined, value: V) => {
    if (prop === undefined) return value;
    return prop;
  };

  const build: PlatformFactory["build"] = (props = {}) => {
    return makePlatform({
      id: propOrDefault(props.id, faker.string.uuid()),
      name: propOrDefault(props.name, faker.lorem.words({ min: 1, max: 4 })),
      specificationId: propOrDefault(
        props.specificationId,
        faker.string.uuid()
      ),
      background: propOrDefault(props.background, faker.internet.url()),
      cover: propOrDefault(props.cover, faker.internet.url()),
      icon: propOrDefault(props.icon, faker.internet.url()),
    });
  };

  const buildList: PlatformFactory["buildList"] = (n, props = {}) => {
    return Array.from({ length: n }, () => build(props));
  };

  return { build, buildList };
};
