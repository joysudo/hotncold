<script lang="ts">
	import { onMount } from 'svelte';
	import type { Game } from '#lib/game/game.svelte.ts';
	import { TIER_COLOR, TIER_LABEL } from '#lib/game/scoring.ts';

	let { game }: { game: Game } = $props();

	/** how long the popup stays up before the next question appears (ms) */
	const SHOW_MS = 1100;

	// This component is re-created for every answer (keyed in +page.svelte), so values are
	// captured once on purpose.
	// svelte-ignore state_referenced_locally
	const pair = game.lastPair!;
	const color = TIER_COLOR[pair.tier];
	// svelte-ignore state_referenced_locally
	const heading = game.feedbackHeading;
	// svelte-ignore state_referenced_locally
	const guesserName = game.name(pair.guesser);

	// no input needed: show the result, then move on by itself
	onMount(() => {
		const id = setTimeout(() => game.next(), SHOW_MS);
		return () => clearTimeout(id);
	});
</script>

<!-- whole-screen colour flash, easing down to a tint that lingers behind the popup -->
<div class="flash" style:--c={color} style:--ms="{SHOW_MS}ms" aria-hidden="true"></div>

<div class="popup" style:--ms="{SHOW_MS}ms" role="status" aria-live="polite">
	<h2 class="tier">{TIER_LABEL[pair.tier]}</h2>
	<p class="points">{pair.points > 0 ? `+${pair.points}` : 'No points'}</p>
	<p class="line">{heading}</p>
	<div class="answers">
		<p><span>Correct answer</span> {pair.actual}</p>
		<p class="guess"><span>{guesserName}’s guess</span> {pair.anticipated}</p>
	</div>
</div>

<style>
	.flash {
		position: fixed;
		inset: 0;
		z-index: 20;
		background: var(--c);
		pointer-events: none;
		animation: flash var(--ms) ease-out forwards;
	}
	@keyframes flash {
		0% {
			opacity: 0;
		}
		4% {
			opacity: 0.95;
		}
		25% {
			opacity: 0.4;
		}
		85% {
			opacity: 0.3;
		}
		100% {
			opacity: 0;
		}
	}

	.popup {
		position: fixed;
		inset: 0;
		z-index: 21;
		display: grid;
		align-content: center;
		justify-items: center;
		gap: 0.5rem;
		padding: 1rem;
		text-align: center;
		color: #fff;
		pointer-events: none;
		animation: popup var(--ms) cubic-bezier(0.2, 1.3, 0.4, 1) forwards;
	}
	@keyframes popup {
		0% {
			opacity: 0;
			transform: scale(0.4);
		}
		10% {
			opacity: 1;
			transform: scale(1.08);
		}
		16% {
			transform: scale(1);
		}
		88% {
			opacity: 1;
			transform: scale(1);
		}
		100% {
			opacity: 0;
			transform: scale(1.04);
		}
	}
	.tier {
		font-size: clamp(4rem, 17vw, 9rem);
	}
	.points {
		margin: 0;
		font-family: var(--font-heading);
		font-size: clamp(2rem, 6vw, 3.2rem);
	}
	.line {
		margin: 0.4rem 0 0;
		font-size: clamp(1.1rem, 3vw, 1.5rem);
	}
	.answers {
		margin-top: 1rem;
		display: grid;
		gap: 0.4rem;
		max-width: min(92vw, 640px);
	}
	.answers p {
		margin: 0;
		font-size: clamp(1.1rem, 3vw, 1.5rem);
		overflow-wrap: anywhere;
	}
	.answers span {
		display: block;
		font-size: 0.85rem;
		opacity: 0.85;
		letter-spacing: 0.04em;
	}
	.guess {
		opacity: 0.85;
		font-size: clamp(0.95rem, 2.4vw, 1.2rem);
	}
</style>
