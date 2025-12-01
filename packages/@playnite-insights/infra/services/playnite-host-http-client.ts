import { type SignatureService } from "@playnite-insights/core";
import { FetchClient, type IFetchClient } from "@playnite-insights/lib/client";

export type PlayniteHostClientDeps = {
  signatureService: SignatureService;
  PLAYNITE_HOST_ADDRESS: string;
};

export const makePlayniteHostClient = (
  deps: PlayniteHostClientDeps
): { httpPostAsync: IFetchClient["httpPostAsync"] } => {
  const { PLAYNITE_HOST_ADDRESS, signatureService } = deps;

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
