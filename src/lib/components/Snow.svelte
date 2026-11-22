<script lang="ts">
	/**
	 * 'around' – flakes fly in from the edges and settle around the (empty) centre of the screen.
	 * 'fall'   – flakes fall from the top of the screen (round results).
	 * `leaving` – flakes fly back off screen.
	 */
	let { mode = 'around', leaving = false }: { mode?: 'around' | 'fall'; leaving?: boolean } =
		$props();

	type Flake = { x: number; y: number; dx: number; dy: number; size: number; delay: number; dur: number };

	function make(): Flake[] {
		const flakes: Flake[] = [];
		while (flakes.length < 64) {
			const x = Math.random() * 100;
			const y = Math.random() * 100;
			// keep the middle clear for the "press to start" rectangle
			if (mode === 'around' && x > 26 && x < 74 && y > 30 && y < 72) continue;
			const angle = Math.atan2(y - 50, x - 50);
			flakes.push({
				x,
				y,
				dx: Math.cos(angle) * 90,
				dy: Math.sin(angle) * 90,
				size: 6 + Math.random() * 16,
				delay: Math.random() * 0.6,
				dur: 3 + Math.random() * 4
			});
		}
		return flakes;
	}

	const flakes = make();
</script>

<div class="snow" class:leaving aria-hidden="true">
	{#each flakes as f}
		<span
			class="flake {mode}"
			style:left="{f.x}%"
			style:top={mode === 'around' ? `${f.y}%` : '0'}
			style:width="{f.size}px"
			style:height="{f.size}px"
			style:--dx="{f.dx}vmax"
			style:--dy="{f.dy}vmax"
			style:--delay="{f.delay}s"
			style:--dur="{f.dur}s"
		></span>
	{/each}
</div>

<style>
	.snow {
		position: absolute;
		inset: 0;
		overflow: hidden;
		pointer-events: none;
		z-index: 1;
	}
	.flake {
		position: absolute;
		border-radius: 50%;
		background: radial-gradient(circle, #fff 30%, rgba(255, 255, 255, 0.5) 70%, transparent);
		filter: blur(0.4px);
	}
	.flake.around {
		animation:
			fly-in 1.1s cubic-bezier(0.2, 0.8, 0.3, 1) var(--delay) backwards,
			bob var(--dur) ease-in-out 1.2s infinite;
	}
	.leaving .flake.around {
		animation: fly-out 0.55s ease-in forwards;
	}
	.flake.fall {
		top: 0;
		opacity: 0;
		animation: fall var(--dur) linear var(--delay) infinite;
	}
	.leaving .flake.fall {
		animation: fade 0.4s forwards;
	}

	@keyframes fly-in {
		from {
			transform: translate(var(--dx), var(--dy));
			opacity: 0;
		}
	}
	@keyframes fly-out {
		to {
			transform: translate(var(--dx), var(--dy));
			opacity: 0;
		}
	}
	@keyframes bob {
		50% {
			transform: translate(6px, 10px);
		}
	}
	@keyframes fall {
		from {
			transform: translateY(-10vh);
			opacity: 0;
		}
		10% {
			opacity: 0.95;
		}
		85% {
			opacity: 0.95;
		}
		to {
			transform: translateY(105vh);
			opacity: 0;
		}
	}
	@keyframes fade {
		to {
			opacity: 0;
		}
	}
</style>
