<script lang="ts">
	import { onMount } from 'svelte';
	import type { Game } from '#lib/game/game.svelte.ts';
	import { TIERS, TIER_COLOR, TIER_LABEL } from '#lib/game/scoring.ts';
	import { clearResults, loadResults, type SavedResult } from '#lib/game/storage.ts';

	let { game }: { game: Game } = $props();
	let results = $state<SavedResult[]>([]);

	onMount(() => {
		results = loadResults();
	});

	function clear() {
		clearResults();
		results = [];
	}
	const fmt = (iso: string) =>
		new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
</script>

<div class="wrap">
	<section class="panel">
		<h2>Past results</h2>
		{#if results.length === 0}
			<p class="empty">No nights recorded yet — go enter one.</p>
		{:else}
			<ul>
				{#each results as r (r.id)}
					<li>
						<div>
							<strong>{r.names[0]} &amp; {r.names[1]}</strong>
							<span class="date">{fmt(r.date)}</span>
						</div>
						<div class="tiers">
							{#each TIERS as t}
								{@const n = r.pairs.filter((p) => p.tier === t).length}
								<span style:color={TIER_COLOR[t]} title={TIER_LABEL[t]}>● {n}</span>
							{/each}
						</div>
						<b class="score">{r.score}<small>/{r.maxScore}</small></b>
					</li>
				{/each}
			</ul>
		{/if}
		<div class="actions">
			<button class="btn" type="button" onclick={() => game.showStart()}>Back</button>
			{#if results.length}
				<button class="btn ghost" type="button" onclick={clear}>Clear history</button>
			{/if}
		</div>
	</section>
</div>

<style>
	.wrap {
		position: absolute;
		inset: 0 0 calc(var(--snow-h) * 0.5);
		display: grid;
		place-items: center;
		padding: 1rem;
	}
	.panel {
		width: min(100%, 600px);
		max-height: 100%;
		overflow-y: auto;
		text-align: center;
	}
	.empty {
		color: var(--ink-soft);
		margin: 1rem 0;
	}
	ul {
		list-style: none;
		padding: 0;
		margin: 1rem 0;
		display: grid;
		gap: 0.5rem;
		text-align: left;
	}
	li {
		display: flex;
		align-items: center;
		gap: 0.8rem;
		justify-content: space-between;
		flex-wrap: wrap;
		background: color-mix(in srgb, var(--tier, var(--chilly)) 11%, white);
		border-radius: var(--blob-a);
		padding: 0.6rem 1rem;
	}
	.date {
		display: block;
		font-size: 0.85rem;
		color: var(--ink-soft);
	}
	.tiers {
		display: flex;
		gap: 0.6rem;
		font-size: 0.95rem;
	}
	.score {
		font-family: var(--font-heading);
		font-weight: 400;
		font-size: 1.6rem;
	}
	.score small {
		font-size: 0.6em;
		color: var(--ink-soft);
	}
	.actions {
		display: flex;
		gap: 0.8rem;
		justify-content: center;
	}
</style>
