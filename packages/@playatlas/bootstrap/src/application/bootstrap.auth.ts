import {
  CryptographyService,
  type ExtensionAuthService,
  makeCryptographyService,
  makeExtensionAuthService,
} from "@playatlas/auth/application";
import {
  type ExtensionRegistrationRepository,
  InstanceAuthSettingsRepository,
  makeExtensionRegistrationRepository,
  makeInstanceAuthSettingsRepository,
} from "@playatlas/auth/infra";
import type {
  LogServiceFactory,
  SignatureService,
} from "@playatlas/common/application";
import type { PlayAtlasApiInfra } from "./bootstrap.infra";

export type PlayAtlasApiAuth = Readonly<{
  getExtensionRegistrationRepository: () => ExtensionRegistrationRepository;
  getInstanceAuthSettingsRepository: () => InstanceAuthSettingsRepository;
  getExtensionAuthService: () => ExtensionAuthService;
  getCryptographyService: () => CryptographyService;
}>;

export type BootstrapAuthDeps = {
  getDb: PlayAtlasApiInfra["getDb"];
  logServiceFactory: LogServiceFactory;
  signatureService: SignatureService;
};

export const bootstrapAuth = ({
  getDb,
  logServiceFactory,
  signatureService,
}: BootstrapAuthDeps): PlayAtlasApiAuth => {
  const _extension_registration_repo = makeExtensionRegistrationRepository({
    getDb,
    logService: logServiceFactory.build("ExtensionRegistrationRepository"),
  });
  const _instance_auth_settings_repo = makeInstanceAuthSettingsRepository({
    getDb,
    logService: logServiceFactory.build("InstanceAuthSettingsRepository"),
  });
  const _extension_auth_service = makeExtensionAuthService({
    logService: logServiceFactory.build("ExtensionAuthService"),
    extensionRegistrationRepository: _extension_registration_repo,
    signatureService,
  });
  const _cryptography_service = makeCryptographyService({
    logService: logServiceFactory.build("CryptographyService"),
  });

  const authApi: PlayAtlasApiAuth = {
    getExtensionRegistrationRepository: () => _extension_registration_repo,
    getInstanceAuthSettingsRepository: () => _instance_auth_settings_repo,
    getExtensionAuthService: () => _extension_auth_service,
    getCryptographyService: () => _cryptography_service,
  };
  return Object.freeze(authApi);
};
