import { zodJsonParser, type IHttpClientPort } from "$lib/modules/common/application";
import {
	approveExtensionRegistrationResponseDtoSchema,
	rejectExtensionRegistrationResponseDtoSchema,
	removeExtensionRegistrationResponseDtoSchema,
	revokeExtensionRegistrationResponseDtoSchema,
	type ApproveExtensionRegistrationResponseDto,
	type ExtensionRegistrationResponseDto,
	type RejectExtensionRegistrationResponseDto,
	type RemoveExtensionRegistrationResponseDto,
	type RevokeExtensionRegistrationResponseDto,
} from "@playatlas/auth/dtos";

export type IExtensionAuthorizationServicePort = {
	authorizeAsync: (
		registrationId: ExtensionRegistrationResponseDto["Id"],
	) => Promise<ApproveExtensionRegistrationResponseDto>;
	rejectAsync: (
		registrationId: ExtensionRegistrationResponseDto["Id"],
	) => Promise<RejectExtensionRegistrationResponseDto>;
	revokeAsync: (
		registrationId: ExtensionRegistrationResponseDto["Id"],
	) => Promise<RevokeExtensionRegistrationResponseDto>;
	removeAsync: (
		registrationId: ExtensionRegistrationResponseDto["Id"],
	) => Promise<RemoveExtensionRegistrationResponseDto>;
};

export type ExtensionAuthorizationServiceDeps = {
	httpClient: IHttpClientPort;
};

export class ExtensionAuthorizationService implements IExtensionAuthorizationServicePort {
	constructor(private readonly deps: ExtensionAuthorizationServiceDeps) {}

	authorizeAsync: IExtensionAuthorizationServicePort["authorizeAsync"] = async (registrationId) => {
		const response = await this.deps.httpClient.postAsync({
			endpoint: `/api/extension-registration/${String(registrationId)}/approve`,
		});

		return await zodJsonParser(approveExtensionRegistrationResponseDtoSchema)(response);
	};

	rejectAsync: IExtensionAuthorizationServicePort["rejectAsync"] = async (registrationId) => {
		const response = await this.deps.httpClient.postAsync({
			endpoint: `/api/extension-registration/${String(registrationId)}/reject`,
		});

		return await zodJsonParser(rejectExtensionRegistrationResponseDtoSchema)(response);
	};

	revokeAsync: IExtensionAuthorizationServicePort["revokeAsync"] = async (registrationId) => {
		const response = await this.deps.httpClient.postAsync({
			endpoint: `/api/extension-registration/${String(registrationId)}/revoke`,
		});

		return await zodJsonParser(revokeExtensionRegistrationResponseDtoSchema)(response);
	};

	removeAsync: IExtensionAuthorizationServicePort["removeAsync"] = async (registrationId) => {
		const response = await this.deps.httpClient.postAsync({
			endpoint: `/api/extension-registration/${String(registrationId)}/remove`,
		});

		return await zodJsonParser(removeExtensionRegistrationResponseDtoSchema)(response);
	};
}
