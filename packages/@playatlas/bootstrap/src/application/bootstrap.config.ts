import {
  EnvServiceDeps,
  makeEnvService,
  makeSystemConfig,
  type EnvService,
  type SystemConfig,
} from "@playatlas/system/infra";

export type PlayAtlasApiConfig = Readonly<{
  getEnvService: () => EnvService;
  getSystemConfig: () => SystemConfig;
}>;

export type BootstrapConfigDeps = EnvServiceDeps;

export const bootstrapConfig = ({ fsService, env }: BootstrapConfigDeps) => {
  const _env_service = makeEnvService({ fsService, env });
  const _systemConfig = makeSystemConfig({ envService: _env_service });

  const config: PlayAtlasApiConfig = {
    getEnvService: () => _env_service,
    getSystemConfig: () => _systemConfig,
  };
  return Object.freeze(config);
};
