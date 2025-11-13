import {
  ApiError,
  type InstanceAuthentication,
  type InstanceSession,
} from "@playnite-insights/lib/client";
import { type AuthService, type AuthServiceDeps } from "./service.types";

export const makeAuthService = ({
  extensionRegistrationRepository,
  signatureService,
  logService,
  cryptographyService,
  instanceAuthenticationRepository,
  instanceSessionsRepository,
}: AuthServiceDeps): AuthService => {
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

  const verifyExtensionAuth: AuthService["verifyExtensionAuth"] = ({
    headers,
    request,
    url,
    now,
  }) => {
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

    logService.info(
      `${requestDescription}: Request authorized for ${extensionDescription}`
    );
    return true;
  };

  const verifySessionId: AuthService["verifySessionId"] = ({ sessionId }) => {
    if (!sessionId) {
      return {
        isAuthorized: false,
        code: "invalid_request",
        message:
          "Request rejected for instance due to invalid Authorization header",
      };
    }
    const existingSession = instanceSessionsRepository.getById(sessionId);
    if (!existingSession) {
      return {
        isAuthorized: false,
        code: "not_authorized",
        message: "Request rejected for instance due to non existent session",
      };
    }
    return { isAuthorized: true };
  };

  const verifyInstanceAuth: AuthService["verifyInstanceAuth"] = ({
    headers,
    request,
    url,
  }) => {
    const requestDescription = `${request.method} ${url.pathname}`;
    const authorization =
      headers.Authorization ??
      (url.searchParams.get("sessionId")
        ? `Bearer ${url.searchParams.get("sessionId")}`
        : null);

    const instanceAuth = instanceAuthenticationRepository.get();
    if (!instanceAuth) {
      logService.warning(
        `${requestDescription}: Request rejected for instance due to missing instance registration`
      );
      return { isAuthorized: false, code: "instance_not_registered" };
    }

    if (!authorization) {
      logService.warning(
        `${requestDescription}: Request rejected for instance due to missing Authorization param`
      );
      return { isAuthorized: false, code: "invalid_request" };
    }

    const sessionId = authorization.split(" ").at(1);
    const result = verifySessionId({ sessionId });
    if (result.isAuthorized === false) {
      logService.warning(`${requestDescription}: ${result.message}`);
      return result;
    }

    logService.info(`${requestDescription}: Request authorized for instance`);
    return { isAuthorized: true };
  };

  const isInstanceRegistered: AuthService["isInstanceRegistered"] = () => {
    const instanceAuth = instanceAuthenticationRepository.get();
    return instanceAuth != null;
  };

  const registerInstanceAsync: AuthService["registerInstanceAsync"] = async (
    password
  ) => {
    const existing = instanceAuthenticationRepository.get();
    if (existing)
      throw new ApiError(
        { error: { code: "instance_already_registered" } },
        "Instance already registered",
        400
      );
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

  const loginInstanceAsync: AuthService["loginInstanceAsync"] = async (
    password
  ) => {
    const existing = instanceAuthenticationRepository.get();
    if (!existing)
      throw new ApiError(
        { error: { code: "instance_not_registered" } },
        "Instance not registered",
        403
      );
    const isValid = cryptographyService.verifyPassword(password, {
      hash: existing.PasswordHash,
      salt: existing.Salt,
    });
    if (!isValid)
      throw new ApiError(
        { error: { code: "not_authorized" } },
        "Invalid credentials",
        403
      );
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
    verifyExtensionAuth,
    verifySessionId,
    verifyInstanceAuth,
    isInstanceRegistered,
    registerInstanceAsync,
    loginInstanceAsync,
  };
};
