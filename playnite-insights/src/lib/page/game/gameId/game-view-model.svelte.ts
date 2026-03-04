import type { GameClassification } from "$lib/modules/game-library/domain";
import {
	canonicalClassificationTiers,
	evidenceGroupTiers,
	type CanonicalClassificationTier,
	type ClassificationId,
	type EvidenceGroupTier,
} from "@playatlas/common/domain";
import { SvelteMap } from "svelte/reactivity";
import type { GameAggregateStore } from "./game-aggregate-store.svelte";
import {
	classificationTierRegistry,
	evidenceGroupTierRegistry,
	getScoreEngineGroupDetails,
	getScoreEngineLabel,
	scoreEngineRegistry,
	type EvidenceGroupMeta,
	type ScoreEngineMeta,
} from "./score-engine-registry";

type GameViewModelDeps = {
	gameAggregateStore: GameAggregateStore;
};

type EvidenceGroupDetails = EvidenceGroupMeta & {
	visible: boolean;
	rawTier: EvidenceGroupTier;
	tierLabel: () => string;
};

export type ClassificationsBreakdownMap = SvelteMap<
	ClassificationId,
	{
		groupDetails: EvidenceGroupDetails[];
		rawTier: CanonicalClassificationTier;
		tierLabel: () => string;
	} & ScoreEngineMeta
>;

export class GameViewModel {
	/**
	 * To consider classifications which total score was equal or higher than this threshold.
	 */
	private STRONGEST_CLASSIFICATIONS_MIN_SCORE = 0.2 as const;
	private CLASSIFICATIONS_BREAKDOWN_MIN_SCORE = 0.1 as const;
	private STRONGEST_CLASSIFICATIONS_EXCLUDED_TIERS: CanonicalClassificationTier[] = [
		"none",
		"weak",
	] as const;
	private CLASSIFICATIONS_BREAKDOWN_EXCLUDED_TIERS: CanonicalClassificationTier[] = [
		"none",
	] as const;

	private store: GameAggregateStore;
	private gameClassificationsOrderedByStrongest: SvelteMap<ClassificationId, GameClassification>;

	private classificationTierRank = Object.fromEntries(
		canonicalClassificationTiers.map((tier, i) => [tier, i]),
	) as Record<CanonicalClassificationTier, number>;

	private evidenceGroupTierRank = Object.fromEntries(
		evidenceGroupTiers.map((tier, i) => [tier, i]),
	) as Record<EvidenceGroupTier, number>;

	strongestClassificationsLabelSignal: string[];
	classificationsBreakdownSignal: ClassificationsBreakdownMap;

