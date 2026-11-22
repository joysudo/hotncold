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
	// typed inputs, by quiz index (null for rating items), so Enter can move to the next one
	let fields = $state<(HTMLInputElement | null)[]>([]);

	/** Enter: jump to the next typed answer; on the last one, submit (if everything is answered) */
	function enterFrom(i: number, e: KeyboardEvent) {
		if (e.key !== 'Enter') return;
		e.preventDefault();
		const next = fields.findIndex((f, j) => j > i && f);
		if (next >= 0) fields[next]?.focus();
		else onenter?.();
	}
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
			<div class="item" class:rating={item.type === 'likert'}>
				<p>{item.q}{item.type === 'number' ? ' = ?' : ''}</p>
				{#if item.type === 'number'}
					<input
						type="text"
						inputmode="numeric"
						autocomplete="off"
						aria-label={item.q}
						bind:this={fields[i]}
						value={answers[i] ?? ''}
						oninput={(e) => onNumber(i, e)}
						onkeydown={(e) => enterFrom(i, e)}
					/>
				{:else}
					<LikertInput
						steps={item.steps}
						min={item.min}
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
		--ink-soft: rgba(81, 17, 6, 0.72);
		background: var(--card-bg);
		border-radius: var(--blob-a);
		padding: 0.7rem 1rem;
	}
	/* rating rows sit directly on the backdrop: no card, white text above and below the scale */
	.item.rating {
		background: transparent;
		color: var(--snow);
		--ink-soft: var(--snow);
		padding-left: 0;
		padding-right: 0;
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
		background: var(--snow);
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
