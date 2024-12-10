import { runner } from "../../runner.ts";

interface Point { x: number, y: number, }
function * walk(start: Point, level: number[][]): Generator<Point> {
	const height = level.length;
	const width = level[0]?.length ?? 0;

	const startVal = level[start.y][start.x];

	const possiblePoints: Point[] = [
		{ x: start.x - 1, y: start.y },
		{ x: start.x, y: start.y - 1 },
		{ x: start.x + 1, y: start.y },
		{ x: start.x, y: start.y + 1 },
	];

	for (const point of possiblePoints) {
		if (
			point.x >= 0
			&& point.x < width
			&& point.y >= 0
			&& point.y < height
			&& level[point.y][point.x] - startVal === 1
		) {
			if (level[point.y][point.x] === 9) {
				yield point;
			} else {
				yield* walk(point, level);
			}
		}
	}
}

function filterUnique() {
	const seen: any[] = []

	return function (val: any) {
		if (seen.some(seenVal => Bun.deepEquals(val, seenVal))) {
			return false;
		}

		seen.push(val);
		return true;
	}
}

function solve(input: string): number {
	const level: number[][] = input
		.trim()
		.split(/\r?\n/g)
		.map(line => 
			[...line].map(Number.parseFloat)
		);
	
	let result = 0;

	for (const [y, line] of level.entries()) {
		for (const [x, value] of line.entries()) {
			if (value === 0) {
				result += walk({ x, y }, level)
					.filter(filterUnique())
					.toArray()
					.length;
			}
		}
	}

	return result;
}

await runner(solve);
