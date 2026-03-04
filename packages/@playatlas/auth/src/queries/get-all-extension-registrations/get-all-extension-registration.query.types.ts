import type { IExtensionRegistrationMapperPort } from "../../application";
import type { GetExtensionRegistrationsResponseDto } from "../../dtos/extension-registration.response.dto";
import type { IExtensionRegistrationRepositoryPort } from "../../infra/extension-registration.repository.port";

export type GetAllExtensionRegistrationsQueryHandlerDeps = {
	extensionRegistrationRepository: IExtensionRegistrationRepositoryPort;
	extensionRegistrationMapper: IExtensionRegistrationMapperPort;
};

export type GetAllExtensionRegistrationsResult = GetExtensionRegistrationsResponseDto;
