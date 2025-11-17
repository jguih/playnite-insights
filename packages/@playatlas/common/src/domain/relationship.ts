import { InvalidStateError } from "./error";

export type Relationship<R> = {
  /**
   * @throws {InvalidStateError} when the property was not loaded
   */
  get: () => R[];
  set: (value: R[]) => void;
  isLoaded: () => boolean;
};

export const createRelationship = <R>(
  initialValue: R[] | null
): Relationship<R> => {
  let loaded = Array.isArray(initialValue);
  let value: R[] | null = initialValue;

  return {
    get() {
      if (value === null) throw new InvalidStateError("Property not loaded");
      return value;
    },
    set(v) {
      value = v;
      loaded = true;
    },
    isLoaded() {
      return loaded;
    },
  };
};
