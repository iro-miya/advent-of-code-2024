import { runner } from "../../runner.ts";

// Reduce function that runs a map function on every element,
// and produces an array of the elements for which the map function produced the lowest values.
// The call to .reduce must have an empty array as the second argument.
function reduceLowest<T>(getter: (elem: T) => number) {
	return (acc: T[], elem: T): T[] => {
		if (acc.length === 0) {
			return [elem];
		}

		const currVal = getter(acc[0]);
		const newVal = getter(elem);

		if (newVal < currVal) {
			return [elem];
		}

		if (newVal === currVal) {
			acc.push(elem);
		}

		return acc;
	}
}

function solve(input: string, file: string): number {
	const limit = file.startsWith("example") ? 12 : 1024;
	const size = file.startsWith("example") ? 6 : 70;

	function pointToRef(x: number, y: number) {
		return x + (y * (size + 1));
	}

	const walls: Set<number> = new Set(
		input
			.trim()
			.split(/\r?\n/g)
			.values()
			.take(limit)
			.map(line => line.split(",").map(Number.parseFloat))
			.map(([x, y]) => pointToRef(x, y))
	)

	interface Attempt {
		seen: Set<number>;
		steps: number;
		x: number;
		y: number;
		score: number;
	}

	const attempts = new Set<Attempt>().add({
		seen: new Set<number>().add(0),
		steps: 0,
		x: 0,
		y: 0,
		score: 0,
	});

	const highScores: Map<number, number> = new Map();

	while (attempts.size > 0) {
		const [best] = attempts.values().reduce(reduceLowest((attempt) => attempt.score), []);

		if (best.x === size && best.y === size) {
			break;
		}

		attempts.delete(best);

		const neighbours = [
			[best.x, best.y - 1],
			[best.x + 1, best.y],
			[best.x, best.y + 1],
			[best.x - 1, best.y],
		];

		for (const [x, y] of neighbours) {
			if (x < 0 || x > size || y < 0 || y > size) {
				continue;
			}

			const ref = pointToRef(x, y);

			if (walls.has(ref)) {
				continue;
			}

			if (!best.seen.has(ref)) {
				const newSteps = best.steps + 1;
				const highScore = highScores.get(ref) ?? Infinity;

				if (newSteps < highScore) {
					highScores.set(ref, newSteps);
					attempts.add({
						x,
						y,
						steps: newSteps,
						score: newSteps + Math.sqrt((size - x) ** 2 + (size - y) ** 2),
						seen: new Set(best.seen).add(ref),
					});
				}
			}
		}
	}

	return highScores.get(pointToRef(size, size))!;
}

await runner(solve);
