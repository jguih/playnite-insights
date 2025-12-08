import type {
  LogService,
  SignatureService,
} from "@playatlas/common/application";
import type { ExtensionRegistrationRepository } from "../infra";
import type { ExtensionAuthService } from "./extension-auth.service.port";

export type ExtensionAuthServiceDeps = {
  logService: LogService;
  signatureService: SignatureService;
  extensionRegistrationRepository: ExtensionRegistrationRepository;
};

export const makeExtensionAuthService = ({
  logService,
  signatureService,
  extensionRegistrationRepository,
}: ExtensionAuthServiceDeps): ExtensionAuthService => {
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
    const base = `${method}|${endpoint}|${extensionId}|${timestamp}`;
    return contentHash ? `${base}|${contentHash}` : `${base}`;
  };

  const verify: ExtensionAuthService["verify"] = ({
    headers,
    request,
    url,
    now,
  }) => {
    const extensionId = headers.get("X-ExtensionId");
    const signatureBase64 = headers.get("X-Signature");
    const timestamp = headers.get("X-Timestamp");
    const contentHash = headers.get("X-ContentHash");
    const registrationId = headers.get("X-RegistrationId");
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

    const registration = extensionRegistrationRepository.getById(
      Number(registrationId)
    );
    if (!registration || registration.isTrusted()) {
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

    const validSignature = signatureService.verify({
      signature: signatureBase64,
      publicKey: registration.getPublicKey(),
      payload,
    });
    if (!validSignature) {
      logService.error(
        `${requestDescription}: Request rejected for ${extensionDescription} due to invalid signature`
      );
      return false;
    }

    logService.info(
      `${requestDescription}: Request authorized for ${extensionDescription}`
    );
    return true;
  };

  return { verify };
};
