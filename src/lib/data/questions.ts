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
	| {
			type: 'likert';
			steps: number;
			/** first value on the scale (default 1), e.g. 0 for a 0–4 scale */
			min?: number;
			left: string;
			right: string;
	  }
);
/**
 * Guess the score: the subject completes a mini quiz; the partner estimates the resulting
 * score. Number items score 1 when correct; likert items score the value picked (min..min+steps-1).
 */
export type GuessScoreQ = Base & {
	kind: 'guessScore';
	min: number;
	max: number;
	unit: string;
	quiz: QuizItem[];
};
/**
 * Guess the single answer. `metric` decides closeness: 'circular' = distance around the option
 * list, 'letters' = matching letters, 'exact' = right or wrong.
 */
export type SingleQ = Base & {
	kind: 'single';
	metric: 'circular' | 'letters' | 'exact';
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
		label: 'Peach rings',
		image:
			'https://images.contentstack.io/v3/assets/bltbb619fd5c667ba2d/blt771535f1a27cbf00/60ad78de77e996669f49f5d5/7-Select_Gummi_Peach_Rings_1800X1800_transparent.png'
	},
	{
		id: 'snack-2',
		label: 'Snack 2',
		image:
			'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRY3t609X-7ymMxPDWx_mqrf55zsTj38cVMsu1Y0gF_SA&s=10'
	},
	{
		id: 'snack-3',
		label: 'Snack 3',
		image: 'https://www.kroger.com/product/images/xlarge/front/0001708287631'
	},
	{
		id: 'banana',
		label: 'Banana',
		image:
			'https://upload.wikimedia.org/wikipedia/commons/6/69/Banana.png?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original'
	},
	{
		id: 'snack-5',
		label: 'Snack 5',
		image: 'https://www.cvs.com/bizcontent/merchandising/productimages/high_res/4141942007.jpg'
	},
	{
		id: 'snack-6',
		label: 'Snack 6',
		image:
			'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTjsDzzIm3GS8HJgsdOjtKa6Dqz5M4m8OLZIgpezQM8cQ&s=10'
	},
	{
		id: 'snack-7',
		label: 'Snack 7',
		image:
			'https://poppin-candy.com/cdn/shop/files/PHOTOROOM1080X1080TRANSPARENT-PhotoRoom-2024-01-25T105201.199.png?v=1706179926&width=1200'
	}
];

