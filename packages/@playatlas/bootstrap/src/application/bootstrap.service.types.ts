import { LogService } from "@playatlas/common/application";
import { type EnvServiceDeps } from "@playatlas/system/infra";
import { type PlayAtlasApiAuth } from "./bootstrap.auth";
import { type PlayAtlasApiConfig } from "./bootstrap.config";
import { type PlayAtlasApiGameLibrary } from "./bootstrap.game-library";
import { type PlayAtlasApiInfra } from "./bootstrap.infra";

export type PlayAtlasApi = {
  config: PlayAtlasApiConfig;
  infra: PlayAtlasApiInfra;
  gameLibrary: PlayAtlasApiGameLibrary;
  auth: PlayAtlasApiAuth;
  getLogService: () => LogService;
};

export type BootstrapDeps = {
  env: EnvServiceDeps["env"];
};
