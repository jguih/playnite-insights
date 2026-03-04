import type { ServerHealthCheckResponseDto } from "@playatlas/common/dtos";

export type AuthFlowLoginResult =
	| {
			success: true;
			reason_code: "logged_in";
	  }
	| {
			success: false;
			reason_code:
				| "invalid_credentials"
				| "instance_not_registered"
				| "validation_error"
				| "network_error"
				| "unknown_error";
	  };

export type AuthFlowRegisterResult =
	| { success: true; reason_code: "registered" }
	| {
			success: false;
			reason_code:
				| "validation_error"
				| "network_error"
				| "instance_already_registered"
				| "unknown_error";
	  };

export interface IAuthFlowPort {
	loginAsync: (props: { password: string }) => Promise<AuthFlowLoginResult>;
	registerAsync: (props: { password: string }) => Promise<AuthFlowRegisterResult>;
	checkHealthAsync: () => Promise<ServerHealthCheckResponseDto | null>;
}
