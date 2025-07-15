import z from "zod";

export const homePageGameSchema = z.array(
  z.object({
    Id: z.string(),
    Name: z.string().nullable().optional(),
    CoverImage: z.string().nullable().optional(),
  })
);

export const homePageDataSchema = z.object({
  games: homePageGameSchema,
  total: z.number(),
  hasNextPage: z.boolean(),
  totalPages: z.number(),
  offset: z.number(),
  items: z.number(),
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
