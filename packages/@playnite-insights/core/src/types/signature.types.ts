export type SignatureService = {
  generateKeyPairAsync: () => Promise<void>;
  signAsync: (data: string) => Promise<string>;
};
