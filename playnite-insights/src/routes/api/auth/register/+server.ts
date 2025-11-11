import { handleApiError } from '$lib/infra/api/handle-error';
import { registerInstanceCommandSchema } from '@playatlas/auth/core';
import { json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, url, locals: { services } }) => {
	try {
		const jsonBody = await request.json();
		const command = registerInstanceCommandSchema.parse(jsonBody);
		await services.authService.registerInstanceAsync(command.password);
		services.logService.success(`Instance registered`);
		return json({ status: 'OK' });
	} catch (error) {
		return handleApiError(error, services.logService, `${request.method} ${url.pathname}`);
	}
};
