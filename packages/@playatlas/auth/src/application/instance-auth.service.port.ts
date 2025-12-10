export type InstanceAuthServiceVerifyResult = {
  reason: string;
  authorized: boolean;
};

export type InstanceAuthService = {
  verify: (args: { request: Request }) => InstanceAuthServiceVerifyResult;
};
