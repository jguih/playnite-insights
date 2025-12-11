import {
  type CryptographyService,
  type ExtensionAuthService,
  type InstanceAuthService,
  makeCryptographyService,
  makeExtensionAuthService,
  makeInstanceAuthService,
} from "@playatlas/auth/application";
import {
  type ApproveExtensionRegistrationCommandHandler,
  makeApproveExtensionRegistrationHandler,
  makeRejectExtensionRegistrationHandler,
  RejectExtensionRegistrationCommandHandler,
} from "@playatlas/auth/commands";
import {
  type ExtensionRegistrationRepository,
  type InstanceAuthSettingsRepository,
  type InstanceSessionRepository,
  makeExtensionRegistrationRepository,
  makeInstanceAuthSettingsRepository,
  makeInstanceSessionRepository,
} from "@playatlas/auth/infra";
import type {
  LogServiceFactory,
  SignatureService,
} from "@playatlas/common/application";
import type { PlayAtlasApiInfra } from "./bootstrap.infra";

export type PlayAtlasApiAuth = Readonly<{
  getExtensionRegistrationRepository: () => ExtensionRegistrationRepository;
  getInstanceAuthSettingsRepository: () => InstanceAuthSettingsRepository;
  getInstanceSessionRepository: () => InstanceSessionRepository;
  getExtensionAuthService: () => ExtensionAuthService;
  getCryptographyService: () => CryptographyService;
  getInstanceAuthService: () => InstanceAuthService;
  commands: {
    getApproveExtensionRegistrationCommandHandler: () => ApproveExtensionRegistrationCommandHandler;
    getRejectExtensionRegistrationCommandHandler: () => RejectExtensionRegistrationCommandHandler;
  };
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
  const _instance_session_repo = makeInstanceSessionRepository({
    getDb,
    logService: logServiceFactory.build("InstanceSessionRepository"),
  });
  const _extension_auth_service = makeExtensionAuthService({
    logService: logServiceFactory.build("ExtensionAuthService"),
    extensionRegistrationRepository: _extension_registration_repo,
    signatureService,
  });
  const _cryptography_service = makeCryptographyService();
  const _instance_auth_service = makeInstanceAuthService({
    cryptographyService: _cryptography_service,
    instanceAuthSettingsRepository: _instance_auth_settings_repo,
    instanceSessionRepository: _instance_session_repo,
    logService: logServiceFactory.build("InstanceAuthService"),
  });
  const _approve_extension_registration_command_handler =
    makeApproveExtensionRegistrationHandler({
      logService: logServiceFactory.build(
        "ApproveExtensionRegistrationCommandHandler"
      ),
      extensionRegistrationRepository: _extension_registration_repo,
    });
  const _reject_extension_registration_command_handler =
    makeRejectExtensionRegistrationHandler({
      logService: logServiceFactory.build(
        "RejectExtensionRegistrationCommandHandler"
      ),
      extensionRegistrationRepository: _extension_registration_repo,
    });

  const authApi: PlayAtlasApiAuth = {
    getExtensionRegistrationRepository: () => _extension_registration_repo,
    getInstanceAuthSettingsRepository: () => _instance_auth_settings_repo,
    getInstanceSessionRepository: () => _instance_session_repo,
    getExtensionAuthService: () => _extension_auth_service,
    getCryptographyService: () => _cryptography_service,
    getInstanceAuthService: () => _instance_auth_service,
    commands: {
      getApproveExtensionRegistrationCommandHandler: () =>
        _approve_extension_registration_command_handler,
      getRejectExtensionRegistrationCommandHandler: () =>
        _reject_extension_registration_command_handler,
    },
  };
  return Object.freeze(authApi);
};
