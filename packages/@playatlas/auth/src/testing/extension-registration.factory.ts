import { faker } from "@faker-js/faker";
import { type TestEntityFactory } from "@playatlas/common/testing";
import { extensionRegistrationStatus } from "../domain/extension-registration.constants";
import {
  ExtensionRegistration,
  makeExtensionRegistration,
} from "../domain/extension-registration.entity";
import { MakeExtensionRegistrationProps } from "../domain/extension-registration.entity.props";

export type ExtensionRegistrationFactory = TestEntityFactory<
  MakeExtensionRegistrationProps,
  ExtensionRegistration
>;

export const makeExtensionRegistrationFactory =
  (): ExtensionRegistrationFactory => {
    const propOrDefault = <T, V>(prop: T | undefined, value: V) => {
      if (prop === undefined) return value;
      return prop;
    };

    const build: ExtensionRegistrationFactory["build"] = (props = {}) => {
      return makeExtensionRegistration({
        id: props.id,
        extensionId: propOrDefault(props.extensionId, faker.string.uuid()),
        extensionVersion: propOrDefault(
          props.extensionVersion,
          faker.string.uuid()
        ),
        hostname: propOrDefault(props.hostname, faker.internet.domainName()),
        os: propOrDefault(props.os, faker.hacker.noun()),
        publicKey: propOrDefault(props.publicKey, faker.internet.password()),
        status: propOrDefault(
          props.status,
          faker.helpers.arrayElement(Object.values(extensionRegistrationStatus))
        ),
      });
    };

    const buildList: ExtensionRegistrationFactory["buildList"] = (
      n,
      props = {}
    ) => {
      return Array.from({ length: n }, () => build(props));
    };

    return { build, buildList };
  };
