import z from "zod";
import { developerSchema } from "../developer";

export const homePageGameSchema = z.object({
  Id: z.string(),
  Name: z.string().nullable().optional(),
  CoverImage: z.string().nullable().optional(),
});

export const homePageDataSchema = z.object({
  games: z
    .object({
      games: z.array(homePageGameSchema),
      total: z.number(),
      hasNextPage: z.boolean(),
      totalPages: z.number(),
      offset: z.number(),
      items: z.number(),
    })
    .optional(),
  developers: z.array(developerSchema).optional(),
});

export const homePageSearchParamsKeys = {
  page: "page",
  pageSize: "pageSize",
  query: "query",
  sortBy: "sortBy",
  sortOrder: "sortOrder",
  installed: "installed",
  notInstalled: "notInstalled",
} as const;
