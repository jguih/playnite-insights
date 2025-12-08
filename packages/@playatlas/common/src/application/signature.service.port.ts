export type SignatureService = {
  generateAsymmetricKeyPair: () => Promise<void>;
  sign: (data: string) => Promise<string>;
  verify: (props: {
    publicKey: string;
    signature: string;
    payload: string;
  }) => boolean;
};
