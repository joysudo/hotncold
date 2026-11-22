<script lang="ts">
	import type { SingleQ } from '#lib/data/questions.ts';

	let { q, value = $bindable() }: { q: SingleQ; value: string | null } = $props();
</script>

<div class="grid" class:big={q.options.length > 12}>
	{#each q.options as o (o.id)}
		<button
			type="button"
			class:on={value === o.id}
			aria-pressed={value === o.id}
			onclick={() => (value = o.id)}
		>
			{o.label}
		</button>
	{/each}
</div>

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
		gap: 0.5rem;
	}
	.grid.big {
		grid-template-columns: repeat(auto-fit, minmax(70px, 1fr));
	}
	button {
		padding: 0.55rem 0.4rem;
		background: var(--card-bg);
		border-radius: var(--blob-a);
		font-size: 1rem;
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
		transform: scale(1.05);
	}
</style>
