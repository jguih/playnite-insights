import { ValidAuthenticationHeader } from "@playnite-insights/lib/client";
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
    headers: Record<ValidAuthenticationHeader, string | null>;
    request: {
      method: string;
    };
    url: {
      pathname: string;
    };
    now: number;
  }) => boolean;
};
