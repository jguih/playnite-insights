import type {
  LogService,
  SignatureService,
} from "@playatlas/common/application";
import { createHash, timingSafeEqual } from "crypto";
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
  const _getCanonicalString = ({
    method,
    endpoint,
    extensionId,
    contentHash,
  }: {
    method: string;
    endpoint: string;
    extensionId: string;
    contentHash: string | null;
  }): string => {
    const base = `${method}|${endpoint}|${extensionId}`;
    return contentHash ? `${base}|${contentHash}` : `${base}`;
  };

  const verify: ExtensionAuthService["verify"] = async ({
    request,
    utcNow,
  }) => {
    const url = new URL(request.url);
    const headers = request.headers;
    const contentType = (headers.get("Content-Type") || "").toLowerCase();
    const extensionId = headers.get("X-ExtensionId");
    const signatureBase64 = headers.get("X-Signature");
    const contentHash = headers.get("X-ContentHash");
    const registrationId = headers.get("X-RegistrationId");
    const requestDescription = logService.getRequestDescription(request);
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
    if (["POST", "PUT"].includes(request.method)) {
      if (!contentHash) {
        logService.warning(
          `${requestDescription}: Request rejected for ${extensionDescription} due to missing or invalid X-ContentHash header`
        );
        return { authorized: false, reason: "Missing content hash" };
      }
      if (contentType.includes("application/json")) {
        requestBody = await request.text();
        const canonicalDigest = createHash("sha256")
          .update(requestBody, "utf-8")
          .digest();
        const headerDigest = Buffer.from(contentHash);
        if (!timingSafeEqual(headerDigest, canonicalDigest)) {
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
