<script lang="ts">
	import { fly } from 'svelte/transition';
	import type { Game } from '#lib/game/game.svelte.ts';
	import { TIER_COLOR, TIER_LABEL } from '#lib/game/scoring.ts';
	import Snow from './Snow.svelte';

	let { game }: { game: Game } = $props();

	const roundScore = $derived(game.roundPairs.reduce((s, p) => s + p.points, 0));
	const last = $derived(game.round === 2);
</script>

<Snow mode="fall" />
<div class="wrap">
	<section class="panel" in:fly={{ y: 600, duration: 1100, delay: 350 }}>
		<h2>{game.zone}</h2>
		<p class="total">round score <b>{roundScore}</b> <small>/ {game.roundPairs.length * 100}</small></p>
		<ul>
			{#each game.roundPairs as p (p.qid)}
				<li style:--tier={TIER_COLOR[p.tier]}>
					<span class="dot" style:background={TIER_COLOR[p.tier]}></span>
					<span class="text">{p.text}</span>
					<span class="tier" style:color={TIER_COLOR[p.tier]}>{TIER_LABEL[p.tier]}</span>
				</li>
			{/each}
		</ul>
		<button class="btn" type="button" onclick={() => game.afterRoundResults()}>
			{last ? 'see the final results' : 'on to the next stage'}
		</button>
	</section>
</div>

<style>
	.wrap {
		position: absolute;
		left: 0;
		right: 0;
		top: clamp(120px, 17vh, 160px);
		bottom: calc(var(--snow-h) * 0.55 + 70px);
		display: grid;
		place-items: center;
		padding: 0 1rem;
		pointer-events: none;
		z-index: 2;
	}
	.panel {
		pointer-events: auto;
		width: min(100%, 640px);
		max-height: 100%;
		overflow-y: auto;
		text-align: center;
	}
	h2 {
		font-size: 2.2rem;
	}
	.total {
		margin: 0.3rem 0 1rem;
		font-size: 1.1rem;
	}
	.total b {
		font-family: var(--font-heading);
		font-weight: 400;
		font-size: 2rem;
	}
	ul {
		list-style: none;
		padding: 0;
		margin: 0 0 1.2rem;
		display: grid;
		gap: 0.4rem;
		text-align: left;
	}
	li {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		background: color-mix(in srgb, var(--tier, var(--chilly)) 11%, white);
		border-radius: var(--blob-a);
		padding: 0.45rem 0.9rem;
	}
	.dot {
		flex: none;
		width: 14px;
		height: 14px;
		border-radius: 50%;
	}
	.text {
		flex: 1;
		font-size: 0.95rem;
	}
	.tier {
		font-family: var(--font-heading);
		font-size: 1.2rem;
	}
</style>
