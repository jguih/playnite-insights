import type {
  ApiErrorCode,
  ValidAuthenticationHeader,
} from "@playnite-insights/lib/client";
import type { CryptographyService } from "../types/cryptography.types";
import type { ExtensionRegistrationRepository } from "../types/extension-registration.types";
import type { InstanceAuthenticationRepository } from "../types/instance-authentication.types";
import type { InstanceSessionsRepository } from "../types/instance-sessions.types";
import type { LogService } from "../types/log.types";
import type { SignatureService } from "../types/signature.types";

export type AuthenticationServiceDeps = {
  extensionRegistrationRepository: ExtensionRegistrationRepository;
  signatureService: SignatureService;
  logService: LogService;
  cryptographyService: CryptographyService;
  instanceAuthenticationRepository: InstanceAuthenticationRepository;
  instanceSessionsRepository: InstanceSessionsRepository;
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
  verifyInstanceAuthorization: (args: {
    headers: { Authorization: string | null };
    request: {
      method: string;
    };
    url: {
      pathname: string;
    };
  }) => { isAuthorized: false; code: ApiErrorCode } | { isAuthorized: true };
  isInstanceRegistered: () => boolean;
  registerInstanceAsync: (password: string) => Promise<void>;
  loginInstanceAsync: (password: string) => Promise<string>;
};
