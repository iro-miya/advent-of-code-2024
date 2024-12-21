import { runner } from "../../runner.ts";

interface Point {
	x: number;
	y: number;
}

// I decided to make those the coordinates 1-indexed to make the constants easier to define
// Really the indexing doesn't matter, only the relative distance between the buttons does

const NUM_PAD: Map<string, Point> = new Map([
	["9", { x: 3, y: 1, }],
	["8", { x: 2, y: 1, }],
	["7", { x: 1, y: 1, }],
	["6", { x: 3, y: 2, }],
	["5", { x: 2, y: 2, }],
	["4", { x: 1, y: 2, }],
	["3", { x: 3, y: 3, }],
	["2", { x: 2, y: 3, }],
	["1", { x: 1, y: 3, }],
	// Empty
	["0", { x: 2, y: 4, }],
	["A", { x: 3, y: 4, }],
]);

const ARROW_PAD: Map<string, Point> = new Map([
	// Empty
	["^", { x: 2, y: 1, }],
	["A", { x: 3, y: 1, }],
	["<", { x: 1, y: 2, }],
	["v", { x: 2, y: 2, }],
	[">", { x: 3, y: 2, }],
]);

function * encode(str: Iterable<string>, grid: Map<string, Point>): Generator<string> {
	let pos = grid.get("A");

	if (!pos) {
		throw new Error("Grid must have a position for 'A'");
	}

	for (const char of str) {
		const target = grid.get(char);

		if (!target) {
			throw new Error("Couldn't find position for: " + target);
		}

		const horizontalDistance = Math.abs(pos.x - target.x);
		const verticalDistance = Math.abs(pos.y - target.y);
		const horizontalDirection = pos.x < target.x ? ">" : "<";
		const verticalDirection = pos.y < target.y ? "v" : "^";

		// false: always join the points with an L or an L mirrored on the vertical axis
		// true: join them by an L mirrored vertically instead
		// for some reason, forward Ls always results in the fastest output, but it isn's always legal on the numpad
		let reverseL = false;

		// For some reason, always drawing forward Ls gives you the best output
		// I decided to just hardcode the locations where drawing the L forward will cause an illegal move
		if (
			(grid === NUM_PAD && (pos.x === 1 && target.y === 4) || (pos.y === 4 && target.x === 1))
			|| (grid === ARROW_PAD && (target.x === 1 || pos.x === 1))
		) {
			reverseL = true;
		}

		if ((!reverseL && pos.x > target.x) || (reverseL && pos.x < target.x)) {
			for (let i = 0; i < horizontalDistance; i++) yield horizontalDirection;
			for (let i = 0; i < verticalDistance; i++) yield verticalDirection;
		} else {
			for (let i = 0; i < verticalDistance; i++) yield verticalDirection;
			for (let i = 0; i < horizontalDistance; i++) yield horizontalDirection;
		}

		yield "A";
		pos = target;
	}
}

// This is just for testing
function * decode (input: Iterable<string>, grid: Map<string, Point>): Generator<string> {
	const pos = grid.get("A");

	if (!pos) {
		throw new Error("Grid must have a position for 'A'");
	}

	let { x, y } = pos;

	for (const button of input) {
		switch (button) {
			case "<":
				x--;
				break;

			case ">":
				x++;
				break;

			case "^":
				y--;
				break;

			case "v":
				y++;
				break;
		}

		const match = grid.entries().find(([, pos]) => pos.x === x && pos.y === y);

		if (!match) {
			throw new Error("No button at this position");
		}

		if (button === "A") {
			yield match[0];
		}
	}
}
function solve(input: string): number {
	let result = 0;

	for (const line of input.trim().split(/\r?\n/g)) {
		const num = Number.parseInt(line.slice(0, 3), 10);

		result += encode(
			encode(
				encode(
					line,
					NUM_PAD,
				),
				ARROW_PAD,
			),
			ARROW_PAD,
		).reduce((acc) => acc + 1, 0) * num;
	}

	return result;
}

await runner(solve);
