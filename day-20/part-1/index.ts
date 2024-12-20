import { runner } from "../../runner";

enum Tile {
	Empty,
	Wall,
}

// Iterates an array from top to bottom and then from left to right
// Generates a generator for every row, so you can iterate with two nested for loops
function * iterateVertically<T>(arr: T[][]): Generator<Generator<T>> {
	const height = arr.length;
	const width = arr[0]?.length ?? 0;

	function * iterateRow(x: number) {
		for (let y = 0; y < height; y++) {
			yield arr[y][x];
		}
	}

	for (let x = 0; x < width; x++) {
		yield iterateRow(x);
	}
}

function solve(input: string) {
	const lines = input.trim().split(/\r?\n/g);

	let startX: number = 0;
	let startY: number = 0;

	let endX: number = 0;
	let endY: number = 0;

	const level: Tile[][] = lines.map((line, y) => 
		Iterator.from(line).map((char, x) => {
			if (char === "#") {
				return Tile.Wall;
			}

			if (char === "S") {
				startX = x;
				startY = y;
			} else if (char === "E") {
				endX = x;
				endY = y;
			} else if (char !== ".") {
				throw new Error("Unknown character: " + char);
			}

			return Tile.Empty;
		}).toArray()
	);

	let x = startX;
	let y = startY;
	let steps = 0;
	const distances: (number | null)[][] = level.map(line => line.map(() => null));

	distances[startY][startX] = 0;

	while (x !== endX || y !== endY) {
		const neighbours = [
			[x, y - 1],
			[x + 1, y],
			[x, y + 1],
			[x - 1, y],
		];

		for (const [nx, ny] of neighbours) {
			if (level[ny][nx] === Tile.Empty && distances[ny][nx] == null) {
				steps++;
				distances[ny][nx] = steps;
				x = nx;
				y = ny;
				break;
			}
		}
	}

	const toEnd = distances[endY][endX]!;
	let result = 0;
	
	for (const grid of [distances, iterateVertically(distances)]) {
		grid.forEach((line) => {
			let prev1: number | null = null;
			let prev2: number | null = null;

			line.forEach((char) => {
				if (prev2 != null && prev1 == null && char != null) {
					const big = Math.max(prev2, char);
					const small = Math.min(prev2, char);

					if (toEnd - (small + (toEnd - big) + 2) >= 100) {
						result++;
					}
				}

				prev2 = prev1;
				prev1 = char;
			})
		})
	}


	return result;
}

await runner(solve);
