import type { GameId } from "$lib/modules/common/domain";

export type HomePageGameReadModel = Readonly<{
	Id: GameId;
	Name: string;
	CoverImageFilePath?: string | null;
	Similarity: number;
}>;
