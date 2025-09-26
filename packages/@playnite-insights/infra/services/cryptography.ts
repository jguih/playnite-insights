import type { CryptographyService } from "@playnite-insights/core";
import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

export type CryptographyServiceDeps = {};

export const makeCryptographyService = (
  deps: CryptographyServiceDeps
): CryptographyService => {
  const hashPasswordAsync: CryptographyService["hashPasswordAsync"] = async (
    password
  ) => {
    const salt = randomBytes(256);
    const derivedKey = scryptSync(password, salt, 64);
    return { salt: salt.toString("hex"), hash: derivedKey.toString("hex") };
  };

  const verifyInstancePassword: CryptographyService["verifyInstancePassword"] =
    (password) => {
      const salt = "";
      const hash = "";
      const derivedKey = scryptSync(password, Buffer.from(salt, "hex"), 64);
      return timingSafeEqual(Buffer.from(hash, "hex"), derivedKey);
    };

  return { hashPasswordAsync, verifyInstancePassword };
};
