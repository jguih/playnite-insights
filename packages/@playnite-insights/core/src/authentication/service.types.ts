import type {
  ApiErrorCode,
  ValidAuthenticationHeader,
} from "@playnite-insights/lib/client";
import type { CryptographyService } from "../types/cryptography-service";
import type { ExtensionRegistrationRepository } from "../types/extension-registration-repository";
import type { InstanceAuthenticationRepository } from "../types/instance-authentication-repository";
import type { InstanceSessionsRepository } from "../types/instance-sessions-repository";
import type { LogService } from "../types/log-service";
import type { SignatureService } from "../types/signature-service";

export type AuthServiceDeps = {
  extensionRegistrationRepository: ExtensionRegistrationRepository;
  signatureService: SignatureService;
  logService: LogService;
  cryptographyService: CryptographyService;
  instanceAuthenticationRepository: InstanceAuthenticationRepository;
  instanceSessionsRepository: InstanceSessionsRepository;
};

export type VerifyInstanceAuthArgs = {
  headers: { Authorization: string | null };
  request: {
    method: string;
  };
  url: {
    pathname: string;
    searchParams: URLSearchParams;
  };
};

export type AuthService = {
  verifyExtensionAuth: (args: {
    headers: Record<ValidAuthenticationHeader, string | null>;
    request: {
      method: string;
    };
    url: {
      pathname: string;
    };
    now: number;
  }) => boolean;
  verifySessionId: (args: {
    sessionId?: string;
  }) =>
    | { isAuthorized: false; code: ApiErrorCode; message: string }
    | { isAuthorized: true };
  verifyInstanceAuth: (
    args: VerifyInstanceAuthArgs
  ) => { isAuthorized: false; code: ApiErrorCode } | { isAuthorized: true };
  isInstanceRegistered: () => boolean;
  registerInstanceAsync: (password: string) => Promise<void>;
  loginInstanceAsync: (password: string) => Promise<string>;
};
