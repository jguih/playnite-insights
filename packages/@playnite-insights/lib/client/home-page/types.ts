import z from "zod";
import {
  homePageDataSchema,
  homePageGameSchema,
  homePageSearchParamsKeys,
} from "./schemas";

export type HomePageData = z.infer<typeof homePageDataSchema>;
export type HomePageGame = z.infer<typeof homePageGameSchema>;
export type HomePageSearchParamKeys =
  (typeof homePageSearchParamsKeys)[keyof typeof homePageSearchParamsKeys];
