import type { CryptographyService } from "@playnite-insights/core";
import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

export type CryptographyServiceDeps = {};

export const makeCryptographyService = (
  deps: CryptographyServiceDeps = {}
): CryptographyService => {
  const hashPasswordAsync: CryptographyService["hashPasswordAsync"] = async (
    password
  ) => {
    const salt = randomBytes(256);
    const derivedKey = scryptSync(password, salt, 64);
    return { salt: salt.toString("hex"), hash: derivedKey.toString("hex") };
  };

  const verifyPassword: CryptographyService["verifyPassword"] = (
    password,
    { hash, salt }
  ) => {
    const derivedKey = scryptSync(password, Buffer.from(salt, "hex"), 64);
    return timingSafeEqual(Buffer.from(hash, "hex"), derivedKey);
  };

  const createSessionId: CryptographyService["createSessionId"] = () => {
    return randomBytes(32).toString("hex");
  };

  return { hashPasswordAsync, verifyPassword, createSessionId };
};
