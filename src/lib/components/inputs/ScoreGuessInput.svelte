<script lang="ts">
	import type { GuessScoreQ } from '#lib/data/questions.ts';
	import LikertInput from './LikertInput.svelte';

	let {
		q,
		mode,
		value = $bindable(),
		onenter
	}: {
		onenter?: () => void;
		q: GuessScoreQ;
		mode: 'self' | 'guess';
		/** self: one answer per quiz item. guess: the estimated score. */
		value: (number | null)[] | number;
	} = $props();

	const answers = $derived(value as (number | null)[]);
	function set(i: number, v: number | null) {
		const next = [...answers];
		next[i] = v;
		value = next;
	}
	function onNumber(i: number, e: Event & { currentTarget: HTMLInputElement }) {
		const digits = e.currentTarget.value.replace(/\D/g, '');
		e.currentTarget.value = digits;
		set(i, digits === '' ? null : parseInt(digits, 10));
	}
</script>

{#if mode === 'self'}
	<div class="quiz">
		{#each q.quiz as item, i}
			<div class="item">
				<p>{item.q}{item.type === 'number' ? ' = ?' : ''}</p>
				{#if item.type === 'number'}
					<input
						type="text"
						inputmode="numeric"
						autocomplete="off"
						aria-label={item.q}
						value={answers[i] ?? ''}
						oninput={(e) => onNumber(i, e)}
						onkeydown={(e) => {
							if (e.key === 'Enter') onenter?.();
						}}
					/>
				{:else}
					<LikertInput
						steps={item.steps}
						left={item.left}
						right={item.right}
						bind:value={() => answers[i], (v) => set(i, v)}
					/>
				{/if}
			</div>
		{/each}
	</div>
{:else}
	<div class="guess">
		<output>{value} <small>{q.unit}</small></output>
		<input
			type="range"
			min={q.min}
			max={q.max}
			step="1"
			aria-label="estimated score"
			value={value as number}
			oninput={(e) => (value = +e.currentTarget.value)}
		/>
		<div class="ends"><span>{q.min}</span><span>{q.max}</span></div>
	</div>
{/if}

<style>
	.quiz {
		display: grid;
		gap: 0.9rem;
	}
	.item {
		color: var(--ink);
		--ink-soft: #4a5578;
		background: var(--panel-dim);
		border-radius: var(--blob-a);
		padding: 0.7rem 1rem;
	}
	.item p {
		margin: 0 0 0.4rem;
		font-size: 1.1rem;
	}
	.item input[type='text'] {
		width: 7ch;
		font-family: var(--font-heading);
		font-size: 1.8rem;
		text-align: center;
		background: #fff;
		border: none;
		border-radius: 18px 24px 20px 26px;
	}
	.guess {
		display: grid;
		gap: 0.5rem;
		text-align: center;
	}
	output {
		font-family: var(--font-heading);
		font-size: 3rem;
	}
	output small {
		font-family: var(--font-body);
		font-size: 1rem;
		color: var(--ink-soft);
	}
	input[type='range'] {
		width: 100%;
		accent-color: var(--accent);
	}
	.ends {
		display: flex;
		justify-content: space-between;
		color: var(--ink-soft);
	}
</style>
