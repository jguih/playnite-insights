import { evidenceGroupTiers } from "@playatlas/common/domain";
import type { ScoreEngineSourcePolicy } from "../../engine.evidence-source.policy";
import type { ScoreEngineEvidenceGroupPolicy } from "../../engine.policy";
import {
	SCORE_ENGINE_DEFAULT_SOURCE_PRIORITY,
	type ScoreEngineGatePolicy,
	type ScoreEngineSourcePriorityPolicy,
} from "../../policy";
import type { ScoreEngineClassificationTierThresholdPolicy } from "../../policy/classification-tier-threshold.policy";
import type { ScoreEngineEvidenceGroupsMeta, ScoreEngineVersion } from "../../score-engine.types";

export const HORROR_ENGINE_VERSION = "v1.0.30" as const satisfies ScoreEngineVersion;

export const HORROR_ENGINE_EVIDENCE_GROUPS = [
	"horror_identity",
	"atmospheric_horror",
	"combat_engagement",
	"psychological_horror",
	"resource_survival",
] as const satisfies string[];

export type HorrorEvidenceGroup = (typeof HORROR_ENGINE_EVIDENCE_GROUPS)[number];

export const HORROR_ENGINE_EVIDENCE_GROUPS_META = {
	horror_identity: { userFacing: false, role: "identity" },
	atmospheric_horror: { userFacing: true, role: "dimension" },
	combat_engagement: { userFacing: true, role: "dimension" },
	psychological_horror: { userFacing: true, role: "dimension" },
	resource_survival: { userFacing: true, role: "dimension" },
} as const satisfies ScoreEngineEvidenceGroupsMeta<HorrorEvidenceGroup>;

export const HORROR_ENGINE_EVIDENCE_GROUP_POLICY = {
	horror_identity: { cap: 40 },
	atmospheric_horror: { cap: 30 },
	combat_engagement: { cap: 30 },
	psychological_horror: { cap: 50 },
	resource_survival: { cap: 30 },
} as const satisfies ScoreEngineEvidenceGroupPolicy<HorrorEvidenceGroup>;

export const HORROR_ENGINE_CLASSIFICATION_TIER_THRESHOLD_POLICY = {
	adjacent: 0.198,
	strong: 0.396,
	core: 0.767,
} as const satisfies ScoreEngineClassificationTierThresholdPolicy;

export const HORROR_ENGINE_GATE_POLICY: ScoreEngineGatePolicy<HorrorEvidenceGroup> = {
	apply: ({ groupTierByGroup }) => {
		const rank = (g: HorrorEvidenceGroup): number =>
			evidenceGroupTiers.indexOf(groupTierByGroup.get(g) ?? "none");

		const identity = rank("horror_identity");
		const psychological = rank("psychological_horror");
		const atmospheric = rank("atmospheric_horror");
		const survival = rank("resource_survival");
		const combat = rank("combat_engagement");

		const coreMax = Math.max(identity, psychological, survival);

		const gateScore = coreMax * 2 + atmospheric + (combat >= 2 ? 0.5 : 0);

		if (gateScore >= 6) return { mode: "with_gate", confidenceMultiplier: 1 };
		if (gateScore >= 4) return { mode: "with_gate", confidenceMultiplier: 0.8 };
		if (gateScore > 0.5) return { mode: "without_gate", confidenceMultiplier: 0.6 };

		return { mode: "without_gate", confidenceMultiplier: 0 };
	},
};

export const HORROR_ENGINE_EVIDENCE_SOURCE_POLICY = {
	horror_identity: {
		genre: { cap: Infinity, multiplier: 1.2 },
		tag: { cap: Infinity, multiplier: 1.1 },
		text: { cap: 10, multiplier: 0.6 },
	},
	atmospheric_horror: {
		text: { cap: Infinity },
		genre: { cap: Infinity, multiplier: 0.8 },
		tag: { cap: 20, multiplier: 0.8 },
	},
	combat_engagement: {
		text: { cap: Infinity },
		genre: { cap: Infinity, multiplier: 0.8 },
		tag: { cap: 15, multiplier: 0.6 },
	},
	psychological_horror: {
		genre: { cap: Infinity, multiplier: 1.2 },
		tag: { cap: Infinity, multiplier: 1.1 },
		text: { cap: 20, multiplier: 0.8 },
	},
	resource_survival: {
		genre: { cap: Infinity, multiplier: 1.2 },
		tag: { cap: Infinity, multiplier: 1.1 },
		text: { cap: 15, multiplier: 0.6 },
	},
} as const satisfies ScoreEngineSourcePolicy<HorrorEvidenceGroup>;

export const HORROR_ENGINE_SOURCE_PRIORITY_POLICY = {
	horror_identity: {
		genre: 3,
		tag: 2,
		text: 1,
	},
	atmospheric_horror: SCORE_ENGINE_DEFAULT_SOURCE_PRIORITY,
	combat_engagement: SCORE_ENGINE_DEFAULT_SOURCE_PRIORITY,
	psychological_horror: {
		genre: 3,
		tag: 2,
		text: 1,
	},
	resource_survival: {
		genre: 3,
		tag: 2,
		text: 1,
	},
} as const satisfies ScoreEngineSourcePriorityPolicy<HorrorEvidenceGroup>;
