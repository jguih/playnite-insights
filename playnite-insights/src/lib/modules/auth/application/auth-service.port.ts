import type { LoginInstanceResponseDto, RegisterInstanceResponseDto } from "@playatlas/auth/dtos";
import type { ServerHealthCheckResponseDto } from "@playatlas/common/dtos";

export type IAuthServicePort = {
	loginAsync: (props: { password: string }) => Promise<LoginInstanceResponseDto>;
	registerAsync: (props: { password: string }) => Promise<RegisterInstanceResponseDto>;
	checkHealthAsync: () => Promise<ServerHealthCheckResponseDto | null>;
};
