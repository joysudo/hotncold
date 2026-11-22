<script lang="ts">
	import type { Game } from '#lib/game/game.svelte.ts';

	let { game }: { game: Game } = $props();
	// svelte-ignore state_referenced_locally
	let a = $state(game.names[0]);
	// svelte-ignore state_referenced_locally
	let b = $state(game.names[1]);

	let second: HTMLInputElement;

	// Enter in the first name moves to the second; Enter in the second submits the form
	function nextField(e: KeyboardEvent) {
		if (e.key !== 'Enter') return;
		e.preventDefault();
		second.focus();
	}

	function enter(e: SubmitEvent) {
		e.preventDefault();
		game.begin([a.trim(), b.trim()]);
	}
</script>

<div class="wrap">
	<form class="panel" onsubmit={enter}>
		<h1>Hot <small>&amp;</small> <span class="cold">Cold</span></h1>
		<p class="tag">How well do you really know each other?</p>

		<div class="names">
			<label>
				<span>Partner one</span>
				<input
					bind:value={a}
					maxlength="20"
					placeholder="your name..."
					autocomplete="off"
					onkeydown={nextField}
				/>
			</label>
			<label>
				<span>Partner two</span>
				<input
					bind:this={second}
					bind:value={b}
					maxlength="20"
					placeholder="their name..."
					autocomplete="off"
				/>
			</label>
		</div>

		<div class="actions">
			<button class="btn" type="submit">Enter the night</button>
			<button class="btn ghost" type="button" onclick={() => game.showPast()}>Past results</button>
		</div>
	</form>
</div>

<style>
	.wrap {
		position: absolute;
		inset: 0 0 calc(var(--snow-h) * 0.5);
		display: grid;
		place-items: center;
		padding: 1rem;
	}
	.panel {
		width: min(100%, 520px);
		text-align: center;
		animation: rise 0.9s cubic-bezier(0.2, 1.1, 0.4, 1);
	}
	@keyframes rise {
		from {
			opacity: 0;
			transform: translateY(40px);
		}
	}
	h1 {
		font-size: clamp(3rem, 10vw, 4.6rem);
		color: var(--accent);
	}
	h1 .cold {
		color: var(--cold);
	}
	h1 small {
		font-size: 0.55em;
		color: var(--ink-soft);
	}
	.tag {
		margin: 0.3rem 0 1.4rem;
		color: var(--ink-soft);
		font-size: 1.1rem;
	}
	.names {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.8rem;
		margin-bottom: 1.4rem;
	}
	label {
		display: grid;
		gap: 0.3rem;
		text-align: left;
		font-size: 0.95rem;
		color: var(--ink-soft);
	}
	input {
		font-size: 1.2rem;
		padding: 0.55em 0.8em;
		background: var(--panel-dim);
		border: none;
		border-radius: var(--blob-a);
		width: 100%;
	}
	.actions {
		display: flex;
		gap: 0.8rem;
		justify-content: center;
		flex-wrap: wrap;
	}
	@media (max-width: 460px) {
		.names {
			grid-template-columns: 1fr;
		}
	}
</style>
