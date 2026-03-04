import type { SyncTarget } from "../domain/value-object/sync-target";

export type SyncRunnerFetchResult<TDto> =
	| { success: false }
	| {
			success: true;
			items: TDto[];
			nextCursor: string;
	  };

export type SyncRunnerConfig<TEntity, TDto> = {
	syncTarget: SyncTarget;
	fetchAsync: (args: { lastCursor: string | null }) => Promise<SyncRunnerFetchResult<TDto>>;
	mapDtoToEntity: (args: { dto: TDto; now: Date }) => TEntity;
	persistAsync: (args: { entities: TEntity[] }) => Promise<void>;
};

export type SyncRunnerResult =
	| {
			success: true;
			updatedEntities: number;
	  }
	| {
			success: false;
			reason_code: "fetch_failed";
	  };
