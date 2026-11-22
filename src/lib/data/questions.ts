/**
 * Question bank for the three rounds (sunset, dusk, midnight).
 *
 * Each round has a *pool* of questions of any size — add as many as you like. Every game picks
 * QUESTIONS_PER_ROUND of them at random per round (see `pickQuestions`). Each question `id`
 * must be unique across the whole bank.
 *
 * Every question is a *template* with two phrasings:
 *   - `self`  : asked of the person the question is about ("How many siblings do you have?")
 *   - `other` : asked of their partner ("How many siblings does {partner} have?")
 * `{partner}` is replaced with the name of the person being guessed about.
 *
 * `time` is the per-question time limit in seconds.
 */

export type Option = { id: string; label: string; image?: string };

type Base = {
	id: string;
	/** seconds allowed to answer */
	time: number;
	self: string;
	other: string;
};

/** Select X out of N */
export type SelectQ = Base & { kind: 'select'; pick: number; options: Option[] };
/** Free response, numeric only. min/max define the scale used for proximity scoring. */
export type NumberQ = Base & { kind: 'number'; min: number; max: number };
/** Likert scale with configurable endpoint labels */
export type LikertQ = Base & { kind: 'likert'; steps: number; left: string; right: string };
/** Rank items in priority order (first = top priority) */
export type RankQ = Base & { kind: 'rank'; items: Option[] };

export type QuizItem = { q: string } & (
	| { type: 'number'; answer: number }
	| { type: 'likert'; steps: number; left: string; right: string }
);
/**
 * Guess the score: the subject completes a mini quiz; the partner estimates the resulting
 * score. Number items score 1 when correct; likert items score the value picked (1..steps).
 */
export type GuessScoreQ = Base & {
	kind: 'guessScore';
	min: number;
	max: number;
	unit: string;
	quiz: QuizItem[];
};
/** Guess the single answer, judged by proximity (circular order) or matching letters. */
export type SingleQ = Base & {
	kind: 'single';
	metric: 'circular' | 'letters';
	options: Option[];
};

export type Question = SelectQ | NumberQ | LikertQ | RankQ | GuessScoreQ | SingleQ;

/** A recorded answer. select/rank -> option ids, number/likert/guessScore -> number, single -> option id */
export type Answer = string | number | string[] | null;

/** Resolve the prompt text for a question. `mode` self = about you, guess = about partner. */
export function promptText(q: Question, mode: 'self' | 'guess', partnerName: string): string {
	return (mode === 'self' ? q.self : q.other).replaceAll('{partner}', partnerName);
}

// ---------------------------------------------------------------------------------------
// Placeholder images (swap for real assets later)
// ---------------------------------------------------------------------------------------
const SNACKS: Option[] = [
	{
		id: 'peach-rings',
		label: 'peach rings',
		image:
			'https://images.contentstack.io/v3/assets/bltbb619fd5c667ba2d/blt771535f1a27cbf00/60ad78de77e996669f49f5d5/7-Select_Gummi_Peach_Rings_1800X1800_transparent.png'
	},
	{
		id: 'snack-2',
		label: 'snack 2',
		image:
			'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRY3t609X-7ymMxPDWx_mqrf55zsTj38cVMsu1Y0gF_SA&s=10'
	},
	{
		id: 'snack-3',
		label: 'snack 3',
		image: 'https://www.kroger.com/product/images/xlarge/front/0001708287631'
	},
	{
		id: 'banana',
		label: 'banana',
		image:
			'https://upload.wikimedia.org/wikipedia/commons/6/69/Banana.png?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original'
	},
	{
		id: 'snack-5',
		label: 'snack 5',
		image: 'https://www.cvs.com/bizcontent/merchandising/productimages/high_res/4141942007.jpg'
	},
	{
		id: 'snack-6',
		label: 'snack 6',
		image:
			'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTjsDzzIm3GS8HJgsdOjtKa6Dqz5M4m8OLZIgpezQM8cQ&s=10'
	},
	{
		id: 'snack-7',
		label: 'snack 7',
		image:
			'https://poppin-candy.com/cdn/shop/files/PHOTOROOM1080X1080TRANSPARENT-PhotoRoom-2024-01-25T105201.199.png?v=1706179926&width=1200'
	}
];

