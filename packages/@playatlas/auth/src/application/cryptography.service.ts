import { LogService } from "@playatlas/common/application";
import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { CryptographyService } from "./cryptography.service.port";

export type CryptographyServiceDeps = {
  logService: LogService;
};

export const makeCryptographyService = ({
  logService,
}: CryptographyServiceDeps): CryptographyService => {
  const hashPassword: CryptographyService["hashPassword"] = async (
    password
  ) => {
    const salt = randomBytes(256);
    const derivedKey = scryptSync(password, salt, 64);
    logService.debug(`Created password`);
    return { salt: salt.toString("hex"), hash: derivedKey.toString("hex") };
  };

  const verifyPassword: CryptographyService["verifyPassword"] = (
    password,
    { hash, salt }
  ) => {
    const derivedKey = scryptSync(password, Buffer.from(salt, "hex"), 64);
    const valid = timingSafeEqual(Buffer.from(hash, "hex"), derivedKey);
    if (!valid) logService.warning(`Invalid password detected`);
    else logService.debug(`Password verification successful`);
    return valid;
  };

  const createSessionId: CryptographyService["createSessionId"] = () => {
    logService.debug(`Created session id`);
    return randomBytes(32).toString("hex");
  };

  return { hashPassword, verifyPassword, createSessionId };
};
