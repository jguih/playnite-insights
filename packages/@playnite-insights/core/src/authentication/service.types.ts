import type { ExtensionRegistrationRepository } from "../types/extension-registration.types";
import type { LogService } from "../types/log.types";
import type { SignatureService } from "../types/signature.types";

export type AuthenticationServiceDeps = {
  extensionRegistrationRepository: ExtensionRegistrationRepository;
  signatureService: SignatureService;
  logService: LogService;
};

export type AuthenticationService = {
  verifyExtensionAuthorization: (args: {
    request: Request;
    url: URL;
    payload?: string;
  }) => boolean;
};
