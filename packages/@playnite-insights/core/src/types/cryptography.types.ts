export type CryptographyService = {
  hashPasswordAsync: (password: string) => Promise<string>;
};
