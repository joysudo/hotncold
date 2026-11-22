<script lang="ts">
	import type { Snippet } from 'svelte';
	import { PANDA_STATES, ZONES, type PandaState } from '#lib/game/game.svelte.ts';

	let {
		round,
		progress,
		pandaState,
		children
	}: { round: number; progress: number; pandaState: PandaState; children: Snippet } = $props();

	// placeholder red panda (CSS filters stand in for the five state images)
	const PANDA_IMG =
		'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTvROpvOPEotZwTJQKWdhBtCjgbXTW_jbmmQdtL0mo2-g&s=10';
	const PANDA_FILTER: Record<PandaState, string> = {
		relaxed: 'saturate(1.25) brightness(1.08) hue-rotate(-6deg)',
		content: 'none',
		cool: 'saturate(0.85) hue-rotate(25deg) brightness(1.02)',
		chilly: 'saturate(0.6) hue-rotate(90deg) brightness(1.08)',
		frozen: 'saturate(0.45) hue-rotate(150deg) brightness(1.3) contrast(0.9)'
	};
</script>

<div class="scene">
	<!-- 1. sky: tall gradient placeholder that slides up as the night progresses -->
	<div class="sky" style:transform="translateY(calc({progress} * -200vh))"></div>

	<!-- 2a. midground trees: placeholders that cross-fade per round -->
	<div class="trees">
		{#each ZONES as zone, i (zone)}
			<div class="tree-layer" style:opacity={i === round ? 1 : 0}>
				<span>tree placeholder · {zone}</span>
			</div>
		{/each}
	</div>

	<!-- 3. snow bank (placeholder) -->
	<div class="snow"></div>

	<!-- 2b. red panda, resting on the snow bank, in front of the trees -->
	<img
		class="panda"
		src={PANDA_IMG}
		alt="red panda ({pandaState})"
		referrerpolicy="no-referrer"
		style:filter={PANDA_FILTER[pandaState]}
	/>

	<div class="ui">{@render children()}</div>
</div>

<style>
	.scene {
		position: fixed;
		inset: 0;
		overflow: hidden;
	}

	.sky {
		position: absolute;
		left: 0;
		right: 0;
		top: 0;
		height: 300vh;
		/* sunset at the top of the tall sky, midnight at the bottom */
		background: linear-gradient(
			180deg,
			#ffcf9c 0%,
			#f7a07b 18%,
			#c46a8e 38%,
			#6f4a8f 55%,
			#2d2f69 75%,
			#10132e 100%
		);
		transition: transform 2.4s cubic-bezier(0.45, 0, 0.2, 1);
		z-index: 0;
	}

	.trees {
		position: absolute;
		left: 0;
		right: 0;
		bottom: calc(var(--snow-h) - 30px);
		height: 38vh;
		z-index: 1;
	}
	.tree-layer {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: end center;
		padding-bottom: 2.5rem;
		background: linear-gradient(0deg, rgba(20, 40, 50, 0.55), rgba(20, 40, 50, 0));
		color: rgba(255, 255, 255, 0.45);
		font-size: 0.9rem;
		transition: opacity 2s ease;
	}

	.snow {
		position: absolute;
		left: -5vw;
		right: -5vw;
		bottom: 0;
		height: var(--snow-h);
		background: linear-gradient(180deg, #ffffff 0%, #dbe7fb 100%);
		border-radius: 55% 45% 0 0 / 60px 80px 0 0;
		z-index: 2;
	}

	.panda {
		position: absolute;
		right: clamp(1rem, 7vw, 8rem);
		bottom: calc(var(--snow-h) - 34px);
		height: clamp(90px, 20vh, 190px);
		width: auto;
		z-index: 3;
		transition: filter 1.2s ease;
		transform-origin: bottom center;
		animation: sway 5s ease-in-out infinite;
		pointer-events: none;
	}
	@keyframes sway {
		50% {
			transform: rotate(1.8deg) translateY(-2px);
		}
	}

	.ui {
		position: absolute;
		inset: 0;
		z-index: 5;
	}
</style>
