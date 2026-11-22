<script lang="ts">
	import { onMount } from 'svelte';
	import { promptText } from '#lib/data/questions.ts';
	import type { Game } from '#lib/game/game.svelte.ts';
	import { finalize, initialDraft, isComplete, type Draft } from '#lib/game/scoring.ts';
	import SelectInput from './inputs/SelectInput.svelte';
	import NumberInput from './inputs/NumberInput.svelte';
	import LikertInput from './inputs/LikertInput.svelte';
	import RankInput from './inputs/RankInput.svelte';
	import SingleInput from './inputs/SingleInput.svelte';
	import ScoreGuessInput from './inputs/ScoreGuessInput.svelte';

	let { game }: { game: Game } = $props();

	// This component is re-created for every question (keyed in +page.svelte), so reading
	// the current task once here is intentional.
	// svelte-ignore state_referenced_locally
	const task = game.currentTask!;
	// svelte-ignore state_referenced_locally
	const q = game.currentQuestion!;
	const mode = task.mode;
	const total = q.time;

	// "about you" -> the partner is irrelevant; "about partner" -> name the person being guessed
	// svelte-ignore state_referenced_locally
	const prompt = promptText(q, mode, game.otherName);

	let draft = $state<Draft>(initialDraft(q, mode));
	let left = $state(total);
	let done = false;

	function submit() {
		if (done) return;
		done = true;
		game.submit(finalize(q, mode, draft));
	}

	onMount(() => {
		const start = performance.now();
		const id = setInterval(() => {
			left = Math.max(0, total - (performance.now() - start) / 1000);
			if (left <= 0) {
				clearInterval(id);
				submit(); // time's up: lock in whatever is there
			}
		}, 100);
		return () => clearInterval(id);
	});

	const ready = $derived(isComplete(q, mode, draft));

	// Questions answered with taps submit themselves as soon as the answer is complete
	// (likert / single answer on click, select once all X are picked). A short pause lets the
	// player see their selection register. Free response submits on Enter instead.
	// A rating quiz (all likert items) submits once every statement has an answer; typed quizzes
	// (e.g. multiplication) still use Enter / the button, since a multi-digit answer can't be
	// told apart from a half-typed one.
	const autoSubmit =
		q.kind === 'likert' ||
		q.kind === 'single' ||
		q.kind === 'select' ||
		(q.kind === 'guessScore' && mode === 'self' && q.quiz.every((i) => i.type === 'likert'));
	$effect(() => {
		if (!autoSubmit || !ready) return;
		const id = setTimeout(submit, 350);
		return () => clearTimeout(id);
	});
	const urgent = $derived(left <= 5);
</script>

<div class="wrap">
	<section class="question">
		<div class="timer" class:urgent aria-hidden="true">
			<div class="fill" style:width="{(left / total) * 100}%"></div>
		</div>
		<div class="meta">
			<span class="chip">{mode === 'self' ? 'About you' : `About ${game.otherName}`}</span>
			<span class="secs" class:urgent>{Math.ceil(left)}s</span>
		</div>

		<h3 class="prompt">{prompt}</h3>

		<div class="input">
			{#if q.kind === 'select'}
				<SelectInput {q} bind:value={draft as string[]} />
			{:else if q.kind === 'number'}
				<NumberInput {q} bind:value={draft as number | null} onenter={() => ready && submit()} />
			{:else if q.kind === 'likert'}
				<LikertInput
					steps={q.steps}
					left={q.left}
					right={q.right}
					bind:value={draft as number | null}
				/>
			{:else if q.kind === 'rank'}
				<RankInput {q} bind:value={draft as string[]} />
			{:else if q.kind === 'single'}
				<SingleInput {q} bind:value={draft as string | null} />
			{:else if q.kind === 'guessScore'}
				<ScoreGuessInput {q} {mode} onenter={() => ready && submit()} bind:value={draft as number | (number | null)[]} />
			{/if}
		</div>

		{#if !autoSubmit}
			<div class="actions">
				<button class="btn" type="button" disabled={!ready} onclick={submit}>Lock it in</button>
			</div>
		{/if}
	</section>
</div>

<style>
	.wrap {
		position: absolute;
		left: 0;
		right: 0;
		/* clear of the hanging sign above and panda/snow/HUD below */
		top: clamp(120px, 17vh, 160px);
		bottom: calc(var(--snow-h) * 0.55 + 70px);
		display: grid;
		place-items: start center;
		padding: 0 1rem;
		pointer-events: none;
	}
	.question {
		pointer-events: auto;
		width: min(100%, 680px);
		color: var(--snow);
		--ink-soft: rgba(255, 255, 255, 0.85);
		animation: pop 0.45s cubic-bezier(0.2, 1.3, 0.4, 1);
	}
	@keyframes pop {
		from {
			transform: translateY(24px) scale(0.94);
			opacity: 0;
		}
	}
	.timer {
		height: 8px;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.28);
		overflow: hidden;
	}
	.fill {
		height: 100%;
		border-radius: 999px;
		background: linear-gradient(90deg, var(--warm), var(--warm));
		transition: width 0.1s linear, background 0.4s ease;
	}
	.timer.urgent .fill {
		background: var(--hot);
	}
	.meta {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin: 0.7rem 0 0.4rem;
	}
	.chip {
		background: rgba(255, 255, 255, 0.22);
		padding: 0.15em 0.9em;
		border-radius: 999px;
		font-size: 0.95rem;
	}
	.secs {
		font-family: var(--font-heading);
		font-size: 1.4rem;
	}
	.secs.urgent {
		color: var(--cold);
		animation: tick 1s infinite;
	}
	@keyframes tick {
		50% {
			transform: scale(1.2);
		}
	}
	.prompt {
		font-size: clamp(1.25rem, 3.2vw, 1.7rem);
		margin-bottom: 1rem;
		line-height: 1.25;
	}
	.actions {
		display: flex;
		justify-content: center;
		margin-top: 1.2rem;
	}
</style>
