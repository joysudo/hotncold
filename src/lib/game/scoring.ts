import type { Answer, Question } from '#lib/data/questions.ts';

export type Tier = 'exact' | 'warm' | 'cold' | 'frozen';
export type Draft = Answer | (number | null)[];

export const TIERS: Tier[] = ['exact', 'warm', 'cold', 'frozen'];
/** the "temperature" word shown to players for each tier */
export const TIER_LABEL: Record<Tier, string> = {
	exact: 'Hot',
	warm: 'Warm',
	cold: 'Cold',
	frozen: 'Frozen'
};
export const TIER_POINTS: Record<Tier, number> = { exact: 100, warm: 60, cold: 20, frozen: 0 };
/** how much each tier warms (+) or cools (-) the red panda (0–100 scale) */
export const TIER_TEMP: Record<Tier, number> = { exact: 12, warm: 5, cold: -7, frozen: -13 };
export const TIER_COLOR: Record<Tier, string> = {
	exact: 'var(--hot)',
	warm: 'var(--warm)',
	cold: 'var(--cold)',
	frozen: 'var(--frozen)'
};

/**
 * Feedback copy. [0] is used when the player now answering was the *guesser*
 * ("you scored..."); [1] is used when they were the *subject* and their partner guessed.
 * `{other}` is the other player's name.
 */
export const TIER_COPY: Record<Tier, [string, string]> = {
	exact: ['You scored exactly right!', 'Exactly what {other} guessed!'],
	warm: ['You were close…', '{other} guessed close…'],
	cold: ['Brr.', '{other} was off.'],
	frozen: ['Are you sure you know {other}?', 'Pull {other} for a chat.']
};

export function tierOf(c: number): Tier {
	if (c >= 0.999) return 'exact';
	if (c >= 0.6) return 'warm';
	if (c >= 0.25) return 'cold';
	return 'frozen';
}

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

export function shuffle<T>(list: T[]): T[] {
	const a = [...list];
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}

/** 0..1 — how close `guess` was to `truth`. 1 means an exact match. */
export function closeness(q: Question, truth: Answer, guess: Answer): number {
	if (truth == null || guess == null) return 0;
	switch (q.kind) {
		case 'select': {
			const t = truth as string[];
			const overlap = (guess as string[]).filter((x) => t.includes(x)).length;
			const r = overlap / q.pick;
			if (r >= 1) return 1;
			if (r >= 0.5) return 0.6 + (r - 0.5) * 0.2;
			return r > 0 ? 0.3 : 0;
		}
		case 'number':
		case 'guessScore': {
			const range = Math.max(1, q.max - q.min);
			return clamp01(1 - Math.abs((truth as number) - (guess as number)) / range);
		}
		case 'likert':
			return clamp01(1 - Math.abs((truth as number) - (guess as number)) / (q.steps - 1));
		case 'rank': {
			const t = truth as string[];
			const g = guess as string[];
			const pos = new Map(t.map((id, i) => [id, i]));
			let inversions = 0;
			for (let i = 0; i < g.length; i++)
				for (let j = i + 1; j < g.length; j++)
					if ((pos.get(g[i]) ?? 0) > (pos.get(g[j]) ?? 0)) inversions++;
			const pairs = (g.length * (g.length - 1)) / 2;
			return pairs ? clamp01(1 - inversions / pairs) : 1;
		}
		case 'single': {
			if (truth === guess) return 1;
			if (q.metric === 'exact') return 0;
			if (q.metric === 'letters') {
				const a = String(truth);
				const b = String(guess);
				let match = 0;
				for (let i = 0; i < a.length; i++) if (a[i] === b[i]) match++;
				return match === a.length ? 1 : (match / a.length) * 0.95;
			}
			const ids = q.options.map((o) => o.id);
			const n = ids.length;
			const d = Math.abs(ids.indexOf(String(truth)) - ids.indexOf(String(guess)));
			return clamp01(1 - Math.min(d, n - d) / (n / 2));
		}
	}
}

/** Human-readable version of an answer, used in the feedback + results screens. */
export function formatAnswer(q: Question, a: Answer): string {
	if (a == null) return 'No answer';
	switch (q.kind) {
		case 'select': {
			const label = (id: string) => q.options.find((o) => o.id === id)?.label ?? id;
			return (a as string[]).map(label).join(', ') || 'No answer';
		}
		case 'rank': {
			const label = (id: string) => q.items.find((o) => o.id === id)?.label ?? id;
			return (a as string[]).map(label).join(' › ');
		}
		case 'single':
			return q.options.find((o) => o.id === a)?.label ?? String(a);
		case 'likert':
			return `${a} of ${q.steps} (${q.left} ↔ ${q.right})`;
		case 'guessScore':
			return `${a} ${q.unit} (out of ${q.max})`;
		case 'number':
			return String(a);
	}
}

// ---- answer drafting helpers (used by the question UI) ----------------------------------

export function initialDraft(q: Question, mode: 'self' | 'guess'): Draft {
	switch (q.kind) {
		case 'select':
			return [];
		case 'rank':
			return shuffle(q.items.map((i) => i.id));
		case 'guessScore':
			return mode === 'self' ? q.quiz.map(() => null) : Math.round((q.min + q.max) / 2);
		default:
			return null;
	}
}

export function isComplete(q: Question, mode: 'self' | 'guess', draft: Draft): boolean {
	switch (q.kind) {
		case 'select':
			return (draft as string[]).length === q.pick;
		case 'rank':
			return true;
		case 'guessScore':
			return mode === 'self' ? (draft as (number | null)[]).every((v) => v != null) : true;
		default:
			return draft != null;
	}
}

/** Convert the in-progress draft to the answer that gets recorded (null when nothing usable). */
export function finalize(q: Question, mode: 'self' | 'guess', draft: Draft): Answer {
	if (q.kind === 'guessScore' && mode === 'self') {
		const answers = draft as (number | null)[];
		if (answers.every((v) => v == null)) return null;
		return quizScore(q, answers);
	}
	if (q.kind === 'select') {
		const picks = draft as string[];
		return picks.length ? picks : null;
	}
	return draft as Answer;
}

export function quizScore(q: Extract<Question, { kind: 'guessScore' }>, answers: (number | null)[]) {
	return q.quiz.reduce((sum, item, i) => {
		const v = answers[i];
		if (v == null) return sum;
		return sum + (item.type === 'number' ? (v === item.answer ? 1 : 0) : v);
	}, 0);
}