	constructor({ gameAggregateStore }: GameViewModelDeps) {
		this.store = gameAggregateStore;

		this.gameClassificationsOrderedByStrongest = $derived.by(() => {
			const gameClassifications = gameAggregateStore.latestGameClassifications;
			const entries: Array<{ classificationId: ClassificationId } & GameClassification> = [];

			for (const [classificationId, gameClassification] of gameClassifications) {
				entries.push({ classificationId, ...gameClassification });
			}

			entries.sort((a, b) => {
				const breakdownA = a.Breakdown.type === "normalized" ? a.Breakdown.breakdown : null;
				const breakdownB = b.Breakdown.type === "normalized" ? b.Breakdown.breakdown : null;

				const tierA = breakdownA?.tier ?? "none";
				const tierB = breakdownB?.tier ?? "none";

				const rankA = this.classificationTierRank[tierA];
				const rankB = this.classificationTierRank[tierB];

				if (rankA !== rankB) {
					return rankB - rankA;
				}

				if (a.Score !== b.Score) {
					return b.Score - a.Score;
				}

				return b.Id.localeCompare(a.Id);
			});

			return new SvelteMap(entries.map((e) => [e.classificationId, e]));
		});

		this.strongestClassificationsLabelSignal = $derived.by(() => {
			const gameClassifications = this.gameClassificationsOrderedByStrongest;
			const labels: string[] = [];

			for (const [classificationId, gameClassification] of gameClassifications) {
				if (this.shouldSkipGameClassification(gameClassification, "strongest")) continue;
				labels.push(getScoreEngineLabel(classificationId));
			}

			return labels;
		});

		this.classificationsBreakdownSignal = $derived.by(() => {
			const gameClassifications = this.gameClassificationsOrderedByStrongest;
			const evidenceGroupDetailsByClassification: ClassificationsBreakdownMap = new SvelteMap();

			// `gameClassifications.keys()` used to preserve original order (by strongest DESC)
			for (const classificationId of gameClassifications.keys()) {
				const gameClassification = gameClassifications.get(classificationId);

				if (!gameClassification) continue;

				if (this.shouldSkipGameClassification(gameClassification, "breakdown")) continue;

				const engineLabel = scoreEngineRegistry[classificationId].engineLabel;
				const engineDescription = scoreEngineRegistry[classificationId].engineDescription;
				evidenceGroupDetailsByClassification.set(classificationId, {
					groupDetails: [],
					engineDescription,
					engineLabel,
					rawTier: "none",
					tierLabel: classificationTierRegistry.none,
				});
			}

			for (const [classificationId, gameClassification] of gameClassifications) {
				const groupsMeta = gameClassification.EvidenceGroupMeta;
				const groupDetails = getScoreEngineGroupDetails(classificationId);
				const evidenceGroupDetails = evidenceGroupDetailsByClassification.get(classificationId);

				if (gameClassification.Breakdown.type !== "normalized") continue;
				if (!evidenceGroupDetails) continue;
				if (!groupsMeta) continue;

				const breakdown = gameClassification.Breakdown.breakdown;

				evidenceGroupDetails.rawTier = breakdown.tier;
				evidenceGroupDetails.tierLabel = classificationTierRegistry[breakdown.tier];

				const breakdownGroupDetails: Array<{
					name: string;
					visible: boolean;
					tier: EvidenceGroupTier;
				}> = [];

				for (const group of breakdown.groups) {
					if (group.contribution === 0) continue;

					const groupName = group.group;
					breakdownGroupDetails.push({
						name: groupName,
						visible: groupsMeta[groupName].userFacing,
						tier: group.tier,
					});
				}

				breakdownGroupDetails.sort((a, b) => {
					const tierA = a.tier ?? "none";
					const tierB = b.tier ?? "none";

					const rankA = this.evidenceGroupTierRank[tierA];
					const rankB = this.evidenceGroupTierRank[tierB];

					if (rankA !== rankB) {
						return rankB - rankA;
					}

					return b.name.localeCompare(a.name);
				});

				for (const breakdownGroupDetail of breakdownGroupDetails) {
					const groupName = breakdownGroupDetail.name;

					if (!(groupName in groupDetails)) continue;

					const details = groupDetails[groupName as keyof typeof groupDetails] as EvidenceGroupMeta;

					evidenceGroupDetails.groupDetails.push({
						...details,
						visible: breakdownGroupDetail.visible,
						rawTier: breakdownGroupDetail.tier,
						tierLabel: evidenceGroupTierRegistry[breakdownGroupDetail.tier],
					});
				}
			}

			return evidenceGroupDetailsByClassification;
		});
	}

	private shouldSkipGameClassification = (
		gameClassification: GameClassification,
		mode: "strongest" | "breakdown",
	): boolean => {
		const breakdown =
			gameClassification.Breakdown.type === "normalized"
				? gameClassification.Breakdown.breakdown
				: null;
		const excludedTiers =
			mode === "strongest"
				? this.STRONGEST_CLASSIFICATIONS_EXCLUDED_TIERS
				: this.CLASSIFICATIONS_BREAKDOWN_EXCLUDED_TIERS;
		const minScore =
			mode === "strongest"
				? this.STRONGEST_CLASSIFICATIONS_MIN_SCORE
				: this.CLASSIFICATIONS_BREAKDOWN_MIN_SCORE;

		if (breakdown && excludedTiers.includes(breakdown.tier)) return true;
		else if (!breakdown && gameClassification.NormalizedScore <= minScore) return true;
		return false;
	};

	get developersStringSignal(): string {
		if (this.store.developers.length === 0) return "";
		return this.store.developers.map((d) => d.Name).join(", ");
	}

	get publishersStringSignal(): string {
		if (this.store.publishers.length === 0) return "";
		return this.store.publishers.map((d) => d.Name).join(", ");
	}
}
