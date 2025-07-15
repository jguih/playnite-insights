import { DashPageData } from "@playnite-insights/lib";

export type DashPageService = {
  getPageData: () => DashPageData | undefined;
};
