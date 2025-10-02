import z from "zod";

export const ISODateSchema = z
  .string()
  .refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid ISO date string",
  });
