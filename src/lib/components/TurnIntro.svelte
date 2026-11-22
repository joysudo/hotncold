<script lang="ts">
	import Snow from './Snow.svelte';

	let { onstart }: { onstart: () => void } = $props();
	let leaving = $state(false);

	function press() {
		if (leaving) return;
		leaving = true; // snowflakes fly away, then the questions pop up
		setTimeout(onstart, 550);
	}
</script>

<Snow mode="around" {leaving} />
<div class="center">
	<button class="start" type="button" onclick={press} class:leaving>press to start.</button>
</div>

<style>
	.center {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		z-index: 2;
	}
	.start {
		font-family: var(--font-heading);
		font-size: clamp(1.6rem, 4vw, 2.4rem);
		padding: 1.6rem 3rem;
		background: var(--panel);
		color: var(--ink);
		border-radius: var(--blob-b);
		animation: float-in 0.8s cubic-bezier(0.2, 1.2, 0.4, 1) 0.5s backwards;
		transition: transform 0.2s;
	}
	.start:hover {
		transform: scale(1.04) rotate(-1deg);
	}
	.start.leaving {
		animation: out 0.5s ease-in forwards;
	}
	@keyframes float-in {
		from {
			opacity: 0;
			transform: translateY(30px) scale(0.9);
		}
	}
	@keyframes out {
		to {
			opacity: 0;
			transform: scale(0.85);
		}
	}
</style>
