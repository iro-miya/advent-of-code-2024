import { runner } from "../../runner.ts";

type Coords = { x: number, y: number };

function * combinations<T>(elems: T[]): Generator<[T, T]> {
	for (const first of elems) {
		for (const second of elems) {
			if (first !== second) {
				yield [first, second];
			}
		}
	}
}

function isAlmostInteger(num: number): boolean {
	return Math.abs(num - Math.round(num)) < Number.EPSILON;
}

function solve(input: string): number {
	const level = input.trim().split(/\r?\n/g).map(line => [...line]);
	const height = level.length;
	const width = level?.[0].length ?? 0;

	const antennas: Map<string, Coords[]> = new Map();

	for (const [y, line] of level.entries()) {
		for (const [x, tile] of line.entries()) {
			if (tile !== ".") {
				let antennaArray: Coords[];

				if (antennas.has(tile)) {
					antennaArray = antennas.get(tile)!;
				} else {
					antennaArray = [];
					antennas.set(tile, antennaArray);
				}

				antennaArray.push({ x, y });
			}
		}
	}

	let result = 0;

	for (let x = 0; x < width; x++) {
		tileLoop:
		for (let y = 0; y < height; y++) {
			for (const antennaArray of antennas.values()) {
				for (const [first, second] of combinations(antennaArray)) {
					const antennaDifference = {
						x: second.x - first.x,
						y: second.y - first.y,
					};

					const pointDifference = {
						x: x - first.x,
						y: y - first.y,
					};

					// I have no idea what I'm doing
					// I just visualised it in my head very hard and came up with this
					if (antennaDifference.x / antennaDifference.y === pointDifference.x / pointDifference.y) {
						result++;
						continue tileLoop;
					}
				}
			}
		}
	}
	
	return result;
}

await runner(solve);
