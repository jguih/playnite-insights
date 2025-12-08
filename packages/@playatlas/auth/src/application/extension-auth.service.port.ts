export type ExtensionAuthService = {
  verify: (args: {
    headers: Headers;
    request: Request;
    url: URL;
    now: number;
  }) => boolean;
};
