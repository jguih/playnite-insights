export type CryptographyService = {
  hashPassword: (password: string) => Promise<{ salt: string; hash: string }>;
  verifyPassword: (
    password: string,
    args: { salt: string; hash: string }
  ) => boolean;
  createSessionId: () => string;
};
