import { ExtensionRegistration } from "@playnite-insights/lib/client";

export type SignatureService = {
  generateKeyPairAsync: () => Promise<void>;
  signAsync: (data: string) => Promise<string>;
  verifyExtensionSignature: (args: {
    registration: ExtensionRegistration;
    signatureBase64: string;
    payload: string;
  }) => boolean;
};
