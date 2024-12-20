import { runner } from "../../runner";

enum Tile {
	Empty,
	Wall,
}

function solve(input: string, file: string) {
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

	const threshold = file.startsWith("example") ? 50 : 100;
	const toEnd = distances[endY][endX]!;
	let result = 0;
	
	for (const [y1, line1] of distances.entries()) {
		for (const [x1, distance1] of line1.entries()) {
			for (const [y2, line2] of distances.entries()) {
				for (const [x2, distance2] of line2.entries()) {
					const steps = Math.abs(y1 - y2) + Math.abs(x1 - x2);

					if (distance1 != null && distance2 != null && steps <= 20) {
						const newLength = distance1 + (toEnd - distance2) + steps;

						if (toEnd - newLength >= threshold) {
							result++;
						}
					}
				}
			}
		}
	}


	return result;
}

await runner(solve);
