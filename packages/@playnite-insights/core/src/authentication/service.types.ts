import type { ExtensionRegistrationRepository } from "../types/extension-registration.types";
import type { SignatureService } from "../types/signature.types";

export type AuthenticationServiceDeps = {
  extensionRegistrationRepository: ExtensionRegistrationRepository;
  signatureService: SignatureService;
};

export type AuthenticationService = {
  verifyExtensionAuthorization: (args: {
    headers: Headers;
    extensionId: string;
    payload: string;
  }) => boolean;
};
