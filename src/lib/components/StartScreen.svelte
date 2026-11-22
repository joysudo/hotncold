<script lang="ts">
	import type { Game } from '#lib/game/game.svelte.ts';
	import snowglobe from '#lib/assets/snowglobe.png';

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
	<!-- the whole menu lives inside the snowglobe -->
	<form class="globe" onsubmit={enter}>
		<img class="glass" src={snowglobe} alt="" />

		<div class="content">
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
				<button class="btn ghost" type="button" onclick={() => game.showPast()}>
					Past results
				</button>
			</div>
		</div>
	</form>
</div>

<style>
	.wrap {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		padding-bottom: 0.5vh;
	}

	/* snowglobe.png is 1668x2388. Everything inside is sized in container-width units so the menu
	   scales with the globe. */
	.globe {
		position: relative;
		height: min(96vh, 148vw);
		aspect-ratio: 1668 / 2388;
		container-type: inline-size;
		animation: rise 0.9s cubic-bezier(0.2, 1.1, 0.4, 1);
	}
	@keyframes rise {
		from {
			opacity: 0;
			transform: translateY(40px);
		}
	}
	.glass {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
	}

	/* the glass is a circle in the top ~62% of the image; the presents sit in its lower right,
	   so the content stays above them */
	.content {
		position: absolute;
		left: 13%;
		right: 13%;
		top: 25%;
		height: 35%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		font-size: 3cqw;
	}
	h1 {
		font-size: 3.9em;
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
		margin: 0.3em 0 1em;
		color: var(--ink-soft);
		font-size: 1.05em;
	}
	.names {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.7em;
		width: 100%;
		margin-bottom: 1em;
	}
	label {
		display: grid;
		gap: 0.25em;
		text-align: left;
		font-size: 0.85em;
		color: var(--ink-soft);
	}
	input {
		font-size: 1.2em;
		padding: 0.45em 0.7em;
		background: var(--panel-dim);
		background: white;
		border: none;
		border-radius: var(--blob-a);
		width: 100%;
	}
	.actions {
		display: flex;
		gap: 0.7em;
		justify-content: center;
		flex-wrap: wrap;
	}
	.btn {
		font-size: 1.1em;
		padding: 0.55em 1.2em;
	}
</style>
