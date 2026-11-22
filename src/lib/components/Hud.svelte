<script lang="ts">
	import { PANDA_STATES, type PandaState } from '#lib/game/game.svelte.ts';

	let {
		score,
		zone,
		temp,
		pandaState
	}: { score: number; zone: string; temp: number; pandaState: PandaState } = $props();
</script>

<div class="hud">
	<div class="row">
		<span class="score">score <b>{score}</b></span>
		<span class="zone">{zone}</span>
		<span class="state">{pandaState}</span>
	</div>
	<div class="bar">
		<div class="marker" style:left="{temp}%"></div>
	</div>
	<div class="ticks">
		{#each [...PANDA_STATES].reverse() as s}
			<span class:active={s === pandaState}>{s}</span>
		{/each}
	</div>
</div>

<style>
	.hud {
		position: absolute;
		left: 50%;
		bottom: 0.7rem;
		transform: translateX(-50%);
		width: min(92vw, 720px);
		color: var(--ink);
		z-index: 6;
	}
	.row {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		padding: 0 0.5rem 0.3rem;
		font-size: 1.05rem;
	}
	.score b {
		font-family: var(--font-heading);
		font-weight: 400;
		font-size: 1.6rem;
	}
	.zone {
		font-family: var(--font-heading);
		font-size: 1.5rem;
		text-transform: lowercase;
	}
	.state {
		color: var(--ink-soft);
		font-style: italic;
	}
	.bar {
		position: relative;
		height: 14px;
		border-radius: 999px;
		/* frozen (left) -> relaxed (right) */
		background: linear-gradient(
			90deg,
			var(--frozen) 10%,
			var(--chilly) 30%,
			var(--lukewarm) 50%,
			var(--warm) 70%,
			var(--hot) 90%
		);
	}
	.marker {
		position: absolute;
		top: -9px;
		width: 0;
		height: 0;
		transform: translateX(-50%);
		border-left: 9px solid transparent;
		border-right: 9px solid transparent;
		border-top: 14px solid var(--ink);
		transition: left 0.9s cubic-bezier(0.3, 1.4, 0.5, 1);
	}
	.ticks {
		display: flex;
		justify-content: space-between;
		padding: 0.25rem 0.1rem 0;
		font-size: 0.78rem;
		color: var(--ink-soft);
	}
	.ticks .active {
		color: var(--ink);
		font-weight: 700;
	}
</style>
