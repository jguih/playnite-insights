import { BaseEntity } from "@playatlas/common/domain";
import { MakePlatformProps } from "./platform.entity.types";

export type PlatformId = string;

export type Platform = BaseEntity<PlatformId> &
  Readonly<{
    getId: () => PlatformId;
    getName: () => string;
    getSpecificationId: () => string;
    getIcon: () => string | null;
    getCover: () => string | null;
    getBackground: () => string | null;
  }>;

export const makePlatform = (props: MakePlatformProps): Platform => {
  const _id = props.id;
  const _name = props.name;
  const _specificationId = props.specificationId;
  const _icon = props.icon ?? null;
  const _cover = props.cover ?? null;
  const _background = props.background ?? null;

  const platform: Platform = {
    getId: () => _id,
    getName: () => _name,
    getSpecificationId: () => _specificationId,
    getIcon: () => _icon,
    getCover: () => _cover,
    getBackground: () => _background,
    validate: () => {},
  };

  return Object.freeze(platform);
};
