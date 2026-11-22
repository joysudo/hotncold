import {
	QUESTIONS_PER_ROUND,
	ROUND_COUNT,
	pickQuestions,
	promptText,
	questionBank,
	type Answer,
	type Question
} from '#lib/data/questions.ts';
import {
	TIER_COPY,
	TIER_POINTS,
	TIER_TEMP,
	closeness,
	formatAnswer,
	shuffle,
	tierOf,
	type Tier
} from './scoring.ts';
import { saveResult, type PairSummary } from './storage.ts';

export type Phase =
	| 'start'
	| 'past'
	| 'turnIntro'
	| 'question'
	| 'feedback'
	| 'roundResults'
	| 'end';
export type Mode = 'self' | 'guess';
export type Task = { qid: string; mode: Mode };

export const ZONES = ['sunset', 'dusk', 'midnight'] as const;
export const PANDA_STATES = ['relaxed', 'content', 'cool', 'chilly', 'frozen'] as const;
export type PandaState = (typeof PANDA_STATES)[number];

export type Pair = PairSummary & {
	qid: string;
	subject: number;
	guesser: number;
};

type Rec = { self?: Answer; guess?: Answer };

export class Game {
	names = $state<[string, string]>(['', '']);
	phase = $state<Phase>('start');
	round = $state(0);
	/** 0 = first player's turn, 1 = second player's turn (the one who gets rapid feedback) */
	turn = $state(0);
	taskIndex = $state(0);
	tasks = $state<Task[]>([]);
	/** red panda body temperature, 0 (frozen) – 100 (relaxed) */
	temp = $state(70);
	pairs = $state<Pair[]>([]);
	lastPair = $state<Pair | null>(null);
	/** whether the player who just answered (turn 2) was the guesser or the subject */
	lastWasGuesser = $state(true);
	/** this game's questions: QUESTIONS_PER_ROUND random picks from each round's pool */
	private picked: Question[][] = [];
	private answers: { [qid: string]: Rec } = {};

	// ---- derived -------------------------------------------------------------------------
	firstPlayer = $derived(this.round % 2);
	currentPlayer = $derived(this.turn === 0 ? this.firstPlayer : 1 - this.firstPlayer);
	currentName = $derived(this.name(this.currentPlayer));
	otherName = $derived(this.name(1 - this.currentPlayer));
	zone = $derived(ZONES[this.round]);
	currentTask = $derived<Task | undefined>(this.tasks[this.taskIndex]);
	currentQuestion = $derived<Question | undefined>(
		this.currentTask ? this.lookup(this.currentTask.qid) : undefined
	);
	score = $derived(this.pairs.reduce((s, p) => s + p.points, 0));
	maxScore = ROUND_COUNT * QUESTIONS_PER_ROUND * TIER_POINTS.exact;
	pandaState = $derived<PandaState>(
		this.temp >= 80
			? 'relaxed'
			: this.temp >= 60
				? 'content'
				: this.temp >= 40
					? 'cool'
					: this.temp >= 20
						? 'chilly'
						: 'frozen'
	);
	/** 0..1 progress through the night, drives the sky slide */
	progress = $derived(
		this.phase === 'start' || this.phase === 'past'
			? 0
			: this.phase === 'end'
				? 1
				: (this.round * 2 + this.turn + (this.phase === 'roundResults' ? 1 : 0)) / 6
	);
	roundPairs = $derived(this.pairs.filter((p) => p.round === this.round));
	feedbackHeading = $derived(
		this.lastPair
			? TIER_COPY[this.lastPair.tier][this.lastWasGuesser ? 0 : 1].replaceAll(
					'{other}',
					this.otherName
				)
			: ''
	);
	/** identifies the current stage; the sign drops/lifts whenever this changes */
	signKey = $derived(
		this.phase === 'turnIntro' || this.phase === 'question' || this.phase === 'feedback'
			? `turn-${this.round}-${this.turn}`
			: this.phase === 'roundResults'
				? `results-${this.round}`
				: this.phase === 'end'
					? 'end'
					: ''
	);
	/** small line above the name on a player's sign */
	signSub = $derived(
		this.phase === 'turnIntro' || this.phase === 'question' || this.phase === 'feedback'
			? `Round ${this.round + 1} · ${this.zone}`
			: ''
	);
	signText = $derived(
		this.phase === 'turnIntro' || this.phase === 'question' || this.phase === 'feedback'
			? this.currentName
			: this.phase === 'roundResults'
				? `Round ${this.round + 1} results`
				: this.phase === 'end'
					? 'the night is over'
					: ''
	);

