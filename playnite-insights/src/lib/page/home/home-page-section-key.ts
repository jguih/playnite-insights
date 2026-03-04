export const homePageSection = ["hero"] as const satisfies string[];

export type HomePageSection = (typeof homePageSection)[number];
