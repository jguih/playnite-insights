import z from "zod";
import { baseEntityPropsSchema } from "../../../common/src/domain/base-entity.props";
import { extensionRegistrationStatus } from "./extension-registration.constants";

export const makeExtensionRegistrationPropsSchema =
  baseEntityPropsSchema.extend({
    id: z.number().optional(),
    extensionId: z.string(),
    publicKey: z.string(),
    hostname: z.string().nullable(),
    os: z.string().nullable(),
    extensionVersion: z.string().nullable(),
    status: z.nativeEnum(extensionRegistrationStatus),
  });

export type MakeExtensionRegistrationProps = z.infer<
  typeof makeExtensionRegistrationPropsSchema
>;
