import { LogService } from "@playatlas/common/application";
import {
  InstanceAuthSettingsRepository,
  InstanceSessionRepository,
} from "../infra";
import { CryptographyService } from "./cryptography.service.port";
import { InstanceAuthService } from "./instance-auth.service.port";

export type InstanceAuthServiceDeps = {
  logService: LogService;
  cryptographyService: CryptographyService;
  instanceAuthSettingsRepository: InstanceAuthSettingsRepository;
  instanceSessionRepository: InstanceSessionRepository;
};

export const makeInstanceAuthService = ({
  logService,
  cryptographyService,
  instanceAuthSettingsRepository,
  instanceSessionRepository,
}: InstanceAuthServiceDeps): InstanceAuthService => {
  const verify: InstanceAuthService["verify"] = ({ request }) => {
    const url = new URL(request.url);
    const headers = request.headers;
    const requestDescription = logService.getRequestDescription(request);
    const authorization =
      headers.get("Authorization") ??
      (url.searchParams.get("sessionId")
        ? `Bearer ${url.searchParams.get("sessionId")}`
        : null);

    if (!authorization) {
      logService.warning(
        `${requestDescription}: Request rejected due to missing Authorization param`
      );
      return { authorized: false, reason: "Missing Authorization header" };
    }

    const instanceAuth = instanceAuthSettingsRepository.get();
    if (!instanceAuth) {
      logService.warning(
        `${requestDescription}: Request rejected due to missing instance registration`
      );
      return { authorized: false, reason: "Instance is not registered" };
    }

    const sessionId = authorization.split(" ").at(1);
    if (!sessionId) {
      logService.warning(
        `${requestDescription}: Request rejected due to missing or invalid session id`
      );
      return {
        authorized: false,
        reason: "Invalid or missing session id",
      };
    }

    const existingSession = instanceSessionRepository.getById(sessionId);
    if (!existingSession) {
      logService.warning(
        `${requestDescription}: Request rejected due to missing session`
      );
      return {
        authorized: false,
        reason: "Missing instance session",
      };
    }
    if (
      !cryptographyService.compareSessionIds(existingSession.getId(), sessionId)
    ) {
      logService.warning(
        `${requestDescription}: Request rejected due to invalid session`
      );
      return {
        authorized: false,
        reason: "Provided session id is invalid",
      };
    }

    logService.info(`${requestDescription}: Request authorized`);
    return { authorized: true, reason: "Authorized" };
  };

  return { verify };
};
