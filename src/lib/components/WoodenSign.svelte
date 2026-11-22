<script lang="ts">
	let { text }: { text: string } = $props();
	// Capture once: while a sign is lifting away it must keep its own text, not pick up the next one.
	// svelte-ignore state_referenced_locally
	const label = text;

	// placeholder sign art
	const SIGN_IMG =
		'https://t4.ftcdn.net/jpg/02/52/10/17/360_F_252101753_vR1AoclwIOLWcXfxQED1Xt00QyrafAwQ.jpg';
</script>

<div class="sign">
	<img src={SIGN_IMG} alt="" referrerpolicy="no-referrer" />
	<h2>{label}</h2>
</div>

<style>
	.sign {
		position: relative;
		display: grid;
		place-items: center;
		min-width: min(78vw, 360px);
		min-height: 96px;
		padding: 1rem 2.4rem;
		background: linear-gradient(180deg, #a6733f, #7d5230);
		overflow: hidden;
	}
	img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	h2 {
		position: relative;
		font-size: clamp(1.6rem, 4.5vw, 2.4rem);
		color: #fff7e6;
		text-align: center;
	}
</style>
