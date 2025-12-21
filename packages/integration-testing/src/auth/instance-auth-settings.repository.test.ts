import { faker } from "@faker-js/faker";
import {
  InstanceAuthSettings,
  makeInstanceAuthSettings,
} from "@playatlas/auth/domain";
import { api } from "../vitest.global.setup";

describe("Instance Auth Settings Repository", () => {
  it("adds and gets the instance auth settings", async () => {
    // Arrange
    const { hash, salt } = await api.auth
      .getCryptographyService()
      .hashPassword(faker.internet.password());
    const instanceAuth: InstanceAuthSettings = makeInstanceAuthSettings({
      passwordHash: hash,
      salt: salt,
    });
    // Act
    api.auth.getInstanceAuthSettingsRepository().upsert(instanceAuth);
    const added = api.auth.getInstanceAuthSettingsRepository().get();
    // Assert
    expect(added).toBeTruthy();
    expect(added?.getPasswordHash()).toBe(instanceAuth.getPasswordHash());
    expect(added?.getSalt()).toBe(instanceAuth.getSalt());
    expect(added?.getCreatedAt().getTime()).toBe(
      instanceAuth.getCreatedAt().getTime()
    );
  });

  it("updates the instance auth setting", async () => {
    // Arrange
    const { hash, salt } = await api.auth
      .getCryptographyService()
      .hashPassword(faker.internet.password());
    const instanceAuth: InstanceAuthSettings = makeInstanceAuthSettings({
      passwordHash: hash,
      salt: salt,
    });
    api.auth.getInstanceAuthSettingsRepository().upsert(instanceAuth);
    const newCredentials = await api.auth
      .getCryptographyService()
      .hashPassword(faker.internet.password());
    // Act
    instanceAuth.setInstanceCredentials(newCredentials);
    api.auth.getInstanceAuthSettingsRepository().upsert(instanceAuth);
    const updated = api.auth.getInstanceAuthSettingsRepository().get();
    // Assert
    expect(updated).toBeTruthy();
    expect(updated?.getPasswordHash()).toBe(newCredentials.hash);
    expect(updated?.getSalt()).toBe(newCredentials.salt);
    expect(updated?.getCreatedAt().getTime()).toBe(
      instanceAuth.getCreatedAt().getTime()
    );
    expect(updated?.getLastUpdatedAt().getTime()).toBeGreaterThan(
      instanceAuth.getCreatedAt().getTime()
    );
  });
});