	// ---- helpers -------------------------------------------------------------------------
	name(i: number) {
		return this.names[i].trim() || `Player ${i + 1}`;
	}

	private lookup(qid: string): Question | undefined {
		return this.picked[this.round]?.find((q) => q.id === qid);
	}

	/** Turn 1: alternates self / guess. Turn 2: the complementary tasks, in random order. */
	private buildTasks(): Task[] {
		const qs = this.picked[this.round];
		const first: Task[] = qs.map((q, i) => ({ qid: q.id, mode: i % 2 === 0 ? 'self' : 'guess' }));
		if (this.turn === 0) return first;
		return shuffle(first.map((t): Task => ({ ...t, mode: t.mode === 'self' ? 'guess' : 'self' })));
	}

	// ---- flow ----------------------------------------------------------------------------
	showPast() {
		this.phase = 'past';
	}
	showStart() {
		this.phase = 'start';
	}

	begin(names: [string, string]) {
		this.names = names;
		this.pairs = [];
		this.lastPair = null;
		this.answers = {};
		this.picked = questionBank.map((pool) => pickQuestions(pool, QUESTIONS_PER_ROUND));
		this.temp = 70;
		this.round = 0;
		this.turn = 0;
		this.taskIndex = 0;
		this.tasks = this.buildTasks();
		this.phase = 'turnIntro';
	}

	/** "press to start." */
	startTurn() {
		this.phase = 'question';
	}

	submit(answer: Answer) {
		const task = this.currentTask;
		const q = this.currentQuestion;
		if (!task || !q) return;
		const rec = (this.answers[task.qid] ??= {});
		rec[task.mode] = answer;

		// The second player's answer completes the pair -> instant feedback.
		if (this.turn === 1) {
			const subject = task.mode === 'guess' ? 1 - this.currentPlayer : this.currentPlayer;
			const guesser = 1 - subject;
			const c = closeness(q, rec.self ?? null, rec.guess ?? null);
			const tier: Tier = tierOf(c);
			const pair: Pair = {
				qid: q.id,
				round: this.round,
				subject,
				guesser,
				text: promptText(q, 'guess', this.name(subject)),
				actual: formatAnswer(q, rec.self ?? null),
				anticipated: formatAnswer(q, rec.guess ?? null),
				closeness: c,
				tier,
				points: TIER_POINTS[tier]
			};
			this.pairs.push(pair);
			this.lastPair = pair;
			this.lastWasGuesser = task.mode === 'guess';
			this.temp = Math.max(0, Math.min(100, this.temp + TIER_TEMP[tier]));
			this.phase = 'feedback';
		} else {
			this.next();
		}
	}

	/** move on after an answer (turn 1) or after the feedback card (turn 2) */
	next() {
		if (this.taskIndex + 1 < this.tasks.length) {
			this.taskIndex++;
			this.phase = 'question';
		} else if (this.turn === 0) {
			this.turn = 1;
			this.taskIndex = 0;
			this.tasks = this.buildTasks();
			this.phase = 'turnIntro';
		} else {
			this.phase = 'roundResults';
		}
	}

	afterRoundResults() {
		if (this.round < ZONES.length - 1) {
			this.round++;
			this.turn = 0;
			this.taskIndex = 0;
			this.tasks = this.buildTasks();
			this.phase = 'turnIntro';
		} else {
			saveResult({
				id: crypto.randomUUID(),
				date: new Date().toISOString(),
				names: [this.name(0), this.name(1)],
				score: this.score,
				maxScore: this.maxScore,
				pairs: this.pairs.map(({ qid, subject, guesser, ...summary }) => summary)
			});
			this.phase = 'end';
		}
	}

	reset() {
		this.phase = 'start';
		this.round = 0;
		this.turn = 0;
		this.temp = 70;
		this.pairs = [];
	}
}
