import { validAuthenticationHeaders } from "./schemas";

export type ValidAuthenticationHeader = keyof typeof validAuthenticationHeaders;
