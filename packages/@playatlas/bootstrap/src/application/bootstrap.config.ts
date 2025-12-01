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

export const bootstrapConfig = ({ env }: BootstrapConfigDeps) => {
  const _env_service = makeEnvService({ env });
  const _system_config = makeSystemConfig({ envService: _env_service });

  const config: PlayAtlasApiConfig = {
    getEnvService: () => _env_service,
    getSystemConfig: () => _system_config,
  };
  return Object.freeze(config);
};
