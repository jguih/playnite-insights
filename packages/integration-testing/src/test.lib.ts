import type { PlayAtlasApiV1 } from "@playatlas/bootstrap/application";
import type { DomainEvent } from "@playatlas/common/application";
import type { SyncCursor } from "@playatlas/common/infra";

export const recordDomainEvents = (api: PlayAtlasApiV1) => {
	const events: DomainEvent[] = [];
	const unsubscribe = api.getEventBus().subscribe((event) => events.push(event));
	return { events, unsubscribe };
};

export const isCursorAfter = (a: SyncCursor, b: SyncCursor): boolean => {
	if (a.lastUpdatedAt.getTime() !== b.lastUpdatedAt.getTime()) {
		return a.lastUpdatedAt > b.lastUpdatedAt;
	}

	return a.id > b.id;
};

export const isCursorEqual = (a: SyncCursor, b: SyncCursor): boolean => {
	return a.lastUpdatedAt.getTime() === b.lastUpdatedAt.getTime() && a.id === b.id;
};
