<script lang="ts">
	import type { Snippet } from 'svelte';
	import { PANDA_STATES, ZONES, type PandaState } from '#lib/game/game.svelte.ts';

	let {
		round,
		progress,
		pandaState,
		children
	}: { round: number; progress: number; pandaState: PandaState; children: Snippet } = $props();

	import relaxedPanda from '#lib/assets/relaxedredpanda.png';
	import contentPanda from '#lib/assets/contentredpanda.png';
	import neutralPanda from '#lib/assets/neutralredpanda.png';
	import chillyPanda from '#lib/assets/chillyredpanda.png';
	import freezingPanda from '#lib/assets/freezingredpanda.png';
	import snowtopper from '#lib/assets/snowtopper.png';
	import trees from '#lib/assets/trees-long.png';

	// One tree image per round (sunset, dusk, midnight); they cross-fade as the night goes on.
	// Only one drawing exists so far, so every round uses it — swap in the others here.
	const TREES = [trees, trees, trees];

	// All five states are drawn. The images share a 1668x2388 canvas, so they're cropped to the same box
	// (x 270–1449, y 415–1910 in source px) and drawn at the same scale. Roughly the bottom third
	// of that box is empty space or a hanging tail, so each pose also has a `ground` line (source y
	// where it actually touches down) and is lowered until that line sits on the snow.
	const ART_W = 1179; // crop width (source px)
	const ART_H = 1495; // crop height (source px)
	const ART_TOP = 415; // crop top (source px)
	const ART_BOTTOM = ART_TOP + ART_H;
	const ART: Record<PandaState, { src: string; ground: number }> = {
		relaxed: { src: relaxedPanda, ground: 1300 }, // sits on its curled tail
		content: { src: contentPanda, ground: 1300 }, // curled up
		cool: { src: neutralPanda, ground: 1300 }, // paws; tail hangs below
		chilly: { src: chillyPanda, ground: 1300 }, // same pose as cool
		frozen: { src: freezingPanda, ground: 1300 } // same pose as relaxed
	};

	const art = $derived(ART[pandaState]);
</script>

<div class="scene">
	<!-- 1. sky: tall gradient placeholder that slides up as the night progresses -->
	<div class="sky" style:transform="translateY(calc({progress} * -200vh))"></div>

	<!-- 2a. midground trees: placeholders that cross-fade per round -->
	<div class="trees">
		{#each ZONES as zone, i (zone)}
			<img class="tree-layer" src={TREES[i]} alt="" style:opacity={i === round ? 1 : 0} />
		{/each}
	</div>

	<!-- 3. snow bank: a white rectangle with the drawn snow-topper strip along its top edge -->
	<div class="snow">
		<img class="topper" src={snowtopper} alt="" />
	</div>

	<!-- 2b. red panda, resting on the snow bank, in front of the trees -->
	<div
		class="panda"
				style:aspect-ratio="{ART_W} / {ART_H}"
		style:--drop={(ART_BOTTOM - art.ground) / ART_H}
	>
		<img
			class="drawn"
			src={art.src}
			alt="red panda ({pandaState})"
			style:width="{(1668 / ART_W) * 100}%"
			style:left="{(-270 / ART_W) * 100}%"
			style:top="{(-ART_TOP / ART_H) * 100}%"
		/>
	</div>

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
		/* THIS IS THE IMPORTANT GRADIENT BACKGROUND THING */
		background: linear-gradient(
			180deg,
			#de7e5d 0%,
			#e6a998 18%,
			#ac90a0 38%,
			#7076a8 55%,
			#32417e 75%,
			#0b1f62 100%
		);
		transition: transform 2.4s cubic-bezier(0.45, 0, 0.2, 1);
		z-index: 0;
	}

	.trees {
		position: absolute;
		left: 0;
		right: 0;
		bottom: calc(var(--snow-h) - 30px);
		/* the artwork fills the lower ~46.5% (of the width) of trees.png; cap it on short screens */
		height: min(46.6vw, 70vh);
		z-index: 1;
		pointer-events: none;
	}
	.tree-layer {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: bottom center;
		transition: opacity 2s ease;
	}

	.snow {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		height: var(--snow-h);
		background: var(--snow);
		z-index: 2;
	}
	/* snowtopper.png is 2388x72: it sits on the rectangle's top edge, full width */
	.topper {
		position: absolute;
		left: 0;
		bottom: calc(100% - 1px); /* 1px overlap hides any seam */
		width: 100%;
		height: auto;
		display: block;
		pointer-events: none;
	}

	.panda {
		position: absolute;
		right: clamp(1rem, 7vw, 8rem);
		--panda-h: clamp(130px, 28vh, 270px);
		/* --drop = fraction of the panda's height that hangs below its ground line (tail/empty) */
		/* ground line sits just inside the textured top edge of the snow (topper is 72/2388 of the width) */
		bottom: calc(var(--snow-h) + 3.02vw - 24px - var(--panda-h) * var(--drop, 0));
		height: var(--panda-h);
		z-index: 3;
		transform-origin: bottom center;
		animation: sway 5s ease-in-out infinite;
		pointer-events: none;
	}
	.panda {
		overflow: hidden;
	}
	.panda img {
		pointer-events: none;
	}
	.panda .drawn {
		position: absolute;
		height: auto;
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
