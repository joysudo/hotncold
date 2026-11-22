<script lang="ts">
	import { fly } from 'svelte/transition';
	import { Game } from '#lib/game/game.svelte.ts';
	import Scene from '#lib/components/Scene.svelte';
	import WoodenSign from '#lib/components/WoodenSign.svelte';
	import Hud from '#lib/components/Hud.svelte';
	import StartScreen from '#lib/components/StartScreen.svelte';
	import PastResults from '#lib/components/PastResults.svelte';
	import TurnIntro from '#lib/components/TurnIntro.svelte';
	import QuestionView from '#lib/components/QuestionView.svelte';
	import Feedback from '#lib/components/Feedback.svelte';
	import RoundResults from '#lib/components/RoundResults.svelte';
	import EndScreen from '#lib/components/EndScreen.svelte';

	const game = new Game();

	const playing = $derived(game.phase !== 'start' && game.phase !== 'past');
	// a distinct key per question so the question card is rebuilt each time
	const questionKey = $derived(`${game.round}-${game.turn}-${game.taskIndex}`);
</script>

<Scene round={game.round} progress={game.progress} pandaState={game.pandaState}>
	<!-- wooden sign: hangs from the top for a player's whole turn; flies up when replaced -->
	{#key game.signKey}
		{#if game.signText}
			<div
				class="sign"
				in:fly|global={{ y: -360, duration: 800, delay: 650, opacity: 1 }}
				out:fly|global={{ y: -360, duration: 600, opacity: 1 }}
			>
				<WoodenSign text={game.signText} />
			</div>
		{/if}
	{/key}

	{#if game.phase === 'start'}
		<StartScreen {game} />
	{:else if game.phase === 'past'}
		<PastResults {game} />
	{:else if game.phase === 'turnIntro'}
		{#key `${game.round}-${game.turn}`}
			<TurnIntro onstart={() => game.startTurn()} />
		{/key}
	{:else if game.phase === 'question'}
		{#key questionKey}
			<QuestionView {game} />
		{/key}
	{:else if game.phase === 'feedback'}
		{#key questionKey}
			<Feedback {game} />
		{/key}
	{:else if game.phase === 'roundResults'}
		<RoundResults {game} />
	{:else if game.phase === 'end'}
		<EndScreen {game} />
	{/if}

	{#if playing}
		<Hud score={game.score} zone={game.zone} temp={game.temp} pandaState={game.pandaState} />
	{/if}
</Scene>

<style>
	.sign {
		position: absolute;
		top: 0;
		left: 50%;
		translate: -50% 0;
		z-index: 4;
		pointer-events: none;
	}
</style>
