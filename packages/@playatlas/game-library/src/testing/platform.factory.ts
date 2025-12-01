import { faker } from "@faker-js/faker";
import { makePlatform, Platform } from "../domain/platform.entity";
import { MakePlatformProps } from "../domain/platform.entity.types";

export type PlatformFactory = {
  buildPlatform: (props?: Partial<MakePlatformProps>) => Platform;
  buildPlatformList: (
    n: number,
    props?: Partial<MakePlatformProps>
  ) => Platform[];
};

export const makePlatformFactory = (): PlatformFactory => {
  const buildPlatform: PlatformFactory["buildPlatform"] = (props = {}) => {
    return makePlatform({
      id: props.id ?? faker.string.uuid(),
      name: props.name ?? faker.lorem.words({ min: 1, max: 4 }),
      specificationId: props.specificationId ?? faker.string.uuid(),
      background: props.background ?? faker.internet.url(),
      cover: props.cover ?? faker.internet.url(),
      icon: props.icon ?? faker.internet.url(),
    });
  };

  const buildPlatformList: PlatformFactory["buildPlatformList"] = (
    n,
    props = {}
  ) => {
    return Array.from({ length: n }, () => buildPlatform(props));
  };

  return { buildPlatform, buildPlatformList };
};
