import { faker } from "@faker-js/faker";
import { RejectExtensionRegistrationCommand } from "@playatlas/auth/commands";
import { api, factory } from "../../vitest.setup";

describe("Approve Extension Registration Command", () => {
  it("rejects a pending extension registration", () => {
    // Arrange
    const registration = factory.getExtensionRegistrationFactory().build();
    api.auth.getExtensionRegistrationRepository().add(registration);
    const command: RejectExtensionRegistrationCommand = {
      registrationId: registration.getId(),
    };
    // Act
    const result = api.auth.commands
      .getRejectExtensionRegistrationCommandHandler()
      .execute(command);
    const updatedRegistration = api.auth
      .getExtensionRegistrationRepository()
      .getById(registration.getId());
    // Assert
    expect(result.success).toBe(true);
    expect(updatedRegistration).toBeTruthy();
    expect(updatedRegistration?.isRejected()).toBe(true);
  });

  it("returns false when a registration doesn't exist", () => {
    // Arrange
    const command: RejectExtensionRegistrationCommand = {
      registrationId: faker.number.int(),
    };
    // Act
    const result = api.auth.commands
      .getRejectExtensionRegistrationCommandHandler()
      .execute(command);
    // Assert
    expect(result.success).toBe(false);
    expect(result.reason_code === "not_found").toBe(true);
  });

  it("returns false when trying to reject an approved registration", () => {
    // Arrange
    const registration = factory.getExtensionRegistrationFactory().build();
    registration.approve();
    api.auth.getExtensionRegistrationRepository().add(registration);
    const command: RejectExtensionRegistrationCommand = {
      registrationId: registration.getId(),
    };
    // Act
    const result = api.auth.commands
      .getRejectExtensionRegistrationCommandHandler()
      .execute(command);
    const updatedRegistration = api.auth
      .getExtensionRegistrationRepository()
      .getById(registration.getId());
    // Assert
    expect(result.success).toBe(false);
    expect(updatedRegistration).toBeTruthy();
    expect(updatedRegistration?.isRejected()).toBe(false);
  });

  it("returns false when trying to a reject an already rejected registration", () => {
    // Arrange
    const registration = factory.getExtensionRegistrationFactory().build();
    registration.reject();
    api.auth.getExtensionRegistrationRepository().add(registration);
    const command: RejectExtensionRegistrationCommand = {
      registrationId: registration.getId(),
    };
    // Act
    const result = api.auth.commands
      .getRejectExtensionRegistrationCommandHandler()
      .execute(command);
    const updatedRegistration = api.auth
      .getExtensionRegistrationRepository()
      .getById(registration.getId());
    // Assert
    expect(result.success).toBe(false);
    expect(updatedRegistration).toBeTruthy();
    expect(updatedRegistration?.isRejected()).toBe(true);
  });
});
