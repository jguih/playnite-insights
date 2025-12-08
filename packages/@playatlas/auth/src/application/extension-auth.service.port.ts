export type ExtensionAuthService = {
  verify: (args: {
    request: Request;
    utcNow: number;
  }) => Promise<{ reason: string; body?: string; authorized: boolean }>;
};

export type ExtensionAuthServiceVerifyResult = {
  reason: string;
  body?: string;
  authorized: boolean;
};
