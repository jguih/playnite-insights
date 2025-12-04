import {
  type ExtensionRegistrationRepository,
  makeExtensionRegistrationRepository,
} from "@playatlas/auth/infra";
import type { LogServiceFactory } from "@playatlas/common/application";
import type { PlayAtlasApiInfra } from "./bootstrap.infra";

export type PlayAtlasApiAuth = Readonly<{
  getExtensionRegistrationRepository: () => ExtensionRegistrationRepository;
}>;

export type BootstrapAuthDeps = {
  getDb: PlayAtlasApiInfra["getDb"];
  logServiceFactory: LogServiceFactory;
};

export const bootstrapAuth = ({
  getDb,
  logServiceFactory,
}: BootstrapAuthDeps): PlayAtlasApiAuth => {
  const _extension_registration_repo = makeExtensionRegistrationRepository({
    getDb,
    logService: logServiceFactory.build("ExtensionRegistrationRepository"),
  });

  const authApi: PlayAtlasApiAuth = {
    getExtensionRegistrationRepository: () => _extension_registration_repo,
  };
  return Object.freeze(authApi);
};