const STAR_SIGNS: Option[] = [
	['aries', '♈ aries'],
	['taurus', '♉ taurus'],
	['gemini', '♊ gemini'],
	['cancer', '♋ cancer'],
	['leo', '♌ leo'],
	['virgo', '♍ virgo'],
	['libra', '♎ libra'],
	['scorpio', '♏ scorpio'],
	['sagittarius', '♐ sagittarius'],
	['capricorn', '♑ capricorn'],
	['aquarius', '♒ aquarius'],
	['pisces', '♓ pisces']
].map(([id, label]) => ({ id, label }));

const MBTI: Option[] = [
	'INTJ', 'INTP', 'ENTJ', 'ENTP',
	'INFJ', 'INFP', 'ENFJ', 'ENFP',
	'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
	'ISTP', 'ISFP', 'ESTP', 'ESFP'
].map((t) => ({ id: t, label: t }));

// ---------------------------------------------------------------------------------------
// Round 1 — sunset
// ---------------------------------------------------------------------------------------
const sunset: Question[] = [
	{
		id: 'r1-snacks',
		kind: 'select',
		time: 30,
		pick: 2,
		options: SNACKS,
		self: 'Quick! You’ve got 10 minutes at a gas station. Which 2 snacks are you picking?',
		other: 'Quick! You’ve got 10 minutes at a gas station. Which 2 snacks is {partner} picking?'
	},
	{
		id: 'r1-siblings',
		kind: 'number',
		time: 20,
		min: 0,
		max: 10,
		self: 'How many siblings do you have?',
		other: 'How many siblings does {partner} have?'
	},
	{
		id: 'r1-eggs',
		kind: 'likert',
		time: 20,
		steps: 7,
		left: 'overcooked',
		right: 'borderline raw',
		self: 'How do you like your eggs?',
		other: 'How does {partner} like their eggs?'
	},
	{
		id: 'r1-icecream',
		kind: 'rank',
		time: 40,
		items: [
			{ id: 'vanilla', label: 'vanilla' },
			{ id: 'chocolate', label: 'chocolate' },
			{ id: 'mint', label: 'mint chocolate chip' },
			{ id: 'pecan', label: 'butter pecan' },
			{ id: 'mango', label: 'mango sorbet' }
		],
		self: 'Rank these ice cream flavors from your favorite to your least favorite.',
		other: 'Guess how {partner} would rank these ice cream flavors, favorite first.'
	},
	{
		id: 'r1-countries',
		kind: 'number',
		time: 20,
		min: 0,
		max: 20,
		self: 'How many countries have you visited?',
		other: 'How many countries has {partner} visited?'
	},
	{
		id: 'r1-spice',
		kind: 'likert',
		time: 20,
		steps: 5,
		left: 'mild',
		right: 'extra spicy',
		self: 'How much spice can you handle?',
		other: 'How much spice can {partner} handle?'
	}
];

