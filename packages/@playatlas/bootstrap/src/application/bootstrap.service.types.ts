import { type EnvServiceDeps } from "@playatlas/system/infra";
import { PlayAtlasApiConfig } from "./bootstrap.config";
import { PlayAtlasApiGameLibrary } from "./bootstrap.game-library";
import { PlayAtlasApiInfra } from "./bootstrap.infra";

export type PlayAtlasApi = {
  config: PlayAtlasApiConfig;
  infra: PlayAtlasApiInfra;
  gameLibrary: PlayAtlasApiGameLibrary;
};

export type BootstrapDeps = {
  env: EnvServiceDeps["env"];
};
