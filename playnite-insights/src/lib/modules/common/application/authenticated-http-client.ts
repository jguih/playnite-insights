import type { ISessionIdProviderPort } from "$lib/modules/auth/application";
import { NotAuthenticatedError } from "../errors";
import type { IHttpClientPort } from "./http-client.port";

export type AuthenticatedHttpClientDeps = {
	httpClient: IHttpClientPort;
	sessionIdProvider: ISessionIdProviderPort;
};

export class AuthenticatedHttpClient implements IHttpClientPort {
	private readonly inner: IHttpClientPort;
	private readonly sessionIdProvider: ISessionIdProviderPort;

	constructor({ httpClient, sessionIdProvider }: AuthenticatedHttpClientDeps) {
		this.inner = httpClient;
		this.sessionIdProvider = sessionIdProvider;
	}

	private getAuthorizationHeader = () => {
		const sessionId = this.sessionIdProvider.get();
		if (sessionId) {
			return { Authorization: `Bearer ${sessionId}` };
		}
	};

	getAsync: IHttpClientPort["getAsync"] = async (props, extra = {}) => {
		const authHeader = this.getAuthorizationHeader();
		const response = await this.inner.getAsync(props, {
			...extra,
			headers: { ...extra.headers, ...authHeader },
		});
		if (response.status === 401) throw new NotAuthenticatedError();
		return response;
	};

	postAsync: IHttpClientPort["postAsync"] = async (props, extra = {}) => {
		const authHeader = this.getAuthorizationHeader();
		const response = await this.inner.postAsync(props, {
			...extra,
			headers: { ...extra.headers, ...authHeader },
		});
		if (response.status === 401) throw new NotAuthenticatedError();
		return response;
	};

	putAsync: IHttpClientPort["putAsync"] = async (props, extra = {}) => {
		const authHeader = this.getAuthorizationHeader();
		const response = await this.inner.putAsync(props, {
			...extra,
			headers: { ...extra.headers, ...authHeader },
		});
		if (response.status === 401) throw new NotAuthenticatedError();
		return response;
	};

	deleteAsync: IHttpClientPort["deleteAsync"] = async (props, extra = {}) => {
		const authHeader = this.getAuthorizationHeader();
		const response = await this.inner.deleteAsync(props, {
			...extra,
			headers: { ...extra.headers, ...authHeader },
		});
		if (response.status === 401) throw new NotAuthenticatedError();
		return response;
	};
}
