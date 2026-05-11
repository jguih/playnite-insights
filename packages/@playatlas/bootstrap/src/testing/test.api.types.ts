import type {
	Company,
	CompletionStatus,
	Genre,
	Platform,
	Tag,
} from "@playatlas/game-library/domain";

export type GameRelationshipOptions = {
	completionStatusList: CompletionStatus[];
	companyList: Company[];
	genreList: Genre[];
	platformList: Platform[];
	tagList: Tag[];
};
