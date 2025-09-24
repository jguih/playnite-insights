import {
  type AuthenticationService,
  type AuthenticationServiceDeps,
} from "./service.types";

export const makeAuthenticationService = ({
  extensionRegistrationRepository,
  signatureService,
  logService,
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

      if (!extensionId) {
        logService.warning(
          `${requestDescription}: Extension (Id: unknown) request reject due to missing X-ExtensionId header`
        );
        return false;
      }
      if (!signatureBase64) {
        logService.warning(
          `${requestDescription}: Extension (Id: ${extensionId}) request rejected due to missing X-Signature header`
        );
        return false;
      }
      if (!timestamp || isNaN(Date.parse(timestamp))) {
        logService.warning(
          `${requestDescription}: Extension (Id: ${extensionId}) request rejected due to missing or invalid X-Timestamp header`
        );
        return false;
      }
      if (["POST", "PUT"].includes(request.method) && !contentHash) {
        logService.warning(
          `${requestDescription}: Extension (Id: ${extensionId}) request rejected due to missing or invalid X-ContentHash header`
        );
        return false;
      }
      if (!registrationId || isNaN(Number(registrationId))) {
        logService.warning(
          `${requestDescription}: Extension (Id: ${extensionId}) request rejected due to missing or invalid X-RegistrationId header`
        );
        return false;
      }

      const timestampMs = Date.parse(timestamp);
      if (timestampMs > now || now - timestampMs >= FIVE_MINUTES_MS) {
        logService.warning(
          `${requestDescription}: Extension (Id: ${extensionId}) request rejected due to expired or invalid timestamp`
        );
        return false;
      }

      const registration = extensionRegistrationRepository.getByRegistrationId(
        Number(registrationId)
      );
      if (!registration || registration.Status !== "trusted") {
        logService.warning(
          `${requestDescription}: Extension (Id: ${extensionId}) request rejected due to missing, pending or not trusted registration`
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
        logService.warning(
          `${requestDescription}: Extension (Id: ${extensionId}) request rejected due to invalid signature`
        );
        return false;
      }
      
      logService.debug(
        `${requestDescription}: Extension (Id: ${extensionId}) request authorized`
      );
      return true;
    };

  return { verifyExtensionAuthorization };
};
