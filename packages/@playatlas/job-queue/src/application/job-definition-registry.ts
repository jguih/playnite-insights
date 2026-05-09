import type { IJobDefinitionRegistry } from "./job-definition-registry.port";
import type { JobDefinition } from "./job-definition.type";

export type JobDefinitionRegistryDeps = {
	jobDefinitions: JobDefinition<unknown>[];
};

/**
 * Creates an instance of {@link IJobDefinitionRegistry}.
 *
 * @see {@link IJobDefinitionRegistry}
 */
export const makeJobDefinitionRegistry = ({
	jobDefinitions,
}: JobDefinitionRegistryDeps): IJobDefinitionRegistry => {
	const definitionsByType = new Map();

	for (const definition of jobDefinitions) {
		if (definitionsByType.has(definition.type)) {
			throw new Error(`Detected duplicated job definition for ${definition.type}`);
		}

		definitionsByType.set(definition.type, definition);
	}

	return {
		get: (type) => definitionsByType.get(type) ?? null,
	};
};
