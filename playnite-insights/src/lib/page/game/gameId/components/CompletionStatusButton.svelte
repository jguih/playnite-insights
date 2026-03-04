<script lang="ts">
	import type { CompletionStatus } from "$lib/modules/game-library/domain";
	import SolidButton from "$lib/ui/components/buttons/SolidButton.svelte";
	import type { BaseButtonProps } from "$lib/ui/components/buttons/types";
	import Icon from "$lib/ui/components/Icon.svelte";
	import type { ComponentVariant } from "$lib/ui/components/types";
	import { Gamepad2Icon } from "@lucide/svelte";
	import ActionButtonContainer from "./ActionButtonContainer.svelte";
	import ActionButtonLabel from "./ActionButtonLabel.svelte";

	let {
		completionStatus,
		...props
	}: BaseButtonProps & { completionStatus?: CompletionStatus | null } = $props();

	const variant: ComponentVariant = $derived(
		completionStatus?.Name?.match(/playing/i)
			? "success"
			: completionStatus?.Name?.match(/not played/i)
				? "neutral"
				: "primary",
	);
</script>

<ActionButtonContainer>
	<SolidButton
		{variant}
		iconOnly
		size="xl"
		{...props}
		class={["text-4xl!", props.class]}
	>
		<Icon>
			<Gamepad2Icon />
		</Icon>
	</SolidButton>
	<ActionButtonLabel>
		{completionStatus?.Name ?? "Unknown status"}
	</ActionButtonLabel>
</ActionButtonContainer>
