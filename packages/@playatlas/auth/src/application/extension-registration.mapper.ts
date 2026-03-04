import type { EntityMapper } from "@playatlas/common/application";
import { ExtensionRegistrationIdParser } from "@playatlas/common/domain";
import { type ExtensionRegistration } from "../domain/extension-registration.entity";
import type { ExtensionRegistrationResponseDto } from "../dtos/extension-registration.response.dto";
import type { ExtensionRegistrationModel } from "../infra/extension-registration.repository";
import type { IExtensionRegistrationFactoryPort } from "./extension-registration.factory";

export type IExtensionRegistrationMapperPort = Omit<
	EntityMapper<ExtensionRegistration, ExtensionRegistrationModel>,
	"toPersistence"
> & {
	toPersistence: (
		entity: ExtensionRegistration,
		options?: {
			id?: number;
		},
	) => ExtensionRegistrationModel;
	toDto: (entity: ExtensionRegistration) => ExtensionRegistrationResponseDto;
	toDtoList: (entity: ExtensionRegistration[]) => ExtensionRegistrationResponseDto[];
};

export type ExtensionRegistrationMapperDeps = {
	extensionRegistrationFactory: IExtensionRegistrationFactoryPort;
};

export const makeExtensionRegistrationMapper = ({
	extensionRegistrationFactory,
}: ExtensionRegistrationMapperDeps): IExtensionRegistrationMapperPort => {
	const _toDto: IExtensionRegistrationMapperPort["toDto"] = (entity) => {
		const dto: ExtensionRegistrationResponseDto = {
			Id: entity.getId(),
			ExtensionId: entity.getExtensionId(),
			ExtensionVersion: entity.getExtensionVersion(),
			Hostname: entity.getHostname(),
			Os: entity.getOs(),
			PublicKey: entity.getPublicKey(),
			Status: entity.getStatus(),
			CreatedAt: entity.getCreatedAt().toISOString(),
			LastUpdatedAt: entity.getLastUpdatedAt().toISOString(),
		};
		return dto;
	};

	return {
		toDomain: (model) => {
			const entity = extensionRegistrationFactory.rehydrate({
				id: ExtensionRegistrationIdParser.fromTrusted(model.Id),
				extensionId: model.ExtensionId,
				extensionVersion: model.ExtensionVersion,
				hostname: model.Hostname,
				os: model.Os,
				publicKey: model.PublicKey,
				status: model.Status,
				createdAt: new Date(model.CreatedAt),
				lastUpdatedAt: new Date(model.LastUpdatedAt),
			});
			return entity;
		},
		toPersistence: (entity, options = {}) => {
			const model: ExtensionRegistrationModel = {
				Id: options.id ?? -1,
				ExtensionId: entity.getExtensionId(),
				ExtensionVersion: entity.getExtensionVersion(),
				Hostname: entity.getHostname(),
				Os: entity.getOs(),
				PublicKey: entity.getPublicKey(),
				Status: entity.getStatus(),
				CreatedAt: entity.getCreatedAt().toISOString(),
				LastUpdatedAt: entity.getLastUpdatedAt().toISOString(),
			};
			return model;
		},
		toDto: _toDto,
		toDtoList: (entity) => {
			const dtos: ExtensionRegistrationResponseDto[] = [];
			for (const registration of entity) dtos.push(_toDto(registration));
			return dtos;
		},
	};
};
