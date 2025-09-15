import { SignatureService } from "@playnite-insights/core";
import { FetchClient, IFetchClient } from "@playnite-insights/lib/client";
import * as config from "../config/config";
import { defaultSignatureService } from "./signature";

export type PlayniteHostClientDeps = {
  signatureService: SignatureService;
  PLAYNITE_HOST_ADDRESS?: string;
};

export const makePlayniteHostClient = (
  deps: Partial<PlayniteHostClientDeps>
): { httpPostAsync: IFetchClient["httpPostAsync"] } => {
  const { PLAYNITE_HOST_ADDRESS, signatureService }: PlayniteHostClientDeps = {
    signatureService: defaultSignatureService,
    PLAYNITE_HOST_ADDRESS: config.PLAYNITE_HOST_ADDRESS,
    ...deps,
  };

  const client = new FetchClient({ url: PLAYNITE_HOST_ADDRESS ?? "" });

  const httpPostAsync: IFetchClient["httpPostAsync"] = async (args) => {
    const payload = JSON.stringify(args.body);
    const signature = await signatureService.signAsync(payload);
    return client.httpPostAsync({
      ...args,
      headers: {
        "X-Signature": signature,
      },
    });
  };

  return { httpPostAsync };
};
