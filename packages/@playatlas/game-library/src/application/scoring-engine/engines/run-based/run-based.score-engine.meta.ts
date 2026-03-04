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

export const RUN_BASED_ENGINE_VERSION = "v1.0.35" as const satisfies ScoreEngineVersion;

export const RUN_BASED_ENGINE_EVIDENCE_GROUPS = [
	"run_based_identity",
	"procedural_runs",
	"permadeath_reset",
	"run_variability",
	"meta_progression",
] as const satisfies string[];

export type RunBasedEvidenceGroup = (typeof RUN_BASED_ENGINE_EVIDENCE_GROUPS)[number];

export const RUN_BASED_ENGINE_EVIDENCE_GROUP_META = {
	run_based_identity: { userFacing: false, role: "identity" },
	procedural_runs: { userFacing: true, role: "dimension" },
	permadeath_reset: { userFacing: true, role: "dimension" },
	meta_progression: { userFacing: true, role: "dimension" },
	run_variability: { userFacing: true, role: "dimension" },
} as const satisfies ScoreEngineEvidenceGroupsMeta<RunBasedEvidenceGroup>;

export const RUN_BASED_ENGINE_EVIDENCE_GROUP_POLICY = {
	run_based_identity: { cap: 40 },
	procedural_runs: { cap: 50 },
	permadeath_reset: { cap: 30 },
	run_variability: { cap: 40 },
	meta_progression: { cap: 30 },
} as const satisfies ScoreEngineEvidenceGroupPolicy<RunBasedEvidenceGroup>;

export const RUN_BASED_ENGINE_CLASSIFICATION_TIER_THRESHOLD_POLICY = {
	adjacent: 0.0825,
	strong: 0.269,
	core: 0.4095,
} as const satisfies ScoreEngineClassificationTierThresholdPolicy;

export const RUN_BASED_ENGINE_GATE_POLICY: ScoreEngineGatePolicy<RunBasedEvidenceGroup> = {
	apply: ({ groupTierByGroup }) => {
		const rank = (g: RunBasedEvidenceGroup): number =>
			evidenceGroupTiers.indexOf(groupTierByGroup.get(g) ?? "none");

		const identity = rank("run_based_identity");
		const procedural = rank("procedural_runs");
		const permadeath = rank("permadeath_reset");
		const runVariability = rank("run_variability");
		const metaProgression = rank("meta_progression");

		const gateScore =
			identity * 2 + procedural + permadeath + runVariability + (metaProgression >= 2 ? 1 : 0);

		if (gateScore >= 9) return { mode: "with_gate", confidenceMultiplier: 1 };

		if (gateScore >= 6) return { mode: "with_gate", confidenceMultiplier: 0.7 };

		return { mode: "without_gate", confidenceMultiplier: 0.5 };
	},
};

export const RUN_BASED_ENGINE_EVIDENCE_SOURCE_POLICY = {
	run_based_identity: {
		genre: { cap: Infinity, multiplier: 1.2 },
		tag: { cap: Infinity, multiplier: 1.1 },
		text: { cap: 10, multiplier: 0.6 },
	},
	procedural_runs: {
		text: { cap: Infinity, multiplier: 1.1 },
		genre: { cap: Infinity },
		tag: { cap: Infinity, multiplier: 0.8 },
	},
	meta_progression: {
		text: { cap: Infinity, multiplier: 1.1 },
		genre: { cap: Infinity },
		tag: { cap: Infinity },
	},
	permadeath_reset: {
		tag: { cap: Infinity },
		genre: { cap: Infinity, multiplier: 0.9 },
		text: { cap: Infinity, multiplier: 0.8 },
	},
	run_variability: {
		text: { cap: Infinity, multiplier: 1.1 },
		genre: { cap: Infinity, multiplier: 0.9 },
		tag: { cap: Infinity, multiplier: 0.8 },
	},
} as const satisfies ScoreEngineSourcePolicy<RunBasedEvidenceGroup>;

export const RUN_BASED_ENGINE_SOURCE_PRIORITY_POLICY = {
	run_based_identity: {
		genre: 3,
		tag: 2,
		text: 1,
	},
	procedural_runs: SCORE_ENGINE_DEFAULT_SOURCE_PRIORITY,
	meta_progression: SCORE_ENGINE_DEFAULT_SOURCE_PRIORITY,
	permadeath_reset: {
		genre: 3,
		tag: 2,
		text: 1,
	},
	run_variability: SCORE_ENGINE_DEFAULT_SOURCE_PRIORITY,
} as const satisfies ScoreEngineSourcePriorityPolicy<RunBasedEvidenceGroup>;
