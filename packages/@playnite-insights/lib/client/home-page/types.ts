import { homePageSearchParamsKeys } from "./schemas";

export type HomePageSearchParamKeys =
  (typeof homePageSearchParamsKeys)[keyof typeof homePageSearchParamsKeys];
