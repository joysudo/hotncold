<script lang="ts">
	import type { RankQ } from '#lib/data/questions.ts';

	let { q, value = $bindable() }: { q: RankQ; value: string[] } = $props();
	let dragging = $state<number | null>(null);
	let over = $state<number | null>(null);

	const label = (id: string) => q.items.find((i) => i.id === id)?.label ?? id;
	const image = (id: string) => q.items.find((i) => i.id === id)?.image;

	function move(from: number, to: number) {
		if (to < 0 || to >= value.length || from === to) return;
		const next = [...value];
		const [item] = next.splice(from, 1);
		next.splice(to, 0, item);
		value = next;
	}
</script>

<p class="hint">drag to reorder — top is highest priority</p>
<ol>
	{#each value as id, i (id)}
		<li
			draggable="true"
			class:dragging={dragging === i}
			class:over={over === i && dragging !== i}
			ondragstart={() => (dragging = i)}
			ondragover={(e) => {
				e.preventDefault();
				over = i;
			}}
			ondragend={() => {
				dragging = null;
				over = null;
			}}
			ondrop={(e) => {
				e.preventDefault();
				if (dragging != null) move(dragging, i);
				dragging = null;
				over = null;
			}}
		>
			<span class="num">{i + 1}</span>
			{#if image(id)}<img src={image(id)} alt="" referrerpolicy="no-referrer" />{/if}
			<span class="label">{label(id)}</span>
			<span class="btns">
				<button type="button" aria-label="move up" disabled={i === 0} onclick={() => move(i, i - 1)}>▲</button>
				<button
					type="button"
					aria-label="move down"
					disabled={i === value.length - 1}
					onclick={() => move(i, i + 1)}>▼</button
				>
			</span>
		</li>
	{/each}
</ol>

<style>
	.hint {
		margin: 0 0 0.5rem;
		text-align: center;
		color: var(--ink-soft);
	}
	ol {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 0.5rem;
	}
	li {
		display: flex;
		align-items: center;
		gap: 0.8rem;
		padding: 0.5rem 0.9rem;
		background: rgba(255, 255, 255, 0.92);
		color: var(--ink);
		border-radius: var(--blob-a);
		cursor: grab;
		transition:
			transform 0.12s,
			background 0.12s;
	}
	li.dragging {
		opacity: 0.45;
	}
	li.over {
		background: var(--warm);
		transform: translateY(3px);
	}
	.num {
		font-family: var(--font-heading);
		font-size: 1.4rem;
		width: 1.4ch;
	}
	.label {
		flex: 1;
		font-size: 1.1rem;
	}
	img {
		height: 36px;
		width: 36px;
		object-fit: contain;
	}
	.btns {
		display: flex;
		gap: 0.25rem;
	}
	.btns button {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		background: var(--panel-dim);
		font-size: 0.75rem;
	}
	.btns button:disabled {
		opacity: 0.3;
		cursor: default;
	}
</style>
