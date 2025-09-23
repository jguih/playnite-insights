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
  }: {
    method: string;
    endpoint: string;
    extensionId: string;
    timestamp: string;
  }): string => {
    return `${method}|${endpoint}|${extensionId}|${timestamp}`;
  };

  const verifyExtensionAuthorization: AuthenticationService["verifyExtensionAuthorization"] =
    ({ request, url, payload }) => {
      const extensionId = request.headers.get("X-ExtensionId");
      const signatureBase64 = request.headers.get("X-Signature");
      const timestamp = request.headers.get("X-Timestamp");
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

      const now = Date.now();
      const timestampMs = Date.parse(timestamp);
      if (timestampMs > now || now - timestampMs >= FIVE_MINUTES_MS) {
        logService.warning(
          `${requestDescription}: Extension (Id: ${extensionId}) request rejected due to expired or invalid timestamp`
        );
        return false;
      }

      const resolvedPayload =
        payload ??
        _getCanonicalString({
          method: request.method,
          endpoint: url.pathname,
          extensionId,
          timestamp,
        });

      const registration =
        extensionRegistrationRepository.getByExtensionId(extensionId);
      if (!registration || registration.Status !== "trusted") {
        logService.warning(
          `${requestDescription}: Extension (Id: ${extensionId}) request rejected due to missing, pending or not trusted registration`
        );
        return false;
      }
      const validSignature = signatureService.verifyExtensionSignature({
        signatureBase64,
        registration,
        payload: resolvedPayload,
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
