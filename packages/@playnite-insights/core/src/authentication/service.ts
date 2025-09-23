import {
  type AuthenticationService,
  type AuthenticationServiceDeps,
} from "./service.types";

export const makeAuthenticationService = ({
  extensionRegistrationRepository,
  signatureService,
}: AuthenticationServiceDeps): AuthenticationService => {
  const verifyExtensionAuthorization: AuthenticationService["verifyExtensionAuthorization"] =
    ({ headers, extensionId, payload }) => {
      const signatureBase64 = headers.get("X-Signature");
      if (!signatureBase64) return false;
      const registration =
        extensionRegistrationRepository.getByExtensionId(extensionId);
      if (!registration) return false;
      return signatureService.verifyExtensionSignature({
        signatureBase64,
        registration,
        payload,
      });
    };

  return { verifyExtensionAuthorization };
};
