import { faker } from "@faker-js/faker";
import { TestEntityFactory } from "@playatlas/common/testing";
import { makePlatform, Platform } from "../domain/platform.entity";
import { MakePlatformProps } from "../domain/platform.entity.types";

export type PlatformFactory = TestEntityFactory<MakePlatformProps, Platform>;

export const makePlatformFactory = (): PlatformFactory => {
  const build: PlatformFactory["build"] = (props = {}) => {
    return makePlatform({
      id: props.id ?? faker.string.uuid(),
      name: props.name ?? faker.lorem.words({ min: 1, max: 4 }),
      specificationId: props.specificationId ?? faker.string.uuid(),
      background: props.background ?? faker.internet.url(),
      cover: props.cover ?? faker.internet.url(),
      icon: props.icon ?? faker.internet.url(),
    });
  };

  const buildList: PlatformFactory["buildList"] = (n, props = {}) => {
    return Array.from({ length: n }, () => build(props));
  };

  return { build, buildList };
};
