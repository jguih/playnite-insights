import type { IDomainEventBusPort, ILogServicePort } from "@playatlas/common/application";
import type {
	ApproveExtensionRegistrationFailedReasonCode,
	ApproveExtensionRegistrationSuccessReasonCode,
} from "../../domain";
import type { IExtensionRegistrationRepositoryPort } from "../../infra";

export type ApproveExtensionRegistrationServiceDeps = {
	extensionRegistrationRepository: IExtensionRegistrationRepositoryPort;
	logService: ILogServicePort;
	eventBus: IDomainEventBusPort;
};

export type ApproveExtensionRegistrationCommandResult =
	| {
			success: false;
			reason: string;
			reason_code: ApproveExtensionRegistrationFailedReasonCode;
	  }
	| {
			success: true;
			reason: string;
			reason_code: ApproveExtensionRegistrationSuccessReasonCode;
	  };
