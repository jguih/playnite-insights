import {
  ApiError,
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
    deps.extensionRegistrationRepository.getByExtensionId.mockReturnValueOnce(
      {}
    );
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
});
