import { ApproveExtensionRegistrationCommand } from "@playatlas/auth/commands";
import { api, factory } from "../../vitest.setup";

describe("Approve Extension Registration Command", () => {
  it("approves a valid extension registration", () => {
    // Arrange
    const registration = factory.getExtensionRegistrationFactory().build();
    api.auth.getExtensionRegistrationRepository().add(registration);
    const command: ApproveExtensionRegistrationCommand = {
      registrationId: registration.getId(),
    };
    // Act
    const result = api.auth.commands
      .getApproveExtensionRegistrationCommandHandler()
      .execute(command);
    const updatedRegistration = api.auth
      .getExtensionRegistrationRepository()
      .getById(registration.getId());
    // Assert
    expect(result.success).toBe(true);
    expect(updatedRegistration).toBeTruthy();
    expect(updatedRegistration?.isTrusted()).toBe(true);
  });

  it("returns false when trying to a approve an already approved registration", () => {
    // Arrange
    const registration = factory.getExtensionRegistrationFactory().build();
    registration.approve();
    api.auth.getExtensionRegistrationRepository().add(registration);
    const command: ApproveExtensionRegistrationCommand = {
      registrationId: registration.getId(),
    };
    // Act
    const result = api.auth.commands
      .getApproveExtensionRegistrationCommandHandler()
      .execute(command);
    const updatedRegistration = api.auth
      .getExtensionRegistrationRepository()
      .getById(registration.getId());
    // Assert
    expect(result.success).toBe(false);
    expect(updatedRegistration).toBeTruthy();
    expect(updatedRegistration?.isTrusted()).toBe(true);
  });

  it("returns false when trying to a approve a rejected registration", () => {
    // Arrange
    const registration = factory.getExtensionRegistrationFactory().build();
    registration.reject();
    api.auth.getExtensionRegistrationRepository().add(registration);
    const command: ApproveExtensionRegistrationCommand = {
      registrationId: registration.getId(),
    };
    // Act
    const result = api.auth.commands
      .getApproveExtensionRegistrationCommandHandler()
      .execute(command);
    const updatedRegistration = api.auth
      .getExtensionRegistrationRepository()
      .getById(registration.getId());
    // Assert
    expect(result.success).toBe(false);
    expect(updatedRegistration).toBeTruthy();
    expect(updatedRegistration?.isTrusted()).toBe(false);
  });
});
