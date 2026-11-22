<script lang="ts">
	import type { SelectQ } from '#lib/data/questions.ts';

	let { q, value = $bindable() }: { q: SelectQ; value: string[] } = $props();
	let broken = $state<Record<string, boolean>>({});

	function toggle(id: string) {
		if (value.includes(id)) value = value.filter((v) => v !== id);
		else if (value.length < q.pick) value = [...value, id];
		else value = [...value.slice(1), id]; // replace the oldest pick
	}
</script>

<div class="grid">
	{#each q.options as o (o.id)}
		<button
			type="button"
			class="card"
			class:on={value.includes(o.id)}
			aria-pressed={value.includes(o.id)}
			onclick={() => toggle(o.id)}
		>
			{#if o.image && !broken[o.id]}
				<img
					src={o.image}
					alt=""
					referrerpolicy="no-referrer"
					onerror={() => (broken[o.id] = true)}
				/>
			{/if}
			<span>{o.label}</span>
		</button>
	{/each}
</div>

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
		gap: 0.7rem;
	}
	.card {
		display: grid;
		justify-items: center;
		align-content: center;
		gap: 0.4rem;
		min-height: 64px;
		padding: 0.6rem;
		background: var(--card-bg);
		border-radius: var(--blob-a);
		font-size: 1rem;
		transition:
			transform 0.15s,
			background 0.15s;
	}
	.card:hover {
		transform: translateY(-2px);
	}
	.card.on {
		background: var(--warm);
		transform: scale(1.04) rotate(-0.8deg);
	}
	img {
		width: 100%;
		height: 72px;
		object-fit: contain;
	}
</style>
