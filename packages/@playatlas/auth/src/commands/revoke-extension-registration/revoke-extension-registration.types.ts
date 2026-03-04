import type { IDomainEventBusPort, ILogServicePort } from "@playatlas/common/application";
import type {
	RevokeExtensionRegistrationFailedReasonCode,
	RevokeExtensionRegistrationSuccessReasonCode,
} from "../../domain/value-object/revoke-extension-registration-reason-code";
import type { IExtensionRegistrationRepositoryPort } from "../../infra/extension-registration.repository.port";

export type RevokeExtensionRegistrationCommandHandlerDeps = {
	extensionRegistrationRepository: IExtensionRegistrationRepositoryPort;
	logService: ILogServicePort;
	eventBus: IDomainEventBusPort;
};

export type RevokeExtensionRegistrationCommandResult =
	| {
			success: false;
			reason: string;
			reason_code: RevokeExtensionRegistrationFailedReasonCode;
	  }
	| {
			success: true;
			reason: string;
			reason_code: RevokeExtensionRegistrationSuccessReasonCode;
	  };
