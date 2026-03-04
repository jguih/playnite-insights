import { ISODateSchema } from "@playatlas/common/common";
import z from "zod";

export const extensionRegistrationResponseDtoSchema = z.object({
	Id: z.number().brand("ExtensionRegistrationId"),
	ExtensionId: z.string(),
	PublicKey: z.string(),
	Hostname: z.string().nullable(),
	Os: z.string().nullable(),
	ExtensionVersion: z.string().nullable(),
	Status: z.enum(["pending", "trusted", "rejected"]),
	CreatedAt: ISODateSchema,
	LastUpdatedAt: ISODateSchema,
});

export type ExtensionRegistrationResponseDto = z.infer<
	typeof extensionRegistrationResponseDtoSchema
>;

export const getExtensionRegistrationsResponseDto = z.object({
	registrations: z.array(extensionRegistrationResponseDtoSchema),
});

export type GetExtensionRegistrationsResponseDto = z.infer<
	typeof getExtensionRegistrationsResponseDto
>;
