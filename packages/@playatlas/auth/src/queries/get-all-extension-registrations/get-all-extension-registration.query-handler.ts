import type { IQueryHandlerPort } from "@playatlas/common/application";
import type { GetAllExtensionRegistrationQuery } from "./get-all-extension-registration.query";
import type {
	GetAllExtensionRegistrationsQueryHandlerDeps,
	GetAllExtensionRegistrationsResult,
} from "./get-all-extension-registration.query.types";

export type IGetAllExtensionRegistrationsQueryHandlerPort = IQueryHandlerPort<
	GetAllExtensionRegistrationQuery,
	GetAllExtensionRegistrationsResult
>;

export const makeGetAllExtensionRegistrationsQueryHandler = ({
	extensionRegistrationRepository,
	extensionRegistrationMapper,
}: GetAllExtensionRegistrationsQueryHandlerDeps): IGetAllExtensionRegistrationsQueryHandlerPort => {
	return {
		execute: () => {
			const registrations = extensionRegistrationRepository.all();
			const registrationDtos = extensionRegistrationMapper.toDtoList(registrations);

			return { registrations: registrationDtos };
		},
	};
};
