import {
  type AuthenticationService,
  type AuthenticationServiceDeps,
} from "./service.types";

export const makeAuthenticationService = ({
  extensionRegistrationRepository,
  signatureService,
  logService,
}: AuthenticationServiceDeps): AuthenticationService => {
  const verifyExtensionAuthorization: AuthenticationService["verifyExtensionAuthorization"] =
    ({ headers, extensionId, payload }) => {
      const signatureBase64 = headers.get("X-Signature");
      if (!signatureBase64) {
        logService.warning(
          `Extension (Id: ${extensionId}) request rejected due to missing X-Signature header`
        );
        return false;
      }
      const registration =
        extensionRegistrationRepository.getByExtensionId(extensionId);
      if (!registration || registration.Status !== "trusted") {
        logService.warning(
          `Extension (Id: ${extensionId}) request rejected due to missing, pending or not trusted registration`
        );
        return false;
      }
      const validSignature = signatureService.verifyExtensionSignature({
        signatureBase64,
        registration,
        payload,
      });
      if (!validSignature) {
        logService.warning(
          `Extension (Id: ${extensionId}) request rejected due to invalid signature`
        );
        return false;
      }
      logService.info(`Extension (Id: ${extensionId}) request authorized`);
      return true;
    };

  return { verifyExtensionAuthorization };
};
