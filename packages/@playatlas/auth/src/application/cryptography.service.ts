import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { CryptographyService } from "./cryptography.service.port";

export const makeCryptographyService = (): CryptographyService => {
  const SESSION_ID_LENGTH = 32;

  const hashPassword: CryptographyService["hashPassword"] = async (
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
    return randomBytes(SESSION_ID_LENGTH).toString("hex");
  };

  const compareSessionIds: CryptographyService["compareSessionIds"] = (
    id1,
    id2
  ) => {
    const buf1 = Buffer.from(id1, "hex");
    const buf2 = Buffer.from(id2, "hex");

    if (
      buf1.length !== SESSION_ID_LENGTH ||
      buf2.length !== SESSION_ID_LENGTH
    ) {
      return false;
    }

    return timingSafeEqual(buf1, buf2);
  };

  return { hashPassword, verifyPassword, createSessionId, compareSessionIds };
};
