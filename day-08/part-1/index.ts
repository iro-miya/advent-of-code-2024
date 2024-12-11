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

	const antinodes: Coords[] = [];

	for (const antennaArray of antennas.values()) {
		for (const [first, second] of combinations(antennaArray)) {
			const distance = {
				x: second.x - first.x,
				y: second.y - first.y,
			}

			const possibleAntinodes = [
				{
					x: first.x + (distance.x * (2 / 3)),
					y: first.y + (distance.y * (2 / 3)),
				},
				{
					x: first.x + (distance.x * 2),
					y: first.y + (distance.y * 2),
				},
			];

			for (const antinode of possibleAntinodes) {
				if (
					isAlmostInteger(antinode.x)
					&& antinode.x >= 0
					&& antinode.x < width
					&& isAlmostInteger(antinode.y)
					&& antinode.y >= 0
					&& antinode.y < height
				) {
					antinodes.push({
						x: Math.round(antinode.x),
						y: Math.round(antinode.y),
					});
				}
			}
		}
	}

	const uniqueAntinodes = antinodes.reduce((unique: Coords[], antinode: Coords) => {
		if (!unique.some(val => Bun.deepEquals(val, antinode))) {
			unique.push(antinode);
		}

		return unique;
	}, [] as Coords[]);

	return uniqueAntinodes.length;
}

await runner(solve);
