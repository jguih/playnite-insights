import z from "zod";
import { extensionRegistrationSchema } from "./schemas";

export type ExtensionRegistration = z.infer<typeof extensionRegistrationSchema>;
