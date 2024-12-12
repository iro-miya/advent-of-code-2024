import { runner } from "../../runner.ts";

interface Point {
	x: number;
	y: number;
}

function * pointsInArea<T>(grid: T[][], origin: Point): Generator<Point> {
	const seen: Point[] = [];

	function * recurse(point: Point): Generator<Point> {
		if (seen.some(elem => Bun.deepEquals(elem, point))) {
			return;
		}

		seen.push(point);
		yield point;

		const up = {
			x: point.x,
			y: point.y - 1,
		};

		const down = {
			x: point.x,
			y: point.y + 1,
		};

		const left = {
			x: point.x - 1,
			y: point.y,
		};

		const right = {
			x: point.x + 1,
			y: point.y,
		};

		if (
			point.y > 0
			&& grid[point.y][point.x] === grid[up.y][up.x]
		) {
			yield* recurse(up);
		}

		if (
			point.y < grid.length - 1
			&& grid[point.y][point.x] === grid[down.y][down.x]
		) {
			yield* recurse(down);
		}

		if (
			point.x > 0
			&& grid[point.y][point.x] === grid[left.y][left.x]
		) {
			yield* recurse(left);
		}

		if (
			point.x < grid[0].length - 1
			&& grid[point.y][point.x] === grid[right.y][right.x]
		) {
			yield* recurse(right);
		}
	}

	yield* recurse(origin);
}

function solve(input: string): number {
	const level = input
		.trim()
		.split(/\r?\n/g)
		.map(line => [...line]);

	const height = level.length;
	const width = level[0]?.length ?? 0;

	const seen: Point[] = [];
	let result = 0;

	for (const [y, line] of level.entries()) {
		for (const [x, tile] of line.entries()) {
			const origin = { x, y };

			if (!seen.some(elem => Bun.deepEquals(elem, origin))) {
				let fences = 0;
				let area = 0;

				for (const point of pointsInArea(level, origin)) {
					seen.push(point);
					area += 1;

					if (point.x <= 0 || level[point.y][point.x - 1] !== tile) {
						fences += 1;
					}

					if (point.y <= 0 || level[point.y - 1][point.x] !== tile) {
						fences += 1;
					}

					if (point.x >= width - 1 || level[point.y][point.x + 1] !== tile) {
						fences += 1;
					}

					if (point.y >= height - 1 || level[point.y + 1][point.x] !== tile) {
						fences += 1;
					}
				}

				result += area * fences;
			}
		}
	}

	return result;
}

await runner(solve);
