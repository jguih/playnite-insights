import { zodJsonParser, type IHttpClientPort } from "$lib/modules/common/application";
import {
	loginInstanceResponseDtoSchema,
	registerInstanceResponseDtoSchema,
} from "@playatlas/auth/dtos";
import { serverHealthCheckResponseDtoSchema } from "@playatlas/common/dtos";
import type { IAuthServicePort } from "./auth-service.port";

export type AuthServiceDeps = {
	httpClient: IHttpClientPort;
};

export class AuthService implements IAuthServicePort {
	constructor(private readonly deps: AuthServiceDeps) {}

	loginAsync: IAuthServicePort["loginAsync"] = async ({ password }) => {
		const response = await this.deps.httpClient.postAsync(
			{ endpoint: "/api/auth/login" },
			{ body: JSON.stringify({ password }) },
		);

		return await zodJsonParser(loginInstanceResponseDtoSchema)(response);
	};

	registerAsync: IAuthServicePort["registerAsync"] = async ({ password }) => {
		const response = await this.deps.httpClient.postAsync(
			{ endpoint: "/api/auth/register" },
			{ body: JSON.stringify({ password }) },
		);

		return await zodJsonParser(registerInstanceResponseDtoSchema)(response);
	};

	checkHealthAsync: IAuthServicePort["checkHealthAsync"] = async () => {
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), 3_000);

		try {
			const response = await this.deps.httpClient.getAsync(
				{ endpoint: "/api/health" },
				{ signal: controller.signal },
			);
			if (!response.ok) return null;
			return await zodJsonParser(serverHealthCheckResponseDtoSchema)(response);
		} finally {
			clearTimeout(timeout);
		}
	};
}