const STAR_SIGNS: Option[] = [
	['aries', '♈ Aries'],
	['taurus', '♉ Taurus'],
	['gemini', '♊ Gemini'],
	['cancer', '♋ Cancer'],
	['leo', '♌ Leo'],
	['virgo', '♍ Virgo'],
	['libra', '♎ Libra'],
	['scorpio', '♏ Scorpio'],
	['sagittarius', '♐ Sagittarius'],
	['capricorn', '♑ Capricorn'],
	['aquarius', '♒ Aquarius'],
	['pisces', '♓ Pisces']
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
		id: 'r1-eggs',
		kind: 'likert',
		time: 20,
		steps: 7,
		left: 'Overcooked',
		right: 'Borderline raw',
		self: 'How do you like your eggs?',
		other: 'How does {partner} like their eggs?'
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
		left: 'Mild',
		right: 'Extra spicy',
		self: 'How much spice can you handle?',
		other: 'How much spice can {partner} handle?'
	},
	{
		id: 'r1-olives',
		kind: 'likert',
		time: 20,
		steps: 5,
		left: 'Gross',
		right: 'Love them',
		self: 'How do you feel about olives?',
		other: 'How do you think {partner} feels about olives?'
	},
	{
		id: 'r1-smiski',
		kind: 'likert',
		time: 20,
		steps: 5,
		left: 'No chance',
		right: 'Already shopping',
		self: 'How likely are you to ever spend your own money on a Smiski?',
		other: 'How likely is {partner} to ever spend their own money on a Smiski?'
	},
	{
		id: 'r1-hackathons',
		kind: 'number',
		time: 20,
		min: 0,
		max: 10,
		self: 'How many hackathons have you been to?',
		other: 'How many hackathons has {partner} been to?'
	},
	{
		id: 'r1-holiday',
		kind: 'single',
		metric: 'exact',
		time: 25,
		options: [
			{ id: 'new-year', label: 'New Year’s' },
			{ id: 'lunar-new-year', label: 'Lunar New Year' },
			{ id: 'valentines', label: 'Valentine’s Day' },
			{ id: 'fourth-of-july', label: 'Fourth of July' },
			{ id: 'halloween', label: 'Halloween' },
			{ id: 'thanksgiving', label: 'Thanksgiving' },
			{ id: 'christmas', label: 'Christmas' }
		],
		self: 'Select your favorite holiday.',
		other: 'Select {partner}’s favorite holiday.'
	},
	{
		id: 'r1-clean',
		kind: 'likert',
		time: 20,
		steps: 10,
		left: 'Total slob',
		right: 'Clean freak',
		self: 'On a scale of 1 to 10, how much would you describe yourself as a clean freak?',
		other: 'On a scale of 1 to 10, how much would {partner} describe themselves as a clean freak?'
	},
	{
		id: 'r1-heidi-orpheus',
		kind: 'single',
		metric: 'exact',
		time: 15,
		options: [
			{ id: 'heidi', label: 'Heidi' },
			{ id: 'orpheus', label: 'Orpheus' }
		],
		self: 'Heidi or Orpheus?',
		other: 'Heidi or Orpheus? Which would {partner} pick?'
	},
	{
		id: 'r1-age',
		kind: 'number',
		time: 20,
		min: 18,
		max: 40,
		self: 'How old are you?',
		other: 'How old is {partner}?'
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
		left: 'Early bird',
		right: 'Night owl',
		self: 'Are you an early bird or a night owl?',
		other: 'Is {partner} an early bird or a night owl?'
	},
	{
		id: 'r2-pizza',
		kind: 'select',
		time: 30,
		pick: 2,
		options: [
			{ id: 'pepperoni', label: 'Pepperoni' },
			{ id: 'mushroom', label: 'Mushroom' },
			{ id: 'pineapple', label: 'Pineapple' },
			{ id: 'olives', label: 'Olives' },
			{ id: 'jalapeno', label: 'Jalapeños' }
		],
		self: 'Pick the 2 pizza toppings you’d never skip.',
		other: 'Which 2 pizza toppings would {partner} never skip?'
	},
	{
		id: 'r2-morning',
		kind: 'rank',
		time: 35,
		items: [
			{ id: 'coffee', label: 'Coffee' },
			{ id: 'snooze', label: 'Five more minutes' },
			{ id: 'shower', label: 'A hot shower' },
			{ id: 'breakfast', label: 'Breakfast' }
		],
		self: 'Rank these morning essentials from most to least important to you.',
		other: 'Guess how {partner} would rank these morning essentials, most important first.'
	},
	{
		id: 'r2-siblings',
		kind: 'number',
		time: 20,
		min: 0,
		max: 10,
		self: 'How many siblings do you have?',
		other: 'How many siblings does {partner} have?'
	},
	{
		id: 'r2-icecream',
		kind: 'rank',
		time: 30,
		items: [
			{ id: 'vanilla', label: 'Vanilla' },
			{ id: 'mint', label: 'Mint chocolate chip' },
			{ id: 'mango', label: 'Mango sorbet' }
		],
		self: 'Rank these three ice cream flavors from your favorite to your least favorite.',
		other: 'Rank these three ice cream flavors the way you think {partner} would, favorite first.'
	},
	{
		id: 'r2-island',
		kind: 'select',
		time: 35,
		pick: 3,
		options: [
			{ id: 'radio', label: 'Solar radio' },
			{ id: 'books', label: 'Stack of books' },
			{ id: 'knife', label: 'Good knife' },
			{ id: 'snacks', label: 'Snack drawer' },
			{ id: 'vinyl', label: 'Vinyl player' },
			{ id: 'snowglobe', label: 'Magical snowglobe' },
			{ id: 'coffee', label: 'Coffee maker' }
		],
		self: 'Pick 3 of these to bring to a deserted island.',
		other: 'Pick the 3 of these you think {partner} would bring to a deserted island.'
	},
	{
		id: 'r2-staff',
		kind: 'single',
		metric: 'exact',
		time: 30,
		options: [
			'Aariana', 'Jenny', 'Lola', 'Cinders', 'Darlene', 'Alex', 'Cisco',
			'Julia', 'Meghana', 'Mihi', 'Nika', 'Selena', 'Tongyu', 'Joy'
		].map((n) => ({ id: n.toLowerCase(), label: n })),
		self: 'Select your favorite Snowglobe staff member.',
		other: 'Select {partner}’s favorite Snowglobe staff member.'
	},
	{
		id: 'r2-city',
		kind: 'single',
		metric: 'exact',
		time: 25,
		options: [
			{ id: 'sf', label: 'San Francisco' },
			{ id: 'nyc', label: 'New York' },
			{ id: 'la', label: 'Los Angeles' },
			{ id: 'chicago', label: 'Chicago' }
		],
		self: 'Which city would you choose to live in forever?',
		other: 'Which city would {partner} choose to live in forever?'
	},
	{
		id: 'r2-catsdogs',
		kind: 'likert',
		time: 20,
		steps: 5,
		left: 'Cats',
		right: 'Dogs',
		self: 'Do you prefer cats or dogs?',
		other: 'Does {partner} prefer cats or dogs?'
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
		id: 'r3-weekend',
		kind: 'rank',
		time: 35,
		items: [
			{ id: 'hike', label: 'A long hike' },
			{ id: 'movies', label: 'A movie marathon' },
			{ id: 'brunch', label: 'A big brunch out' },
			{ id: 'nap', label: 'A really good nap' }
		],
		self: 'Rank these weekend plans from most to least appealing to you.',
		other: 'Guess how {partner} would rank these weekend plans, most appealing first.'
	},
	{
		id: 'r3-plans',
		kind: 'likert',
		time: 20,
		steps: 7,
		left: 'Wing it',
		right: 'Color-coded spreadsheet',
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
	},
	{
		id: 'r3-mult',
		kind: 'guessScore',
		time: 35,
		min: 0,
		max: 3,
		unit: 'correct',
		quiz: [
			{ q: '4 × 7', type: 'number', answer: 28 },
			{ q: '9 × 12', type: 'number', answer: 108 },
			{ q: '6 × 8', type: 'number', answer: 48 }
		],
		self: 'Answer the following three multiplication questions as fast as possible.',
		other:
			'{partner} was presented with three 3rd-grade multiplication questions. How many of these do you think they got right?'
	},
	{
		id: 'r3-ocd',
		kind: 'guessScore',
		time: 45,
		min: 0,
		max: 16,
		unit: 'points',
		quiz: [
			'I find it difficult to touch an object when I know it has been touched by strangers or certain people.',
			'I collect things I don’t need.',
			'I repeatedly check gas and water taps and light switches.',
			'I get upset if objects are not arranged properly.'
		].map((q) => ({
			q,
			type: 'likert' as const,
			steps: 5,
			min: 0,
			left: 'Not at all',
			right: 'Extremely'
		})),
		self: 'Select how well each experience describes you. 0 = Not at all, 1 = A little, 2 = Moderately, 3 = A lot, 4 = Extremely.',
		other:
			'{partner} was presented with four OCD assessment questions. How many points do you think they scored, out of 16?'
	},
	{
		id: 'r3-crystal-ball',
		kind: 'single',
		metric: 'exact',
		time: 20,
		options: [
			{ id: 'yes', label: 'Yes, I’d look' },
			{ id: 'no', label: 'No, never' }
		],
		self: 'If a crystal ball could tell you how you’d die, would you look in it?',
		other: 'If a crystal ball could tell {partner} how they’d die, would they look in it?'
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
