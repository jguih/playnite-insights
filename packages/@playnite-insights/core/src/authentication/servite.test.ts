import {
  ExtensionRegistration,
  ValidAuthenticationHeader,
} from "@playnite-insights/lib/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeMocks } from "../../tests/mocks";
import { makeAuthenticationService } from "./service";
import type {
  AuthenticationService,
  AuthenticationServiceDeps,
} from "./service.types";

const createDeps = () => {
  return {
    ...makeMocks(),
  } satisfies AuthenticationServiceDeps;
};

let deps: ReturnType<typeof createDeps>;
let service: AuthenticationService;
let now: number = Date.now();

describe("Authentication service", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    deps = createDeps();
    service = makeAuthenticationService(deps);
    now = Date.now();
  });

  it.each([
    {
      // Invalid signature
      "X-ExtensionId": "1",
      "X-Signature": null,
      "X-Timestamp": new Date(now).toISOString(),
      "X-ContentHash": null,
      "X-RegistrationId": "1",
    },
    {
      // Invalid timestamp
      "X-ExtensionId": "1",
      "X-Signature": crypto.randomUUID(),
      "X-Timestamp": null,
      "X-ContentHash": null,
      "X-RegistrationId": "1",
    },
    {
      // Invalid registration Id
      "X-ExtensionId": crypto.randomUUID(),
      "X-Signature": crypto.randomUUID(),
      "X-Timestamp": new Date(now).toISOString(),
      "X-ContentHash": null,
      "X-RegistrationId": null,
    },
    {
      // Invalid timestamp
      "X-ExtensionId": "1",
      "X-Signature": crypto.randomUUID(),
      "X-Timestamp": new Date(now - 6 * 60 * 1000).toISOString(), // 6 mins in the past
      "X-ContentHash": null,
      "X-RegistrationId": "1",
    },
    {
      // Invalid timestamp
      "X-ExtensionId": "1",
      "X-Signature": crypto.randomUUID(),
      "X-Timestamp": new Date(now + 1 * 60 * 1000).toISOString(), // in the future
      "X-ContentHash": null,
      "X-RegistrationId": "1",
    },
    {
      // Invalid timestamp
      "X-ExtensionId": "1",
      "X-Signature": crypto.randomUUID(),
      "X-Timestamp": new Date(now - 5 * 60 * 1000).toISOString(), // exactly 5 min in the past (limit)
      "X-ContentHash": null,
      "X-RegistrationId": "1",
    },
  ] as Record<ValidAuthenticationHeader, string | null>[])(
    "when verifying extension authorization, rejects with invalid headers",
    (headers) => {
      // Arrange
      deps.extensionRegistrationRepository.getByExtensionId.mockReturnValueOnce(
        {
          CreatedAt: new Date(now).toISOString(),
          LastUpdatedAt: new Date(now).toISOString(),
          ExtensionId: crypto.randomUUID(),
          ExtensionVersion: "1",
          Hostname: "TESTPC",
          Id: 1,
          Os: "WINDOWS11",
          PublicKey: crypto.randomUUID(),
          Status: "trusted",
        } as ExtensionRegistration
      );
      deps.signatureService.verifyExtensionSignature.mockReturnValueOnce(true);
      // Act
      const isAuthorized = service.verifyExtensionAuthorization({
        headers,
        request: { method: "GET" },
        url: { pathname: "/api/test" },
        now,
      });
      // Assert
      expect(isAuthorized).toBeFalsy();
      expect(
        deps.extensionRegistrationRepository.getByExtensionId
      ).not.toHaveBeenCalled();
      expect(
        deps.signatureService.verifyExtensionSignature
      ).not.toHaveBeenCalled();
    }
  );

  it("when verifying extension authorization, authorize with valid headers", () => {
    // Arrange
    const extensionId = crypto.randomUUID();
    const registrationId = "1";
    const headers: Record<ValidAuthenticationHeader, string | null> = {
      "X-ExtensionId": extensionId,
      "X-Signature": crypto.randomUUID(),
      "X-Timestamp": new Date(now).toISOString(),
      "X-ContentHash": null,
      "X-RegistrationId": registrationId,
    };
    deps.extensionRegistrationRepository.getByRegistrationId.mockReturnValueOnce(
      {
        CreatedAt: new Date(now).toISOString(),
        LastUpdatedAt: new Date(now).toISOString(),
        ExtensionId: extensionId,
        ExtensionVersion: "1",
        Hostname: "TESTPC",
        Id: Number(registrationId),
        Os: "WINDOWS11",
        PublicKey: crypto.randomUUID(),
        Status: "trusted",
      } as ExtensionRegistration
    );
    deps.signatureService.verifyExtensionSignature.mockReturnValueOnce(true);
    // Act
    const isAuthorized = service.verifyExtensionAuthorization({
      headers,
      request: { method: "GET" },
      url: { pathname: "/api/test" },
      now,
    });
    // Assert
    expect(isAuthorized).toBeTruthy();
    expect(
      deps.extensionRegistrationRepository.getByRegistrationId
    ).toHaveBeenCalledOnce();
    expect(
      deps.signatureService.verifyExtensionSignature
    ).toHaveBeenCalledOnce();
  });

  it("on POST or PUT, reject when X-ContentHash header is null", () => {
    // Arrange
    const extensionId = crypto.randomUUID();
    const registrationId = "1";
    const headers: Record<ValidAuthenticationHeader, string | null> = {
      "X-ExtensionId": extensionId,
      "X-Signature": crypto.randomUUID(),
      "X-Timestamp": new Date(now).toISOString(),
      "X-ContentHash": null,
      "X-RegistrationId": registrationId,
    };
    deps.extensionRegistrationRepository.getByRegistrationId.mockReturnValueOnce(
      {
        CreatedAt: new Date(now).toISOString(),
        LastUpdatedAt: new Date(now).toISOString(),
        ExtensionId: extensionId,
        ExtensionVersion: "1",
        Hostname: "TESTPC",
        Id: Number(registrationId),
        Os: "WINDOWS11",
        PublicKey: crypto.randomUUID(),
        Status: "trusted",
      } as ExtensionRegistration
    );
    deps.signatureService.verifyExtensionSignature.mockReturnValueOnce(true);
    // Act
    const isAuthorized = service.verifyExtensionAuthorization({
      headers,
      request: { method: "POST" },
      url: { pathname: "/api/test" },
      now,
    });
    // Assert
    expect(isAuthorized).toBeFalsy();
    expect(
      deps.extensionRegistrationRepository.getByRegistrationId
    ).not.toHaveBeenCalledOnce();
    expect(
      deps.signatureService.verifyExtensionSignature
    ).not.toHaveBeenCalledOnce();
  });
});
