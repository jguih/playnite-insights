import { m } from "$lib/paraglide/messages";
import type {
	CanonicalClassificationTier,
	ClassificationId,
	EvidenceGroupTier,
} from "@playatlas/common/domain";
import type {
	HorrorEvidenceGroup,
	RunBasedEvidenceGroup,
	SurvivalEvidenceGroup,
} from "@playatlas/game-library/application";

export type EvidenceGroupMeta = {
	label: () => string;
	description: () => string;
};

export type ScoreEngineMeta = {
	engineLabel: () => string;
	engineDescription: () => string;
};

const horrorEvidenceGroupRegistry = {
	horror_identity: {
		label: () => m["score_engine.HORROR.groups.horror_identity.label"](),
		description: () => m["score_engine.HORROR.groups.horror_identity.description"](),
	},
	atmospheric_horror: {
		label: () => m["score_engine.HORROR.groups.atmospheric_horror.label"](),
		description: () => m["score_engine.HORROR.groups.atmospheric_horror.description"](),
	},
	combat_engagement: {
		label: () => m["score_engine.HORROR.groups.combat_engagement.label"](),
		description: () => m["score_engine.HORROR.groups.combat_engagement.description"](),
	},
	psychological_horror: {
		label: () => m["score_engine.HORROR.groups.psychological_horror.label"](),
		description: () => m["score_engine.HORROR.groups.psychological_horror.description"](),
	},
	resource_survival: {
		label: () => m["score_engine.HORROR.groups.resource_survival.label"](),
		description: () => m["score_engine.HORROR.groups.resource_survival.description"](),
	},
} as const satisfies Record<HorrorEvidenceGroup, EvidenceGroupMeta>;

const runBasedEvidenceGroupRegistry = {
	run_based_identity: {
		label: () => m["score_engine.RUN-BASED.groups.run_based_identity.label"](),
		description: () => m["score_engine.RUN-BASED.groups.run_based_identity.description"](),
	},
	procedural_runs: {
		label: () => m["score_engine.RUN-BASED.groups.procedural_runs.label"](),
		description: () => m["score_engine.RUN-BASED.groups.procedural_runs.description"](),
	},
	permadeath_reset: {
		label: () => m["score_engine.RUN-BASED.groups.permadeath_reset.label"](),
		description: () => m["score_engine.RUN-BASED.groups.permadeath_reset.description"](),
	},
	run_variability: {
		label: () => m["score_engine.RUN-BASED.groups.run_variability.label"](),
		description: () => m["score_engine.RUN-BASED.groups.run_variability.description"](),
	},
	meta_progression: {
		label: () => m["score_engine.RUN-BASED.groups.meta_progression.label"](),
		description: () => m["score_engine.RUN-BASED.groups.meta_progression.description"](),
	},
} as const satisfies Record<RunBasedEvidenceGroup, EvidenceGroupMeta>;

const survivalBasedEvidenceGroupRegistry = {
	survival_identity: {
		label: () => m["score_engine.RUN-BASED.groups.procedural_runs.label"](), // Placeholder
		description: () => m["score_engine.RUN-BASED.groups.procedural_runs.description"](),
	},
} as const satisfies Record<SurvivalEvidenceGroup, EvidenceGroupMeta>;

type ScoreEngineMetaRaw = ScoreEngineMeta & {
	groups: Record<string, EvidenceGroupMeta>;
};

export const scoreEngineRegistry = {
	HORROR: {
		engineLabel: () => m["score_engine.HORROR.engineLabel"](),
		engineDescription: () => m["score_engine.HORROR.engineDescription"](),
		groups: horrorEvidenceGroupRegistry,
	},
	"RUN-BASED": {
		engineLabel: () => m["score_engine.RUN-BASED.engineLabel"](),
		engineDescription: () => m["score_engine.RUN-BASED.engineDescription"](),
		groups: runBasedEvidenceGroupRegistry,
	},
	SURVIVAL: {
		engineLabel: () => m["score_engine.SURVIVAL.engineLabel"](),
		engineDescription: () => m["score_engine.HORROR.engineDescription"](), // Placeholder
		groups: survivalBasedEvidenceGroupRegistry,
	},
} as const satisfies Record<ClassificationId, ScoreEngineMetaRaw>;

export const getScoreEngineLabel = (classificationId: ClassificationId): string =>
	scoreEngineRegistry[classificationId].engineLabel();

export const getScoreEngineDescription = (classificationId: ClassificationId): string =>
	scoreEngineRegistry[classificationId].engineDescription();

export const getScoreEngineGroupDetails = (classificationId: ClassificationId) =>
	scoreEngineRegistry[classificationId].groups;

export const classificationTierRegistry = {
	core: () => m["score_engine.classificationTier.core"](),
	strong: () => m["score_engine.classificationTier.strong"](),
	adjacent: () => m["score_engine.classificationTier.adjacent"](),
	weak: () => m["score_engine.classificationTier.weak"](),
	none: () => m["score_engine.classificationTier.none"](),
} as const satisfies Record<CanonicalClassificationTier, () => string>;

export const evidenceGroupTierRegistry = {
	strong: () => m["score_engine.evidenceGroupTier.strong"](),
	moderate: () => m["score_engine.evidenceGroupTier.moderate"](),
	light: () => m["score_engine.evidenceGroupTier.light"](),
	none: () => m["score_engine.evidenceGroupTier.none"](),
} as const satisfies Record<EvidenceGroupTier, () => string>;
