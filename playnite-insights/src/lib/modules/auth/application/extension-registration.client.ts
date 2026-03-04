import { zodJsonParser, type IHttpClientPort } from "$lib/modules/common/application";
import {
	getExtensionRegistrationsResponseDto,
	type GetExtensionRegistrationsResponseDto,
} from "@playatlas/auth/dtos";

export type IExtensionRegistrationClient = {
	getAllAsync: () => Promise<GetExtensionRegistrationsResponseDto>;
};

export type ExtensionRegistrationClientDeps = {
	httpClient: IHttpClientPort;
};

export class ExtensionRegistrationClient implements IExtensionRegistrationClient {
	constructor(private readonly deps: ExtensionRegistrationClientDeps) {}

	getAllAsync: IExtensionRegistrationClient["getAllAsync"] = async () => {
		const response = await this.deps.httpClient.getAsync({
			endpoint: "/api/extension-registration",
		});

		return await zodJsonParser(getExtensionRegistrationsResponseDto)(response);
	};
}
