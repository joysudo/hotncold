<script lang="ts">
	import type { NumberQ } from '#lib/data/questions.ts';

	let {
		q,
		value = $bindable(),
		onenter
	}: { q: NumberQ; value: number | null; onenter?: () => void } = $props();

	// numeric input only: block everything but digits (whole numbers, no sign/exponent)
	function onkeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault();
			onenter?.();
			return;
		}
		if (e.ctrlKey || e.metaKey || e.key.length > 1) return; // navigation / editing keys
		if (!/^\d$/.test(e.key)) e.preventDefault();
	}
	function oninput(e: Event & { currentTarget: HTMLInputElement }) {
		const digits = e.currentTarget.value.replace(/\D/g, '');
		if (digits === '') value = null;
		else value = Math.min(q.max * 10, parseInt(digits, 10));
		e.currentTarget.value = value == null ? '' : String(value);
	}
</script>

<div class="wrap">
	<input
		type="text"
		inputmode="numeric"
		pattern="[0-9]*"
		autocomplete="off"
		placeholder="0"
		aria-label="your number"
		value={value ?? ''}
		{onkeydown}
		{oninput}
	/>
</div>

<style>
	.wrap {
		display: grid;
		place-items: center;
	}
	input {
		width: 8ch;
		font-family: var(--font-heading);
		font-size: 3rem;
		text-align: center;
		padding: 0.2em 0.3em;
		background: var(--card-bg);
		border: none;
		border-radius: var(--blob-a);
	}
</style>
