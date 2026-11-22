import type { Tier } from './scoring.ts';

const KEY = 'hotncold:results';

export type PairSummary = {
	round: number;
	text: string;
	actual: string;
	anticipated: string;
	closeness: number;
	tier: Tier;
	points: number;
};

export type SavedResult = {
	id: string;
	date: string;
	names: [string, string];
	score: number;
	maxScore: number;
	pairs: PairSummary[];
};

export function loadResults(): SavedResult[] {
	try {
		const raw = localStorage.getItem(KEY);
		return raw ? (JSON.parse(raw) as SavedResult[]) : [];
	} catch {
		return [];
	}
}

export function saveResult(result: SavedResult) {
	try {
		localStorage.setItem(KEY, JSON.stringify([result, ...loadResults()].slice(0, 50)));
	} catch {
		/* storage unavailable (private mode etc.) — results just aren't persisted */
	}
}

export function clearResults() {
	try {
		localStorage.removeItem(KEY);
	} catch {
		/* ignore */
	}
}
