import type { IDomainEventBusPort, ILogServicePort } from "@playatlas/common/application";
import type { IClockPort } from "@playatlas/common/infra";
import { InstanceSessionIdParser } from "../domain";
import type { IInstanceAuthSettingsRepositoryPort, IInstanceSessionRepositoryPort } from "../infra";
import type { ICryptographyServicePort } from "./cryptography.service.port";
import type { IInstanceAuthSettingsFactoryPort } from "./instance-auth-settings.factory";
import type { IInstanceAuthServicePort } from "./instance-auth.service.port";
import type { IInstanceSessionFactoryPort } from "./instance-session.factory";

export type InstanceAuthServiceDeps = {
	logService: ILogServicePort;
	cryptographyService: ICryptographyServicePort;
	instanceAuthSettingsRepository: IInstanceAuthSettingsRepositoryPort;
	instanceAuthSettingsFactory: IInstanceAuthSettingsFactoryPort;
	instanceSessionRepository: IInstanceSessionRepositoryPort;
	instanceSessionFactory: IInstanceSessionFactoryPort;
	eventBus: IDomainEventBusPort;
	clock: IClockPort;
};

export const makeInstanceAuthService = ({
	logService,
	cryptographyService,
	instanceAuthSettingsRepository,
	instanceSessionRepository,
	instanceAuthSettingsFactory,
	instanceSessionFactory,
	eventBus,
	clock,
}: InstanceAuthServiceDeps): IInstanceAuthServicePort => {
	const verify: IInstanceAuthServicePort["verify"] = ({ request }) => {
		const url = new URL(request.url);
		const headers = request.headers;
		const requestDescription = logService.getRequestDescription(request);
		const authorization =
			headers.get("Authorization") ??
			(url.searchParams.get("sessionId") ? `Bearer ${url.searchParams.get("sessionId")}` : null);

		if (!authorization) {
			logService.warning(
				`${requestDescription}: Request rejected due to missing Authorization param`,
			);
			return { authenticated: false, reason: "Missing Authorization header" };
		}

		const instanceAuth = instanceAuthSettingsRepository.get();
		if (!instanceAuth) {
			logService.warning(
				`${requestDescription}: Request rejected due to missing instance registration`,
			);
			return { authenticated: false, reason: "Instance is not registered" };
		}

		const _sessionId = authorization.split(" ").at(1);

		if (!_sessionId) {
			logService.warning(`${requestDescription}: Request rejected due to missing session id`);
			return {
				authenticated: false,
				reason: "Invalid or missing session id",
			};
		}

		const sessionId = InstanceSessionIdParser.fromExternal(_sessionId);

		const existingSession = instanceSessionRepository.getById(sessionId);
		if (!existingSession) {
			logService.warning(`${requestDescription}: Request rejected due to missing session`);
			return {
				authenticated: false,
				reason: "Missing instance session",
			};
		}
		if (!cryptographyService.compareSessionIds(existingSession.getId(), sessionId)) {
			logService.warning(`${requestDescription}: Request rejected due to invalid session`);
			return {
				authenticated: false,
				reason: "Provided session id is invalid",
			};
		}

		logService.info(`${requestDescription}: Request authenticated`);
		return { authenticated: true, reason: "Authenticated" };
	};

	const registerAsync: IInstanceAuthServicePort["registerAsync"] = async ({ password }) => {
		const existing = instanceAuthSettingsRepository.get();
		if (existing)
			return {
				success: false,
				reason_code: "instance_already_registered",
				reason: "Instance is already registered",
			};

		const { hash: passwordHash, salt } = await cryptographyService.hashPassword(password);

		const instanceAuth = instanceAuthSettingsFactory.create({
			passwordHash,
			salt,
		});

		instanceAuthSettingsRepository.upsert(instanceAuth);

		logService.info(`Created instance registration`);

		eventBus.emit({
			id: crypto.randomUUID(),
			name: "instance-registered",
			occurredAt: clock.now(),
		});

		return {
			success: true,
			reason_code: "instance_registered",
			reason: "Instance registered",
		};
	};

	const loginAsync: IInstanceAuthServicePort["loginAsync"] = async ({ password }) => {
		const existing = instanceAuthSettingsRepository.get();
		if (!existing)
			return {
				success: false,
				reason_code: "instance_not_registered",
				reason: "Instance is not registered",
			};

		const isValid = cryptographyService.verifyPassword(password, {
			hash: existing.getPasswordHash(),
			salt: existing.getSalt(),
		});
		if (!isValid)
			return {
				success: false,
				reason_code: "not_authorized",
				reason: "Not authorized",
			};

		const sessionId = cryptographyService.createSessionId();
		const session = instanceSessionFactory.create({ sessionId });
		instanceSessionRepository.add(session);

		logService.info(`Instance login successfully`);

		eventBus.emit({
			id: crypto.randomUUID(),
			name: "instance-login",
			occurredAt: clock.now(),
		});

		return {
			success: true,
			reason_code: "created_session_id",
			reason: "Created a new session",
			sessionId,
		};
	};

	const isInstanceRegistered: IInstanceAuthServicePort["isInstanceRegistered"] = () => {
		const existing = instanceAuthSettingsRepository.get();
		return existing !== null;
	};

	return { verify, registerAsync, loginAsync, isInstanceRegistered };
};
