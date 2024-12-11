import { runner } from "../../runner.ts";

type Board = string[][];

const MATCH: string[] = ["M", "A", "S"];

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
 * The origin is at center of the cross (the letter A).
 */
function isMatchOnBoard(board: Board, x: number, y: number) {
	const width = board[0]?.length ?? 0;
	const height = board.length;

	// Directions with enough space to possibly have a match
	const left  = x - 1 >= 0;
	const right = x + 1 < width;
	const up    = y - 1 >= 0;
	const down  = y + 1 < height;

	return (left && right && up && down) &&
		(
			isMatch(getWord(board, x - 1, y - 1, ["right", "down"]))
			|| isMatch(getWord(board, x + 1, y + 1, ["left", "up"]))
		) &&
		(
			isMatch(getWord(board, x + 1, y - 1, ["left", "down"]))
			|| isMatch(getWord(board, x - 1, y + 1, ["right", "up"]))
		)
}

function solve(input: string) {
	const board: Board = input.trim().split(/\r?\n/g).map(line => [...line]);

	let result = 0;

	for (const y of board.keys()) {
		for (const x of board.keys()) {
			if (isMatchOnBoard(board, x, y)) {
				result++;
			}
		}
	}

	return result;
}

await runner(solve);
