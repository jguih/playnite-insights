export type BaseEntityId = string | number;
export type BaseEntity<EntityId extends BaseEntityId> = Readonly<{
  getId: () => EntityId;
  /**
   * Gets the entity id as a string. Used by the `logService` when logging repository and other related operations. The string representation can redact the original id when it's sensitive, like a session id.
   * @returns A string representation of the id
   */
  getSafeId: () => string;
  validate: () => void;
}>;
