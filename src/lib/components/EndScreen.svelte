<script lang="ts">
	import { fly } from 'svelte/transition';
	import type { Game } from '#lib/game/game.svelte.ts';
	import { TIER_COLOR, TIER_LABEL } from '#lib/game/scoring.ts';

	let { game }: { game: Game } = $props();

	const pairs = $derived(game.pairs);
	const best = $derived(pairs.reduce((a, b) => (b.closeness > a.closeness ? b : a), pairs[0]));
	const worst = $derived(pairs.reduce((a, b) => (b.closeness < a.closeness ? b : a), pairs[0]));
	const ZONES = ['sunset', 'dusk', 'midnight'];
</script>

<div class="scroll">
	<div class="content" in:fly={{ y: 500, duration: 900, delay: 300 }}>
		<section class="panel overview">
			<h2>the night is over</h2>
			<p class="big">{game.score}<small> / {game.maxScore}</small></p>
			<p class="names">{game.name(0)} &amp; {game.name(1)}</p>

			<div class="highlights">
				<div class="hl" style:--tier={best ? TIER_COLOR[best.tier] : undefined}>
					<h4>best match</h4>
					{#if best}
						<p>{best.text}</p>
						<p class="tag" style:color={TIER_COLOR[best.tier]}>{TIER_LABEL[best.tier]} · {best.actual}</p>
					{/if}
				</div>
				<div class="hl" style:--tier={worst ? TIER_COLOR[worst.tier] : undefined}>
					<h4>worst miss</h4>
					{#if worst}
						<p>{worst.text}</p>
						<p class="tag" style:color={TIER_COLOR[worst.tier]}>
							{TIER_LABEL[worst.tier]} · {worst.actual} vs {worst.anticipated}
						</p>
					{/if}
				</div>
			</div>

			<h4 class="chart-title">overall performance</h4>
			<div class="chart" role="img" aria-label="closeness of each answer, by round">
				{#each ZONES as zone, r}
					<div class="group">
						<div class="bars">
							{#each pairs.filter((p) => p.round === r) as p (p.qid)}
								<div
									class="bar"
									title="{p.text} — {TIER_LABEL[p.tier]}"
									style:height="{Math.max(6, p.closeness * 100)}%"
									style:background={TIER_COLOR[p.tier]}
								></div>
							{/each}
						</div>
						<span class="gl">{zone}</span>
					</div>
				{/each}
			</div>

			<div class="actions">
				<button class="btn" type="button" onclick={() => game.reset()}>play again</button>
				<button class="btn ghost" type="button" onclick={() => game.showPast()}>past results</button>
			</div>
		</section>

		<section class="panel detail">
			<div class="cols head">
				<h3>actual answer</h3>
				<h3>anticipated answer</h3>
			</div>
			{#each pairs as p (p.qid)}
				<p class="qtext">{p.text}</p>
				<div class="cols">
					<div class="cell" style:--tier={TIER_COLOR[p.tier]}>{p.actual}</div>
					<div class="cell" style:background="color-mix(in srgb, {TIER_COLOR[p.tier]} 62%, white)">
						{p.anticipated}
					</div>
				</div>
			{/each}
		</section>
	</div>
</div>

<style>
	.scroll {
		position: absolute;
		inset: 0;
		overflow-y: auto;
		padding: 1.5rem 1rem calc(var(--snow-h) * 0.6 + 80px);
		/* the sign hangs at the top */
		padding-top: clamp(120px, 17vh, 160px);
	}
	.content {
		width: min(100%, 760px);
		margin: 0 auto;
		display: grid;
		gap: 1.2rem;
	}
	.overview {
		text-align: center;
	}
	.big {
		font-family: var(--font-heading);
		font-size: clamp(3.4rem, 10vw, 5.5rem);
		margin: 0.3rem 0 0;
		line-height: 1;
	}
	.big small {
		font-size: 0.4em;
		color: var(--ink-soft);
	}
	.names {
		margin: 0.2rem 0 1.2rem;
		color: var(--ink-soft);
	}
	.highlights {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.8rem;
		text-align: left;
	}
	.hl {
		background: color-mix(in srgb, var(--tier, var(--chilly)) 11%, white);
		border-radius: var(--blob-a);
		padding: 0.8rem 1rem;
	}
	.hl p {
		margin: 0.3rem 0 0;
		font-size: 0.95rem;
	}
	.tag {
		font-weight: 700;
	}
	.chart-title {
		margin: 1.4rem 0 0.5rem;
	}
	.chart {
		display: flex;
		gap: 1rem;
		height: 150px;
		align-items: stretch;
		background: color-mix(in srgb, var(--tier, var(--chilly)) 11%, white);
		border-radius: var(--blob-a);
		padding: 0.8rem 1rem 0.5rem;
	}
	.group {
		flex: 1;
		display: flex;
		flex-direction: column;
	}
	.bars {
		flex: 1;
		display: flex;
		align-items: flex-end;
		gap: 6px;
	}
	.bar {
		flex: 1;
		border-radius: 14px 14px 4px 4px;
		transform-origin: bottom;
		animation: grow 1s cubic-bezier(0.2, 1.2, 0.4, 1) 1.1s backwards;
	}
	@keyframes grow {
		from {
			transform: scaleY(0);
		}
	}
	.gl {
		text-align: center;
		font-size: 0.85rem;
		color: var(--ink-soft);
		padding-top: 0.3rem;
	}
	.actions {
		display: flex;
		gap: 0.8rem;
		justify-content: center;
		flex-wrap: wrap;
		margin-top: 1.4rem;
	}
	.cols {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.7rem;
	}
	.cols.head {
		text-align: center;
		margin-bottom: 0.4rem;
	}
	.qtext {
		margin: 0.9rem 0 0.3rem;
		font-size: 0.95rem;
		color: var(--ink-soft);
		font-style: italic;
	}
	.cell {
		background: color-mix(in srgb, var(--tier, var(--chilly)) 11%, white);
		border-radius: var(--blob-a);
		padding: 0.55rem 0.8rem;
		overflow-wrap: anywhere;
	}
	@media (max-width: 520px) {
		.highlights {
			grid-template-columns: 1fr;
		}
	}
</style>
