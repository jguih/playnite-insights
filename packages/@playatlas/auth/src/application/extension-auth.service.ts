import type {
  LogService,
  SignatureService,
} from "@playatlas/common/application";
import { computeBase64HashAsync } from "@playatlas/common/infra";
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

  const verify: ExtensionAuthService["verify"] = async ({
    request,
    utcNow,
  }) => {
    const url = new URL(request.url);
    const headers = request.headers;
    const extensionId = headers.get("X-ExtensionId");
    const signatureBase64 = headers.get("X-Signature");
    const timestamp = headers.get("X-Timestamp");
    const contentHash = headers.get("X-ContentHash");
    const registrationId = headers.get("X-RegistrationId");
    const requestDescription = `${request.method} ${url.pathname}`;
    const extensionDescription = `extension (RegistrationId: ${
      registrationId ?? "unknown"
    }, ExtensionId: ${extensionId ?? "unknown"})`;
    let requestBody: string | undefined = undefined;

    if (!extensionId) {
      logService.warning(
        `${requestDescription}: Request rejected for ${extensionDescription} due to missing X-ExtensionId header`
      );
      return { authorized: false, reason: "missing X-ExtensionId header" };
    }
    if (!signatureBase64) {
      logService.warning(
        `${requestDescription}: Request rejected for ${extensionDescription} due to missing X-Signature header`
      );
      return { authorized: false, reason: "Missing X-Signature header" };
    }
    if (!timestamp || isNaN(Date.parse(timestamp))) {
      logService.warning(
        `${requestDescription}: Request rejected for ${extensionDescription} due to missing or invalid X-Timestamp header`
      );
      return {
        authorized: false,
        reason: "Missing or invalid X-Timestamp header",
      };
    }
    if (["POST", "PUT"].includes(request.method)) {
      if (!contentHash) {
        logService.warning(
          `${requestDescription}: Request rejected for ${extensionDescription} due to missing or invalid X-ContentHash header`
        );
        return { authorized: false, reason: "Missing content hash" };
      }
      requestBody = await request.text();
      const computedHash = await computeBase64HashAsync(requestBody);
      if (contentHash !== computedHash) {
        logService.warning(
          `${requestDescription}: Request rejected for ${extensionDescription} because calculated content hash does not match received one`
        );
        return {
          authorized: false,
          body: requestBody,
          reason: "Invalid content hash",
        };
      }
    }
    if (!registrationId || isNaN(Number(registrationId))) {
      logService.warning(
        `${requestDescription}: Request rejected for ${extensionDescription} due to missing or invalid X-RegistrationId header`
      );
      return {
        authorized: false,
        reason: "Missing or invalid X-RegistrationId header",
      };
    }

    const timestampMs = Date.parse(timestamp);
    if (timestampMs > utcNow || utcNow - timestampMs >= FIVE_MINUTES_MS) {
      logService.warning(
        `${requestDescription}: Request rejected for ${extensionDescription} due to expired or invalid timestamp`
      );
      return { authorized: false, reason: "Expired or invalid timestamp" };
    }

    const registration = extensionRegistrationRepository.getById(
      Number(registrationId)
    );
    if (!registration || !registration.isTrusted()) {
      logService.warning(
        `${requestDescription}: Request rejected for ${extensionDescription} due to missing, pending or not trusted registration`
      );
      return {
        authorized: false,
        reason: "Missing, pending or not trusted registration",
      };
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
      return { authorized: false, reason: "Invalid signature" };
    }

    logService.info(
      `${requestDescription}: Request authorized for ${extensionDescription}`
    );
    return { authorized: true, body: requestBody, reason: "Authorized" };
  };

  return { verify };
};
