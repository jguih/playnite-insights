import {
  ExtensionAuthService,
  makeExtensionAuthService,
} from "@playatlas/auth/application";
import {
  type ExtensionRegistrationRepository,
  makeExtensionRegistrationRepository,
} from "@playatlas/auth/infra";
import type {
  LogServiceFactory,
  SignatureService,
} from "@playatlas/common/application";
import type { PlayAtlasApiInfra } from "./bootstrap.infra";

export type PlayAtlasApiAuth = Readonly<{
  getExtensionRegistrationRepository: () => ExtensionRegistrationRepository;
  getExtensionAuthService: () => ExtensionAuthService;
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
  const _extension_auth_service = makeExtensionAuthService({
    logService: logServiceFactory.build("ExtensionAuthService"),
    extensionRegistrationRepository: _extension_registration_repo,
    signatureService,
  });

  const authApi: PlayAtlasApiAuth = {
    getExtensionRegistrationRepository: () => _extension_registration_repo,
    getExtensionAuthService: () => _extension_auth_service,
  };
  return Object.freeze(authApi);
};