// ---------------------------------------------------------------------------------------
// Round 2 — dusk
// ---------------------------------------------------------------------------------------
const dusk: Question[] = [
	{
		id: 'r2-star',
		kind: 'single',
		metric: 'circular',
		time: 25,
		options: STAR_SIGNS,
		self: 'What’s your star sign?',
		other: 'What’s {partner}’s star sign? (closer on the calendar counts!)'
	},
	{
		id: 'r2-mult',
		kind: 'guessScore',
		time: 35,
		min: 0,
		max: 3,
		unit: 'correct',
		quiz: [
			{ q: '7 × 8', type: 'number', answer: 56 },
			{ q: '6 × 9', type: 'number', answer: 54 },
			{ q: '12 × 4', type: 'number', answer: 48 }
		],
		self: 'Answer these three multiplication questions as fast as you can.',
		other:
			'{partner} was just asked three multiplication questions. How many do you think they got correct?'
	},
	{
		id: 'r2-sleep',
		kind: 'number',
		time: 20,
		min: 0,
		max: 12,
		self: 'How many hours do you sleep on a typical night?',
		other: 'How many hours does {partner} sleep on a typical night?'
	},
	{
		id: 'r2-owl',
		kind: 'likert',
		time: 20,
		steps: 5,
		left: 'early bird',
		right: 'night owl',
		self: 'Are you an early bird or a night owl?',
		other: 'Is {partner} an early bird or a night owl?'
	},
	{
		id: 'r2-pizza',
		kind: 'select',
		time: 30,
		pick: 2,
		options: [
			{ id: 'pepperoni', label: 'pepperoni' },
			{ id: 'mushroom', label: 'mushroom' },
			{ id: 'pineapple', label: 'pineapple' },
			{ id: 'olives', label: 'olives' },
			{ id: 'jalapeno', label: 'jalapeños' }
		],
		self: 'Pick the 2 pizza toppings you’d never skip.',
		other: 'Which 2 pizza toppings would {partner} never skip?'
	},
	{
		id: 'r2-morning',
		kind: 'rank',
		time: 35,
		items: [
			{ id: 'coffee', label: 'coffee' },
			{ id: 'snooze', label: 'five more minutes' },
			{ id: 'shower', label: 'a hot shower' },
			{ id: 'breakfast', label: 'breakfast' }
		],
		self: 'Rank these morning essentials from most to least important to you.',
		other: 'Guess how {partner} would rank these morning essentials, most important first.'
	}
];

// ---------------------------------------------------------------------------------------
// Round 3 — midnight
// ---------------------------------------------------------------------------------------
const midnight: Question[] = [
	{
		id: 'r3-mbti',
		kind: 'single',
		metric: 'letters',
		time: 30,
		options: MBTI,
		self: 'What’s your MBTI type?',
		other: 'What’s {partner}’s MBTI type? (matching letters count!)'
	},
	{
		id: 'r3-island',
		kind: 'select',
		time: 30,
		pick: 3,
		options: [
			{ id: 'knife', label: 'a good knife' },
			{ id: 'books', label: 'a stack of books' },
			{ id: 'guitar', label: 'a guitar' },
			{ id: 'hammock', label: 'a hammock' },
			{ id: 'cooler', label: 'a cooler of snacks' },
			{ id: 'radio', label: 'a solar radio' }
		],
		self: 'You’re stranded on a desert island. Which 3 items do you bring?',
		other: '{partner} is stranded on a desert island. Which 3 items do they bring?'
	},
	{
		id: 'r3-weekend',
		kind: 'rank',
		time: 35,
		items: [
			{ id: 'hike', label: 'a long hike' },
			{ id: 'movies', label: 'a movie marathon' },
			{ id: 'brunch', label: 'a big brunch out' },
			{ id: 'nap', label: 'a really good nap' }
		],
		self: 'Rank these weekend plans from most to least appealing to you.',
		other: 'Guess how {partner} would rank these weekend plans, most appealing first.'
	},
	{
		id: 'r3-plans',
		kind: 'likert',
		time: 20,
		steps: 7,
		left: 'wing it',
		right: 'color-coded spreadsheet',
		self: 'How do you approach a trip?',
		other: 'How does {partner} approach a trip?'
	},
	{
		id: 'r3-apps',
		kind: 'number',
		time: 20,
		min: 0,
		max: 100,
		self: 'How many apps are on your phone’s home screens, roughly?',
		other: 'How many apps are on {partner}’s home screens, roughly?'
	}
];

/** One pool of questions per round: [sunset, dusk, midnight]. Pools can be any length. */
export const questionBank: Question[][] = [sunset, dusk, midnight];

export const ROUND_COUNT = questionBank.length;
/**
 * Questions asked per round. Keep it even: each player answers half about themself and half
 * about their partner, alternating.
 */
export const QUESTIONS_PER_ROUND = 4;

/** Random sample of `count` distinct questions from a pool (all of them if the pool is smaller). */
export function pickQuestions(pool: Question[], count: number): Question[] {
	const a = [...pool];
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a.slice(0, count);
}
