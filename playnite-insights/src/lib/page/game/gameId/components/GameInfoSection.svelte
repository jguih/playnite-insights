<script lang="ts">
	import type { GameInfoSectionProps } from "./game-info-section.types";

	const { title, children, ...props }: GameInfoSectionProps = $props();
</script>

<section>
	<h2 class="text-xl font-bold text-foreground">{title}</h2>
	<hr class="mt-1 mb-4 border-background-1/80 border-[0.085rem]" />
	<div {...props}>
		{@render children?.()}
	</div>
</section>
