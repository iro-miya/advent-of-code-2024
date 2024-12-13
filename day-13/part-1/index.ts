import { runner } from "../../runner.ts";

const PARSE_REGEX = () => /Button A: X\+(?<A_X>\d+), Y\+(?<A_Y>\d+)\nButton B: X\+(?<B_X>\d+), Y\+(?<B_Y>\d+)\nPrize: X=(?<Prize_X>\d+), Y=(?<Prize_Y>\d+)(?:\n\n|\n?$)/gy;

interface ParseGroups {
	A_X: string;
	A_Y: string;
	B_X: string;
	B_Y: string;
	Prize_X: string;
	Prize_Y: string;
}

function isAlmostInteger(num: number): boolean {
	return Math.abs(num - Math.round(num)) < Number.EPSILON;
}

interface Point {
	x: number;
	y: number;
}

type Line = [Point, Point];

// https://en.wikipedia.org/wiki/Line%E2%80%93line_intersection#Given_two_points_on_each_line
function intersection(a: Line, b: Line) {
	// This is to make transcribing the formula easier
	const x1 = a[0].x;
	const x2 = a[1].x;
	const x3 = b[0].x;
	const x4 = b[1].x;

	const y1 = a[0].y;
	const y2 = a[1].y;
	const y3 = b[0].y;
	const y4 = b[1].y;

	// Top and bottom refer to the position in the Wikipedia formula
	const xTopLeft  = ((x1 * y2) - (y1 * x2)) * (x3 - x4);
	const xTopRight = (x1 - x2) * ((x3 * y4) - (y3 * x4));
	const yTopLeft  = ((x1 * y2) - (y1 * x2)) * (y3 - y4);
	const yTopRight = (y1 - y2) * ((x3 * y4) - (y3 * x4));
	const bottomLeft  = (x1 - x2) * (y3 - y4);
	const bottomRight = (y1 - y2) * (x3 - x4);

	return {
		x: (xTopLeft - xTopRight) / (bottomLeft - bottomRight),
		y: (yTopLeft - yTopRight) / (bottomLeft - bottomRight),
	}
}

function solve(input: string): number {
	let result = 0;

	for (const match of input.matchAll(PARSE_REGEX())) {
		const groups = match.groups as unknown as ParseGroups;

		const aX = Number.parseInt(groups.A_X, 10);
		const aY = Number.parseInt(groups.A_Y, 10);
		const bX = Number.parseInt(groups.B_X, 10);
		const bY = Number.parseInt(groups.B_Y, 10);
		const prizeX = Number.parseInt(groups.Prize_X, 10);
		const prizeY = Number.parseInt(groups.Prize_Y, 10);

		// See you could represent the button presses as two lines that have to intersect
		// So by finding the intersection we can know how many times you have to press the buttons
		const intersect = intersection(
			[
				{ x: 0, y: 0 },
				{ x: aX, y: aY },
			],
			[
				{ x: prizeX - bX, y: prizeY - bY },
				{ x: prizeX, y: prizeY },
			],
		);

		const aPresses = intersect.x / aX;
		const bPresses = (prizeX - intersect.x) / bX;

		if (aPresses > 0 && isAlmostInteger(aPresses) && bPresses > 0 && isAlmostInteger(bPresses)) {
			result += Math.round(aPresses) * 3 + Math.round(bPresses);
		}
	}

	return result;
}

await runner(solve);
