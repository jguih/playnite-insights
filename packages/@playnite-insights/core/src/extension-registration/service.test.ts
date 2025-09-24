import {
  ApiError,
  ExtensionRegistration,
  RegisterExtensionCommand,
} from "@playnite-insights/lib/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeMocks } from "../../tests/mocks";
import { makeExtensionRegistrationService } from "./service";
import {
  ExtensionRegistrationService,
  ExtensionRegistrationServiceDeps,
} from "./service.types";

const createDeps = () => {
  return { ...makeMocks() } satisfies ExtensionRegistrationServiceDeps;
};

let deps: ReturnType<typeof createDeps>;
let service: ExtensionRegistrationService;

describe("Extension Registration Service", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    deps = createDeps();
    service = makeExtensionRegistrationService(deps);
  });

  it("on register, does not create new a registration if one already exists", () => {
    // Arrange
    const now = new Date();
    const command: RegisterExtensionCommand = {
      ExtensionId: crypto.randomUUID(),
      PublicKey: "",
      Timestamp: now.toISOString(),
      ExtensionVersion: crypto.randomUUID(),
      Hostname: "TESTHOST",
      Os: "Windows 12",
    };
    deps.extensionRegistrationRepository.getByExtensionId.mockReturnValueOnce({
      Id: 0,
      Status: "trusted",
      ExtensionId: "",
      PublicKey: "",
      Hostname: null,
      Os: null,
      ExtensionVersion: null,
      CreatedAt: "",
      LastUpdatedAt: "",
    } satisfies ExtensionRegistration);
    // Act & Assert
    expect(() => service.register(command)).toThrow(ApiError);
  });

  it("on register, create new registration", () => {
    // Arrange
    const now = new Date();
    const command: RegisterExtensionCommand = {
      ExtensionId: crypto.randomUUID(),
      PublicKey: "",
      Timestamp: now.toISOString(),
      ExtensionVersion: crypto.randomUUID(),
      Hostname: "TESTHOST",
      Os: "Windows 12",
    };
    deps.extensionRegistrationRepository.getByExtensionId.mockReturnValueOnce(
      null
    );
    deps.extensionRegistrationRepository.add.mockImplementationOnce(() => {});
    // Act
    service.register(command);
    // Assert
    expect(deps.extensionRegistrationRepository.add).toHaveBeenCalledOnce();
  });

  it("on register, create new registration when one already exists but is rejected", () => {
    // Arrange
    const now = new Date();
    const command: RegisterExtensionCommand = {
      ExtensionId: crypto.randomUUID(),
      PublicKey: "",
      Timestamp: now.toISOString(),
      ExtensionVersion: crypto.randomUUID(),
      Hostname: "TESTHOST",
      Os: "Windows 12",
    };
    deps.extensionRegistrationRepository.getByExtensionId.mockReturnValueOnce({
      Id: 0,
      Status: "rejected",
      ExtensionId: "",
      PublicKey: "",
      Hostname: null,
      Os: null,
      ExtensionVersion: null,
      CreatedAt: "",
      LastUpdatedAt: "",
    } satisfies ExtensionRegistration);
    deps.extensionRegistrationRepository.add.mockImplementationOnce(() => {});
    deps.extensionRegistrationRepository.remove.mockImplementationOnce(
      () => {}
    );
    // Act
    service.register(command);
    // Assert
    expect(deps.extensionRegistrationRepository.remove).toHaveBeenCalledOnce();
    expect(deps.extensionRegistrationRepository.add).toHaveBeenCalledOnce();
  });
});
