import type { CryptographyService } from "@playnite-insights/core";
import * as bcrypt from "bcrypt";

export const makeCryptographyService = (): CryptographyService => {
  const hashPasswordAsync: CryptographyService["hashPasswordAsync"] = async (
    password
  ) => {
    const pass = await bcrypt.hash(password, 10);
    return pass;
  };

  return { hashPasswordAsync };
};
