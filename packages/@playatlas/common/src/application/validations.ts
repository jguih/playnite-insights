import z from "zod";

const isEmptyString = (value?: string | null): boolean => {
  if (!value) return false;
  return value.trim().length === 0;
};

const isNullOrNonEmptyString = (value?: string | null): boolean => {
  if (value === null) return true;
  if (!value) return false;
  return value.trim().length > 0;
};

const isNullOrEmptyString = (value?: string | null): boolean => {
  if (!value) return true;
  return value.trim().length === 0;
};

export const validation = {
  schemas: {
    nonEmptyString: z
      .string()
      .refine((s) => s.trim().length > 0, "must not be empty or whitespace"),
    nullOrNonEmptyString: z
      .string()
      .nullable()
      .refine(
        (s) => s === null || s.trim().length > 0,
        "must be null or a non-empty string"
      ),
  },
  message: {
    isNullOrNonEmptyString: (
      propName: string,
      value?: string | null
    ): string => {
      return `Invalid ${propName}: ${value}. It must be null or a non-empty string`;
    },
    isEmptyString: (propName: string): string => {
      return `Invalid ${propName}. It must not be an empty string`;
    },
    isNullOrEmptyString: (propName: string): string => {
      return `Invalid ${propName}. It must not be null, undefined or an empty string`;
    },
  },
  isEmptyString,
  isNullOrNonEmptyString,
  isNullOrEmptyString,
};
