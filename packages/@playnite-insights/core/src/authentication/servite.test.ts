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
      "X-ExtensionId": null,
      "X-Signature": null,
      "X-Timestamp": String(Date.now()),
      "X-ContentHash": null,
    },
    {
      "X-ExtensionId": null,
      "X-Signature": crypto.randomUUID(),
      "X-Timestamp": null,
      "X-ContentHash": null,
    },
    {
      "X-ExtensionId": crypto.randomUUID(),
      "X-Signature": null,
      "X-Timestamp": null,
      "X-ContentHash": null,
    },
    {
      "X-ExtensionId": "1",
      "X-Signature": crypto.randomUUID(),
      "X-Timestamp": new Date(now - 6 * 60 * 1000).toISOString(), // 6 mins in the past
      "X-ContentHash": null,
    },
    {
      "X-ExtensionId": "1",
      "X-Signature": crypto.randomUUID(),
      "X-Timestamp": new Date(now + 1 * 60 * 1000).toISOString(), // in the future
      "X-ContentHash": null,
    },
    {
      "X-ExtensionId": "1",
      "X-Signature": crypto.randomUUID(),
      "X-Timestamp": new Date(now - 5 * 60 * 1000).toISOString(), // exactly 5 min in the past (limit)
      "X-ContentHash": null,
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
    const headers: Record<ValidAuthenticationHeader, string | null> = {
      "X-ExtensionId": "1",
      "X-Signature": crypto.randomUUID(),
      "X-Timestamp": new Date(now).toISOString(),
      "X-ContentHash": null,
    };
    deps.extensionRegistrationRepository.getByExtensionId.mockReturnValueOnce({
      CreatedAt: new Date(now).toISOString(),
      LastUpdatedAt: new Date(now).toISOString(),
      ExtensionId: crypto.randomUUID(),
      ExtensionVersion: "1",
      Hostname: "TESTPC",
      Id: 1,
      Os: "WINDOWS11",
      PublicKey: crypto.randomUUID(),
      Status: "trusted",
    } as ExtensionRegistration);
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
      deps.extensionRegistrationRepository.getByExtensionId
    ).toHaveBeenCalledOnce();
    expect(
      deps.signatureService.verifyExtensionSignature
    ).toHaveBeenCalledOnce();
  });

  it("on POST or PUT, reject when X-ContentHash header is null", () => {
    // Arrange
    const headers: Record<ValidAuthenticationHeader, string | null> = {
      "X-ExtensionId": "1",
      "X-Signature": crypto.randomUUID(),
      "X-Timestamp": new Date(now).toISOString(),
      "X-ContentHash": null,
    };
    deps.extensionRegistrationRepository.getByExtensionId.mockReturnValueOnce({
      CreatedAt: new Date(now).toISOString(),
      LastUpdatedAt: new Date(now).toISOString(),
      ExtensionId: crypto.randomUUID(),
      ExtensionVersion: "1",
      Hostname: "TESTPC",
      Id: 1,
      Os: "WINDOWS11",
      PublicKey: crypto.randomUUID(),
      Status: "trusted",
    } as ExtensionRegistration);
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
      deps.extensionRegistrationRepository.getByExtensionId
    ).not.toHaveBeenCalledOnce();
    expect(
      deps.signatureService.verifyExtensionSignature
    ).not.toHaveBeenCalledOnce();
  });
});
