import { runner } from "../../runner.ts";

type Board = string[][];

const MATCH = ["X", "M", "A", "S"];

type Direction = "up" | "down" | "left" | "right";

/**
 * Gets the letters on the board starting
 * from an origin and going a particular direction.
 *
 * /!\ This function does not check that the coordinates are in bound.
 */
function * getWord(board: Board, x: number, y: number, direction: Direction[]): Generator<string> {
	let incrementY = 
		direction.includes("up") ? -1 
		: direction.includes("down") ? 1
		: 0;

	let incrementX =
		direction.includes("left") ? -1
		: direction.includes("right") ? 1
		: 0;

	for (let i = 0; i < MATCH.length; i++) {
		yield board[y + i * incrementY][x + i * incrementX];
	}
}

/**
 * Checks if a string iterator matches the MATCH constant.
 * Returns lazily
 */ 
function isMatch(iterator: Iterable<string>) {
	let index = 0;

	for (const char of iterator) {
		if (char !== MATCH[index]) {
			return false;
		}

		index++;
	}

	return true;
}

/*
 * Checks if there is a match on the board starting from the origin.
 * In the case of matches going left, the origin is from the right.
 * So the origin is always the first letter of the match
 */
function countMatches(board: Board, x: number, y: number) {
	let matches = 0;

	const width = board[0]?.length ?? 0;
	const height = board.length;

	// Directions with enough space to possibly have a match
	const left  = x + 1      >= MATCH.length;
	const right = width - x  >= MATCH.length;
	const up    = y + 1      >= MATCH.length;
	const down  = height - y >= MATCH.length;

	if (left) {
		if (isMatch(getWord(board, x, y, ["left"]))) {
			matches++;
		}

		if (up && isMatch(getWord(board, x, y, ["left", "up"]))) {
			matches++;
		}


		if (down && isMatch(getWord(board, x, y, ["left", "down"]))) {
			matches++;
		}
	}

	if (right) {
		if (isMatch(getWord(board, x, y, ["right"]))) {
			matches++;
		}

		if (up && isMatch(getWord(board, x, y, ["right", "up"]))) {
			matches++;
		}


		if (down && isMatch(getWord(board, x, y, ["right", "down"]))) {
			matches++;
		}
	}

	if (up && isMatch(getWord(board, x, y, ["up"]))) {
		matches++;
	}


	if (down && isMatch(getWord(board, x, y, ["down"]))) {
		matches++;
	}

	return matches;
}

function solve(input: string) {
	const board: Board = input.trim().split(/\r?\n/g).map(line => [...line]);

	let result = 0;

	for (const y of board.keys()) {
		for (const x of board.keys()) {
			result += countMatches(board, x, y);
		}
	}

	return result;
}

await runner(solve);
