import type { ServerHealthCheckResponseDto } from "@playatlas/common/dtos";
import { json, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ locals: { api } }) => {
	const registered = api.auth.getInstanceAuthService().isInstanceRegistered();

	return json({
		status: "ok",
		instanceRegistrationStatus: registered ? "registered" : "not_registered",
	} satisfies ServerHealthCheckResponseDto);
};
