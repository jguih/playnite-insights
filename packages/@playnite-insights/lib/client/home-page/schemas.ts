export const homePageSearchParamsFilterKeys = {
  query: "query",
  installed: "installed",
  notInstalled: "notInstalled",
  developer: "developer",
  publisher: "publisher",
  genre: "genre",
  platform: "platform",
} as const;

export const homePageSearchParamsKeys = {
  page: "page",
  pageSize: "pageSize",
  sortBy: "sortBy",
  sortOrder: "sortOrder",
  ...homePageSearchParamsFilterKeys,
} as const;
