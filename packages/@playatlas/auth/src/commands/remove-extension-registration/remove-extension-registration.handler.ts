import {
	type ICommandHandlerPort,
	type IDomainEventBusPort,
	type ILogServicePort,
} from "@playatlas/common/application";
import type {
	RemoveExtensionRegistrationFailedReasonCode,
	RemoveExtensionRegistrationSuccessReasonCode,
} from "../../domain/value-object/remove-extension-registration-reason-code";
import { type IExtensionRegistrationRepositoryPort } from "../../infra/extension-registration.repository.port";
import { type RemoveExtensionRegistrationCommand } from "./remove-extension-registration.command";

export type RemoveExtensionRegistrationServiceDeps = {
	extensionRegistrationRepository: IExtensionRegistrationRepositoryPort;
	logService: ILogServicePort;
	eventBus: IDomainEventBusPort;
};

export type RemoveExtensionRegistrationServiceResult =
	| {
			success: false;
			reason: string;
			reason_code: RemoveExtensionRegistrationFailedReasonCode;
	  }
	| {
			success: true;
			reason: string;
			reason_code: RemoveExtensionRegistrationSuccessReasonCode;
	  };

export type IRemoveExtensionRegistrationCommandHandlerPort = ICommandHandlerPort<
	RemoveExtensionRegistrationCommand,
	RemoveExtensionRegistrationServiceResult
>;

export const makeRemoveExtensionRegistrationHandler = ({
	logService,
	extensionRegistrationRepository,
	eventBus,
}: RemoveExtensionRegistrationServiceDeps): IRemoveExtensionRegistrationCommandHandlerPort => {
	return {
		execute: (command) => {
			const existing = extensionRegistrationRepository.getById(command.registrationId);

			if (!existing)
				return {
					success: false,
					reason_code: "not_found",
					reason: `Extension registration with id ${command.registrationId} not found`,
				};

			extensionRegistrationRepository.remove(existing.getId());

			logService.info(
				`Deleted extension registration (Id: ${existing.getId()}, ExtensionId: ${existing.getExtensionId()})`,
			);

			eventBus.emit({
				id: crypto.randomUUID(),
				name: "extension-registration-removed",
				occurredAt: new Date(),
				payload: { registrationId: existing.getId() },
			});

			return {
				success: true,
				reason_code: "extension-registration-removed",
				reason: "Removed",
			};
		},
	};
};
