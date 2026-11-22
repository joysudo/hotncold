<script lang="ts">
	let { text, sub = '' }: { text: string; sub?: string } = $props();
	import longsign from '#lib/assets/longsign-swapped-lighter.png';

	// Capture once: while a sign is lifting away it must keep its own text, not pick up the next one.
	// svelte-ignore state_referenced_locally
	const label = text;
	// svelte-ignore state_referenced_locally
	const subLabel = sub;
</script>

<div class="sign">
	<img src={longsign} alt="" />
	<div class="words">
		{#if subLabel}<p class="sub">{subLabel}</p>{/if}
		<h2>{label}</h2>
	</div>
</div>

<style>
	.sign {
		position: relative;
		display: grid;
		place-items: center;
		width: min(78vw, 340px);
		/* the board itself is 1790x715 of the 2000x1397 png; crop away the transparent margin */
		aspect-ratio: 1790 / 715;
		padding: 0 12%;
		overflow: hidden;
	}
	img {
		position: absolute;
		width: 111.7%;
		left: -6.7%;
		top: -50.3%;
		height: auto;
		pointer-events: none;
	}
	.words {
		position: relative;
		display: grid;
		justify-items: center;
		gap: 0.15rem;
	}
	.sub {
		margin: 0;
		font-size: clamp(0.8rem, 2.2vw, 1rem);
		letter-spacing: 0.06em;
		color: var(--ink);
	}
	h2 {
		position: relative;
		font-size: clamp(1.4rem, 4vw, 2.1rem);
		line-height: 1.05;
		color: var(--ink);
		text-align: center;
	}
</style>
