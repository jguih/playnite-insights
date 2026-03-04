import z from "zod";

export const serverHealthCheckResponseDtoSchema = z.object({
	status: z.enum(["ok"]),
	instanceRegistrationStatus: z.enum(["registered", "not_registered"]),
});

export type ServerHealthCheckResponseDto = z.infer<typeof serverHealthCheckResponseDtoSchema>;
