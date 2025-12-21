import { faker } from "@faker-js/faker";
import {
  extensionRegistrationStatus,
  type ExtensionRegistration,
} from "@playatlas/auth/domain";
import { api, factory } from "../vitest.global.setup";

const repository = api.auth.getExtensionRegistrationRepository();

const compareRegistrations = (
  registration1: ExtensionRegistration,
  registration2: ExtensionRegistration
) => {
  expect(registration1?.getId()).toBe(registration2.getId());
  expect(registration1?.getExtensionId()).toBe(registration2.getExtensionId());
  expect(registration1.getExtensionVersion()).toBe(
    registration2.getExtensionVersion()
  );
  expect(registration1.getOs()).toBe(registration2.getOs());
  expect(registration1.getPublicKey()).toBe(registration2.getPublicKey());
  expect(registration1.getStatus()).toBe(registration2.getStatus());
};

describe("Extension Registration Repository", () => {
  it("adds a new registration and get it by its id", () => {
    // Arrange
    const registration = factory.getExtensionRegistrationFactory().build();
    // Act
    repository.add(registration);
    const addedRegistration = repository.getById(registration.getId());
    // Assert
    expect(addedRegistration).not.toBeFalsy();
    compareRegistrations(addedRegistration!, registration);
    expect(() => addedRegistration!.getId()).not.toThrowError();
    expect(() => registration.getId()).not.toThrowError();
  });

  it("gets a registration by the extension id", () => {
    // Arrange
    const registration = factory.getExtensionRegistrationFactory().build();
    repository.add(registration);
    // Act
    const addedRegistration = repository.getByExtensionId(
      registration.getExtensionId()
    );
    // Assert
    expect(addedRegistration).not.toBeFalsy();
    compareRegistrations(addedRegistration!, registration);
  });

  it("removes a registration", () => {
    // Arrange
    const registration = factory.getExtensionRegistrationFactory().build();
    repository.add(registration);
    // Act
    repository.remove(registration.getId());
    const existing = repository.getById(registration.getId());
    // Assert
    expect(existing).toBeNull();
  });

  it("returns all registrations with big list", () => {
    // Arrange
    const registrations = factory
      .getExtensionRegistrationFactory()
      .buildList(200);
    for (const registration of registrations) repository.add(registration);
    const randomRegistration = faker.helpers.arrayElement(registrations);
    // Act
    const allRegistrations = repository.all();
    const randomAddedRegistration = allRegistrations.find(
      (r) => r.getId() === randomRegistration.getId()
    );
    // Assert
    expect(allRegistrations).toHaveLength(registrations.length);
    expect(randomAddedRegistration).not.toBeFalsy();
    compareRegistrations(randomRegistration, randomAddedRegistration!);
  });

  it("updates a registration", () => {
    // Arrange
    const registration = factory.getExtensionRegistrationFactory().build();
    repository.add(registration);
    // Act
    const beforeUpdateRegistration = repository.getById(registration.getId());
    registration.approve();
    repository.update(registration);
    const afterUpdateRegistration = repository.getById(registration.getId());
    // Assert
    expect(beforeUpdateRegistration?.getStatus()).toBe(
      extensionRegistrationStatus.pending
    );
    expect(afterUpdateRegistration?.getStatus()).toBe(
      extensionRegistrationStatus.trusted
    );
  });
});
