import type { IClockPort } from "$lib/modules/common/application/clock.port";
import { normalize } from "$lib/modules/common/common";
import { GameIdParser, PlayniteGameIdParser } from "$lib/modules/common/domain";
import {
	CompanyIdParser,
	CompletionStatusIdParser,
	GenreIdParser,
	PlatformIdParser,
} from "../domain";
import type { IGameMapperPort } from "./game.mapper.port";

export type GameMapperDeps = {
	clock: IClockPort;
};

export class GameMapper implements IGameMapperPort {
	private readonly clock: IClockPort;

	constructor({ clock }: GameMapperDeps) {
		this.clock = clock;
	}

	fromDto: IGameMapperPort["fromDto"] = (dto, lastSync) => {
		return {
			Id: GameIdParser.fromTrusted(dto.Id),

			Playnite: dto.Playnite
				? {
						Id: PlayniteGameIdParser.fromTrusted(dto.Playnite.Id),
						Name: dto.Playnite.Name,
						Description: dto.Playnite.Description,
						Added: dto.Playnite.Added ? new Date(dto.Playnite.Added) : null,
						CompletionStatusId: dto.Playnite.CompletionStatusId
							? CompletionStatusIdParser.fromTrusted(dto.Playnite.CompletionStatusId)
							: null,
						Hidden: dto.Playnite.Hidden,
						InstallDirectory: dto.Playnite.InstallDirectory,
						IsInstalled: dto.Playnite.IsInstalled,
						LastActivity: dto.Playnite.LastActivity ? new Date(dto.Playnite.LastActivity) : null,
						Playtime: dto.Playnite.Playtime,
						ReleaseDate: dto.Playnite.ReleaseDate ? new Date(dto.Playnite.ReleaseDate) : null,
						BackgroundImagePath: dto.Playnite.BackgroundImagePath,
						CoverImagePath: dto.Playnite.CoverImagePath,
						IconImagePath: dto.Playnite.IconImagePath,
					}
				: null,

			SearchName: dto.Playnite?.Name ? normalize(dto.Playnite.Name) : null,
			CompletionStatusId: dto.CompletionStatusId
				? CompletionStatusIdParser.fromTrusted(dto.CompletionStatusId)
				: null,
			ContentHash: dto.ContentHash,
			Developers: dto.Developers.map(CompanyIdParser.fromTrusted),
			Publishers: dto.Publishers.map(CompanyIdParser.fromTrusted),
			Genres: dto.Genres.map(GenreIdParser.fromTrusted),
			Platforms: dto.Platforms.map(PlatformIdParser.fromTrusted),
			SourceLastUpdatedAt: new Date(dto.Sync.LastUpdatedAt),
			DeletedAt: dto.Sync.DeletedAt ? new Date(dto.Sync.DeletedAt) : null,
			DeleteAfter: dto.Sync.DeleteAfter ? new Date(dto.Sync.DeleteAfter) : null,
			Sync: {
				Status: "synced",
				LastSyncedAt: lastSync ?? this.clock.now(),
				ErrorMessage: null,
			},
		};
	};

	toDomain: IGameMapperPort["toDomain"] = (model) => {
		return {
			Id: GameIdParser.fromTrusted(model.Id),

			Playnite: model.Playnite
				? {
						Id: PlayniteGameIdParser.fromTrusted(model.Playnite.Id),
						Name: model.Playnite.Name,
						Description: model.Playnite.Description,
						Added: model.Playnite.Added ? new Date(model.Playnite.Added) : null,
						CompletionStatusId: model.Playnite.CompletionStatusId,
						Hidden: model.Playnite.Hidden,
						InstallDirectory: model.Playnite.InstallDirectory,
						IsInstalled: model.Playnite.IsInstalled,
						LastActivity: model.Playnite.LastActivity
							? new Date(model.Playnite.LastActivity)
							: null,
						Playtime: model.Playnite.Playtime,
						ReleaseDate: model.Playnite.ReleaseDate ? new Date(model.Playnite.ReleaseDate) : null,
						BackgroundImagePath: model.Playnite.BackgroundImagePath,
						CoverImagePath: model.Playnite.CoverImagePath,
						IconImagePath: model.Playnite.IconImagePath,
					}
				: null,

			SearchName: model.SearchName ?? null,
			CompletionStatusId: model.CompletionStatusId,
			ContentHash: model.ContentHash,
			Developers: model.Developers,
			Publishers: model.Publishers,
			Genres: model.Genres,
			Platforms: model.Platforms,
			SourceLastUpdatedAt: model.SourceLastUpdatedAt,
			DeletedAt: model.DeletedAt ?? null,
			DeleteAfter: model.DeleteAfter ?? null,
			Sync: {
				Status: model.Sync.Status,
				LastSyncedAt: model.Sync.LastSyncedAt,
				ErrorMessage: model.Sync.ErrorMessage ?? null,
			},
		};
	};

	toPersistence: IGameMapperPort["toPersistence"] = (entity) => {
		return {
			Id: entity.Id,
			SourceLastUpdatedAt: entity.SourceLastUpdatedAt,
			SourceLastUpdatedAtMs: entity.SourceLastUpdatedAt.getTime(),
			DeleteAfter: entity.DeleteAfter,
			DeletedAt: entity.DeletedAt,

			Playnite: entity.Playnite
				? {
						Id: entity.Playnite.Id,
						Name: entity.Playnite.Name,
						Description: entity.Playnite.Description,
						ReleaseDate: entity.Playnite.ReleaseDate,
						Playtime: entity.Playnite.Playtime,
						LastActivity: entity.Playnite.LastActivity,
						Added: entity.Playnite.Added,
						InstallDirectory: entity.Playnite.InstallDirectory,
						IsInstalled: entity.Playnite.IsInstalled,
						Hidden: entity.Playnite.Hidden,
						CompletionStatusId: entity.Playnite.CompletionStatusId,
						BackgroundImagePath: entity.Playnite.BackgroundImagePath,
						CoverImagePath: entity.Playnite.CoverImagePath,
						IconImagePath: entity.Playnite.IconImagePath,
					}
				: null,

			SearchName: entity.SearchName
				? entity.SearchName
				: entity.Playnite?.Name
					? normalize(entity.Playnite.Name)
					: null,
			CompletionStatusId: entity.CompletionStatusId,
			ContentHash: entity.ContentHash,
			Developers: entity.Developers,
			Genres: entity.Genres,
			Platforms: entity.Platforms,
			Publishers: entity.Publishers,
			Sync: {
				Status: entity.Sync.Status,
				LastSyncedAt: entity.Sync.LastSyncedAt,
				ErrorMessage: entity.Sync.ErrorMessage,
			},
		};
	};
}
