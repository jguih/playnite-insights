import {
  ApiError,
  type InstanceAuthentication,
  type InstanceSession,
} from "@playnite-insights/lib/client";
import {
  type AuthenticationService,
  type AuthenticationServiceDeps,
} from "./service.types";

export const makeAuthenticationService = ({
  extensionRegistrationRepository,
  signatureService,
  logService,
  cryptographyService,
  instanceAuthenticationRepository,
  instanceSessionsRepository,
}: AuthenticationServiceDeps): AuthenticationService => {
  const FIVE_MINUTES_MS = 5 * 60 * 1000;

  const _getCanonicalString = ({
    method,
    endpoint,
    extensionId,
    timestamp,
    contentHash,
  }: {
    method: string;
    endpoint: string;
    extensionId: string;
    timestamp: string;
    contentHash: string | null;
  }): string => {
    if (contentHash) {
      return `${method}|${endpoint}|${extensionId}|${timestamp}|${contentHash}`;
    }
    return `${method}|${endpoint}|${extensionId}|${timestamp}`;
  };

  const verifyExtensionAuthorization: AuthenticationService["verifyExtensionAuthorization"] =
    ({ headers, request, url, now }) => {
      const extensionId = headers["X-ExtensionId"];
      const signatureBase64 = headers["X-Signature"];
      const timestamp = headers["X-Timestamp"];
      const contentHash = headers["X-ContentHash"];
      const registrationId = headers["X-RegistrationId"];
      const requestDescription = `${request.method} ${url.pathname}`;
      const extensionDescription = `extension (RegistrationId: ${
        registrationId ?? "unknown"
      }, ExtensionId: ${extensionId ?? "unknown"})`;

      if (!extensionId) {
        logService.warning(
          `${requestDescription}: Request rejected for ${extensionDescription} due to missing X-ExtensionId header`
        );
        return false;
      }
      if (!signatureBase64) {
        logService.warning(
          `${requestDescription}: Request rejected for ${extensionDescription} due to missing X-Signature header`
        );
        return false;
      }
      if (!timestamp || isNaN(Date.parse(timestamp))) {
        logService.warning(
          `${requestDescription}: Request rejected for ${extensionDescription} due to missing or invalid X-Timestamp header`
        );
        return false;
      }
      if (["POST", "PUT"].includes(request.method) && !contentHash) {
        logService.warning(
          `${requestDescription}: Request rejected for ${extensionDescription} due to missing or invalid X-ContentHash header`
        );
        return false;
      }
      if (!registrationId || isNaN(Number(registrationId))) {
        logService.warning(
          `${requestDescription}: Request rejected for ${extensionDescription} due to missing or invalid X-RegistrationId header`
        );
        return false;
      }

      const timestampMs = Date.parse(timestamp);
      if (timestampMs > now || now - timestampMs >= FIVE_MINUTES_MS) {
        logService.warning(
          `${requestDescription}: Request rejected for ${extensionDescription} due to expired or invalid timestamp`
        );
        return false;
      }

      const registration = extensionRegistrationRepository.getByRegistrationId(
        Number(registrationId)
      );
      if (!registration || registration.Status !== "trusted") {
        logService.warning(
          `${requestDescription}: Request rejected for ${extensionDescription} due to missing, pending or not trusted registration`
        );
        return false;
      }

      const payload = _getCanonicalString({
        method: request.method,
        endpoint: url.pathname,
        extensionId,
        timestamp,
        contentHash,
      });

      const validSignature = signatureService.verifyExtensionSignature({
        signatureBase64,
        registration,
        payload,
      });
      if (!validSignature) {
        logService.error(
          `${requestDescription}: Request rejected for ${extensionDescription} due to invalid signature`
        );
        return false;
      }

      logService.debug(
        `${requestDescription}: Request authorized for ${extensionDescription}`
      );
      return true;
    };

  const registerInstanceAsync: AuthenticationService["registerInstanceAsync"] =
    async (password) => {
      const existing = instanceAuthenticationRepository.get();
      if (existing) throw new ApiError("Instance password already set.", 400);
      const { hash, salt } = await cryptographyService.hashPasswordAsync(
        password
      );
      const now = new Date();
      const instanceAuth: InstanceAuthentication = {
        Id: 1,
        PasswordHash: hash,
        Salt: salt,
        CreatedAt: now.toISOString(),
        LastUpdatedAt: now.toISOString(),
      };
      instanceAuthenticationRepository.set(instanceAuth);
    };

  const loginInstanceAsync: AuthenticationService["loginInstanceAsync"] =
    async (password) => {
      const existing = instanceAuthenticationRepository.get();
      if (!existing) throw new ApiError("Instance not registered", 403);
      const isValid = cryptographyService.verifyPassword(password, {
        hash: existing.PasswordHash,
        salt: existing.Salt,
      });
      if (!isValid) throw new ApiError("Invalid credentials", 403);
      const now = new Date();
      const sessionId = cryptographyService.createSessionId();
      const newSession: InstanceSession = {
        Id: sessionId,
        CreatedAt: now.toISOString(),
        LastUsedAt: now.toISOString(),
      };
      instanceSessionsRepository.add(newSession);
      return sessionId;
    };

  return {
    verifyExtensionAuthorization,
    registerInstanceAsync,
    loginInstanceAsync,
  };
};
