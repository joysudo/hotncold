<script lang="ts">
	let {
		steps,
		min = 1,
		left,
		right,
		value = $bindable()
	}: { steps: number; min?: number; left: string; right: string; value: number | null } = $props();
</script>

<div class="scale" role="radiogroup">
	{#each Array.from({ length: steps }, (_, i) => i + min) as n}
		<button
			type="button"
			role="radio"
			aria-checked={value === n}
			aria-label={String(n)}
			class:on={value === n}
			onclick={() => (value = n)}
		>
			{n}
		</button>
	{/each}
</div>
<div class="ends">
	<span>{left}</span>
	<span>{right}</span>
</div>

<style>
	.scale {
		display: flex;
		justify-content: space-between;
		gap: 0.4rem;
	}
	button {
		flex: 1;
		max-width: 64px;
		aspect-ratio: 1;
		border-radius: 50% 46% 54% 48%;
		background: var(--card-bg);
		font-size: 1.15rem;
		transition:
			transform 0.15s,
			background 0.15s;
	}
	button:hover {
		transform: translateY(-2px);
	}
	button.on {
		background: var(--accent);
		color: var(--snow);
		transform: scale(1.12);
	}
	.ends {
		display: flex;
		justify-content: space-between;
		margin-top: 0.6rem;
		color: var(--ink-soft);
		font-style: italic;
	}
</style>
