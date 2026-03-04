import type { InstanceSessionId } from "../domain/value-object/instance-session-id";

export type InstanceAuthServiceVerifyResult = {
	reason: string;
	authenticated: boolean;
};

type RegisterResult =
	| {
			success: false;
			reason: string;
			reason_code: "instance_already_registered";
	  }
	| {
			success: true;
			reason: string;
			reason_code: "instance_registered";
	  };

type LoginResult =
	| {
			success: false;
			reason: string;
			reason_code: "instance_not_registered" | "not_authorized";
	  }
	| {
			success: true;
			reason: string;
			reason_code: "created_session_id";
			sessionId: InstanceSessionId;
	  };

export type IInstanceAuthServicePort = {
	verify: (args: { request: Request }) => InstanceAuthServiceVerifyResult;
	registerAsync: (props: { password: string }) => Promise<RegisterResult>;
	loginAsync: (props: { password: string }) => Promise<LoginResult>;
	isInstanceRegistered: () => boolean;
};
