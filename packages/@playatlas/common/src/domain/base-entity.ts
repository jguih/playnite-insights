export type BaseEntityId = string | number;
export type BaseEntity<EntityId extends BaseEntityId> = Readonly<{
  getId: () => EntityId;
  validate: () => void;
}>;
