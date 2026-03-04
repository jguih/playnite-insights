import { faker } from "@faker-js/faker";
import type {
	ApproveExtensionRegistrationCommand,
	RegisterExtensionCommand,
	RejectExtensionRegistrationCommand,
	RevokeExtensionRegistrationCommand,
} from "@playatlas/auth/commands";
import type { ExtensionRegistration } from "@playatlas/auth/domain";
import type { ExtensionRegistrationResponseDto } from "@playatlas/auth/dtos";
import type { DomainEvent } from "@playatlas/common/application";
import { ExtensionRegistrationIdParser } from "@playatlas/common/domain";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { recordDomainEvents } from "../test.lib";
import { api, factory } from "../vitest.global.setup";

const buildRegisterCommand = (): {
	registration: ExtensionRegistration;
	command: RegisterExtensionCommand;
} => {
	const registration = factory.getExtensionRegistrationFactory().build();
	const command: RegisterExtensionCommand = {
		extensionId: registration.getExtensionId(),
		publicKey: registration.getPublicKey(),
		extensionVersion: registration.getExtensionVersion(),
		hostname: registration.getHostname(),
		os: registration.getOs(),
	};
	return { registration, command };
};

describe("Auth / Extension Registration", () => {
	let unsubscribe: () => void;
	let events: DomainEvent[];

	beforeEach(() => {
		({ events, unsubscribe } = recordDomainEvents());
	});

	afterEach(() => {
		unsubscribe();
	});

	it("register an extension", () => {
		// Arrange
		const { command } = buildRegisterCommand();

		// Act
		const registerResult = api.auth.commands.getRegisterExtensionCommandHandler().execute(command);
		const registrationId = registerResult.success ? registerResult.registrationId : null;
		const { registrations } = api.auth.queries
			.getGetAllExtensionRegistrationsQueryHandler()
			.execute();

		// Assert
		expect(registrationId).toBeDefined();

		expect(registrations).toHaveLength(1);
		expect(registrations).toEqual([
			expect.objectContaining({
				Id: registrationId!,
				Status: "pending",
			} satisfies Partial<ExtensionRegistrationResponseDto>),
		]);

		expect(events).toHaveLength(1);
		expect(events).toEqual([
			expect.objectContaining({
				name: "extension-registration-created",
				payload: { registrationId: registrationId! },
			} satisfies Partial<DomainEvent>),
		]);
	});

	it("approves an extension registration", () => {
		// Arrange
		const { command } = buildRegisterCommand();
		const registerResult = api.auth.commands.getRegisterExtensionCommandHandler().execute(command);
		const registrationId = registerResult.success ? registerResult.registrationId : null;
		expect(registrationId).toBeDefined();

		events.length = 0;

		// Act
		const approveResult = api.auth.commands
			.getApproveExtensionRegistrationCommandHandler()
			.execute({ registrationId: registrationId! });
		const { registrations } = api.auth.queries
			.getGetAllExtensionRegistrationsQueryHandler()
			.execute();
		const approved = registrations.find((r) => r.Id === registrationId);

		// Assert
		expect(approved?.Status).toBe("trusted");

		expect(registerResult.success).toBe(true);
		expect(registerResult.reason_code).toBe("extension_registered");

		expect(approveResult.success).toBe(true);
		expect(approveResult.reason_code).toBe("extension_registration_approved");

		expect(events).toHaveLength(1);
		expect(events).toEqual([
			expect.objectContaining({
				name: "extension-registration-approved",
				payload: { registrationId: registrationId! },
			} satisfies Partial<DomainEvent>),
		]);
	});

	it("gracefully handles rejecting a registration that doesn't exist", () => {
		// Arrange

		// Act
		const rejectResult = api.auth.commands.getRejectExtensionRegistrationCommandHandler().execute({
			registrationId: ExtensionRegistrationIdParser.fromExternal(faker.number.int()),
		});
		const { registrations } = api.auth.queries
			.getGetAllExtensionRegistrationsQueryHandler()
			.execute();

		// Assert
		expect(rejectResult.success).toBe(false);
		expect(rejectResult.reason_code).toBe("not_found");

		expect(registrations).toHaveLength(0);

		expect(events).toHaveLength(0);
	});

	it("gracefully handles approving a registration that doesn't exist", () => {
		// Arrange

		// Act
		const approveResult = api.auth.commands
			.getApproveExtensionRegistrationCommandHandler()
			.execute({
				registrationId: ExtensionRegistrationIdParser.fromExternal(faker.number.int()),
			});
		const { registrations } = api.auth.queries
			.getGetAllExtensionRegistrationsQueryHandler()
			.execute();

		// Assert
		expect(approveResult.success).toBe(false);
		expect(approveResult.reason_code).toBe("not_found");

		expect(registrations).toHaveLength(0);

		expect(events).toHaveLength(0);
	});

	it("gracefully handles revoking a registration that doesn't exist", () => {
		// Arrange

		// Act
		const revokeResult = api.auth.commands.getRevokeExtensionRegistrationCommandHandler().execute({
			registrationId: ExtensionRegistrationIdParser.fromExternal(faker.number.int()),
		});
		const { registrations } = api.auth.queries
			.getGetAllExtensionRegistrationsQueryHandler()
			.execute();

		// Assert
		expect(revokeResult.success).toBe(false);
		expect(revokeResult.reason_code).toBe("not_found");

		expect(registrations).toHaveLength(0);

		expect(events).toHaveLength(0);
	});

	it("gracefully handles approving an already approved registration", () => {
		// Arrange
		const { command } = buildRegisterCommand();
		const registerResult = api.auth.commands.getRegisterExtensionCommandHandler().execute(command);
		const registrationId = registerResult.success ? registerResult.registrationId : null;
		expect(registrationId).toBeDefined();

		events.length = 0;

		const approveCommand: ApproveExtensionRegistrationCommand = {
			registrationId: registrationId!,
		};

		// Act
		const approveResult1 = api.auth.commands
			.getApproveExtensionRegistrationCommandHandler()
			.execute(approveCommand);
		const approveResult2 = api.auth.commands
			.getApproveExtensionRegistrationCommandHandler()
			.execute(approveCommand);
		const { registrations } = api.auth.queries
			.getGetAllExtensionRegistrationsQueryHandler()
			.execute();

		// Assert
		expect(approveResult1.success).toBe(true);
		expect(approveResult1.reason_code).toBe("extension_registration_approved");

		expect(approveResult2.success).toBe(true);
		expect(approveResult2.reason_code).toBe("extension_registration_already_approved");

		expect(registrations).toHaveLength(1);
		expect(registrations[0].Status).toBe("trusted");

		expect(events).toHaveLength(1);
		expect(events).toEqual([
			expect.objectContaining({
				name: "extension-registration-approved",
				payload: { registrationId: registrationId! },
			} satisfies Partial<DomainEvent>),
		]);
	});

	it("does not approve rejected extension registration", () => {
		// Arrange
		const { command } = buildRegisterCommand();
		const registerResult = api.auth.commands.getRegisterExtensionCommandHandler().execute(command);
		const registrationId = registerResult.success ? registerResult.registrationId : null;
		expect(registrationId).toBeDefined();

		events.length = 0;

		const rejectCommand: RejectExtensionRegistrationCommand = {
			registrationId: registrationId!,
		};
		const approveCommand: ApproveExtensionRegistrationCommand = {
			registrationId: registrationId!,
		};

		// Act
		const rejectResult = api.auth.commands
			.getRejectExtensionRegistrationCommandHandler()
			.execute(rejectCommand);
		const approveResult = api.auth.commands
			.getApproveExtensionRegistrationCommandHandler()
			.execute(approveCommand);
		const { registrations } = api.auth.queries
			.getGetAllExtensionRegistrationsQueryHandler()
			.execute();

		// Assert
		expect(rejectResult.success).toBe(true);
		expect(rejectResult.reason_code).toBe("extension_registration_rejected");

		expect(approveResult.success).toBe(false);
		expect(approveResult.reason_code).toBe("cannot_approve_rejected_registration");

		expect(registrations).toHaveLength(1);
		expect(registrations[0].Status).toBe("rejected");

		expect(events).toHaveLength(1);
		expect(events).toEqual([
			expect.objectContaining({
				name: "extension-registration-rejected",
				payload: { registrationId: registrationId! },
			} satisfies Partial<DomainEvent>),
		]);
	});

	it("revokes approved extension registration", () => {
		// Arrange
		const { command } = buildRegisterCommand();
		const registerResult = api.auth.commands.getRegisterExtensionCommandHandler().execute(command);
		const registrationId = registerResult.success ? registerResult.registrationId : null;
		expect(registrationId).toBeDefined();

		events.length = 0;

		const approveCommand: ApproveExtensionRegistrationCommand = {
			registrationId: registrationId!,
		};
		const revokeCommand: RevokeExtensionRegistrationCommand = {
			registrationId: registrationId!,
		};

		// Act
		const approveResult = api.auth.commands
			.getApproveExtensionRegistrationCommandHandler()
			.execute(approveCommand);
		const revokeResult = api.auth.commands
			.getRevokeExtensionRegistrationCommandHandler()
			.execute(revokeCommand);
		const { registrations } = api.auth.queries
			.getGetAllExtensionRegistrationsQueryHandler()
			.execute();

		// Assert
		expect(approveResult.success).toBe(true);
		expect(approveResult.reason_code).toBe("extension_registration_approved");

		expect(revokeResult.success).toBe(true);
		expect(revokeResult.reason_code).toBe("extension_registration_revoked");

		expect(registrations).toHaveLength(1);
		expect(registrations[0].Status).toBe("rejected");

		expect(events).toHaveLength(2);
		expect(events).toEqual([
			expect.objectContaining({
				name: "extension-registration-approved",
				payload: { registrationId: registrationId! },
			} satisfies Partial<DomainEvent>),
			expect.objectContaining({
				name: "extension-registration-revoked",
				payload: { registrationId: registrationId! },
			} satisfies Partial<DomainEvent>),
		]);
	});
});
