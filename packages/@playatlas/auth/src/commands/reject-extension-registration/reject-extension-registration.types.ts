import type { IDomainEventBusPort, ILogServicePort } from "@playatlas/common/application";
import type {
	RejectExtensionRegistrationFailedReasonCode,
	RejectExtensionRegistrationSuccessReasonCode,
} from "../../domain/value-object/reject-extension-registration-reason-code";
import type { IExtensionRegistrationRepositoryPort } from "../../infra/extension-registration.repository.port";

export type RejectExtensionRegistrationCommandHandlerDeps = {
	extensionRegistrationRepository: IExtensionRegistrationRepositoryPort;
	logService: ILogServicePort;
	eventBus: IDomainEventBusPort;
};

export type RejectExtensionRegistrationCommandResult =
	| {
			success: false;
			reason: string;
			reason_code: RejectExtensionRegistrationFailedReasonCode;
	  }
	| {
			success: true;
			reason: string;
			reason_code: RejectExtensionRegistrationSuccessReasonCode;
	  };
