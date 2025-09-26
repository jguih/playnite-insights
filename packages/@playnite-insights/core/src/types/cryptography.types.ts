export type CryptographyService = {
  hashPasswordAsync: (
    password: string
  ) => Promise<{ salt: string; hash: string }>;
  verifyInstancePassword: (password: string) => boolean;
};
