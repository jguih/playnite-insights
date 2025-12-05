import { MakeBaseEntityProps } from "./base-entity.props";
import { InvalidStateError } from "./error";

export type BaseEntity<
  EntityId extends string | number,
  ValidateProps extends object = {}
> = Readonly<{
  getId: () => EntityId;
  getCreatedAt: () => Date;
  getLastUpdatedAt: () => Date;
  validate: (props?: ValidateProps) => void;
  applyPersistenceMetadata: (props: {
    id: EntityId;
    createdAt: Date;
    lastUpdatedAt: Date;
  }) => void;
}>;

export const makeBaseEntity = <
  EntityId extends string | number,
  ValidateProps extends object = {}
>(
  props: MakeBaseEntityProps<EntityId>
): BaseEntity<EntityId, ValidateProps> => {
  let _id: EntityId | null = props.id ?? null;
  let _createdAt: Date | null = props.createdAt ?? null;
  let _lastUpdatedAt: Date | null = props.lastUpdatedAt ?? null;

  const _validate = () => {
    if (_id === null) {
      // New
      if (_createdAt !== null || _lastUpdatedAt !== null)
        throw new InvalidStateError(
          `New entity must not have values for CreatedAt and LastUpdatedAt before persistence`
        );
    } else {
      // Persisted
      if (_createdAt === null || _lastUpdatedAt === null)
        throw new InvalidStateError(
          `Persisted entity must have assigned values for CreatedAt and LastUpdatedAt after persistence`
        );
    }
  };

  _validate();

  const baseEntity: BaseEntity<EntityId, ValidateProps> = {
    getId: () => {
      if (!_id)
        throw new InvalidStateError(
          "Id is null until the entity is persisted!"
        );
      return _id;
    },
    getCreatedAt: () => {
      if (!_createdAt)
        throw new InvalidStateError(
          "Created At is null until the entity is persisted!"
        );
      return _createdAt;
    },
    getLastUpdatedAt: () => {
      if (!_lastUpdatedAt)
        throw new InvalidStateError(
          "Last Updated At is null until the entity is persisted!"
        );
      return _lastUpdatedAt;
    },
    validate: _validate,
    applyPersistenceMetadata: ({ id, createdAt, lastUpdatedAt }) => {
      const isNew = _id === null;
      if (isNew) {
        _id = id;
        _createdAt = createdAt;
        _lastUpdatedAt = lastUpdatedAt;
      } else {
        if (id !== _id)
          throw new InvalidStateError("Cannot change ID of persisted entity");
        _lastUpdatedAt = lastUpdatedAt;
      }
      _validate();
    },
  };
  return Object.freeze(baseEntity);
};
