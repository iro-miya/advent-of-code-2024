import { runner } from "../../runner.ts";

interface Coords {
	x: number;
	y: number;
}

enum Tile {
	Empty,
	Wall,
}

enum Direction {
	Up,
	Right,
	Down,
	Left,
}

function move({ x, y }: Coords, direction: Direction, steps: number = 1): Coords {
	switch (direction) {
		case Direction.Up:
			return { x, y: y - steps };

		case Direction.Right:
			return { x: x + steps, y };

		case Direction.Down:
			return { x, y: y + steps };

		case Direction.Left:
			return { x: x - steps, y };
	}
}

interface ReindeerOptions {
	level: Tile[][];
	position?: Coords;
	visited?: Coords[];
	direction: Direction;
	score?: number | null | undefined;
}

class Reindeer {
	visited: Coords[] = [];
	level: Tile[][];
	direction: Direction;
	score: number = 0;

	constructor({ level, position, visited, direction, score }: ReindeerOptions) {
		this.level = level;

		if (visited) {
			this.visited = visited;
		}

		if (position) {
			this.visited.push(position);
		}

		this.direction = direction;

		if (score != null) {
			this.score = score;
		}
	}

	get position(): Coords {
		return Object.freeze(this.visited[this.visited.length - 1]);
	}

	possibleDirections(): Set<Direction> {
		const directions: [Direction, Coords][] = [
			[Direction.Up, move(this.position, Direction.Up)],
			[Direction.Right, move(this.position, Direction.Right)],
			[Direction.Down, move(this.position, Direction.Down)],
			[Direction.Left, move(this.position, Direction.Left)],
		];

		const possible = new Set<Direction>();

		for (const [direction, position] of directions) {
			if (
				this.level[position.y][position.x] === Tile.Empty
				&& !this.visited.some(
					(visited) => visited.x === position.x && visited.y === position.y
				)
			) {
				possible.add(direction);
			}
		}

		return possible;
	}


	*advance(): Generator<Reindeer> {
		const newPos = move(this.position, this.direction);

		if (this.level[newPos.y][newPos.x] === Tile.Empty) {
			this.visited.push(newPos);
			this.score++;

			for (const direction of this.possibleDirections()) {
				if (direction === this.direction) {
					yield this;
				} else {
					yield new Reindeer({
						level: this.level,
						visited: [...this.visited],
						direction,
						score: this.score + 1_000,
					});
				}
			}
		}
	}

	distanceTo(point: Coords) {
		return Math.sqrt(
			Math.abs(this.position.x - point.x) ** 2
			+ Math.abs(this.position.y - point.y) ** 2,
		)
	}
}

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


function solve(input: string): number {
	const start: Coords = {
		x: 0,
		y: 0,
	};

	const end: Coords = {
		x: 0,
		y: 0,
	};

	const level: Tile[][] = input.split(/\r?\n/g).map((line, y) =>
		Iterator.from(line).map((char, x) => {
			if (char === "#") {
				return Tile.Wall;
			}

			if (char === "S") {
				start.x = x;
				start.y = y;
				return Tile.Empty;
			}

			if (char === "E") {
				end.x = x;
				end.y = y;
				return Tile.Empty;
			}

			if (char === ".") {
				return Tile.Empty;
			}

			throw new Error("Unknown character: " + char);
		}).toArray(),
	);

	const reindeers: Set<Reindeer> = new Set([
		new Reindeer({ level, position: start, direction: Direction.Up }),
		new Reindeer({ level, position: start, direction: Direction.Right }),
		new Reindeer({ level, position: start, direction: Direction.Down }),
		new Reindeer({ level, position: start, direction: Direction.Left }),
	]);

	const winners: Set<Reindeer> = new Set();

	let bestScore = Infinity;

	while (reindeers.size > 0) {
		const bestReindeers = Iterator.from(reindeers)
			.reduce(reduceLowest(reindeer => reindeer.score), [])
			.reduce(reduceLowest(reindeer => reindeer.distanceTo(end)), []);

		const reindeer = bestReindeers[0];

		if (reindeer.score > bestScore) {
			break;
		}

		reindeers.delete(reindeer);

		for (const otherReindeer of reindeers) {
			if (
				reindeer.position.x === otherReindeer.position.x
				&& reindeer.position.y === otherReindeer.position.y
				&& reindeer.direction === otherReindeer.direction
				&& reindeer.score < otherReindeer.score
			) {
				reindeers.delete(otherReindeer);
			}
		}

		for (const newReindeer of reindeer.advance()) {
			if (
				newReindeer.position.x === end.x
				&& newReindeer.position.y === end.y
				&& newReindeer.score <= bestScore
			) {
				winners.add(newReindeer);
				bestScore = newReindeer.score;
				break;
			} else {
				reindeers.add(newReindeer);
			}
		}
	}

	const crossedTiles: Coords[] = [];

	for (const winner of winners) {
		for (const tile of winner.visited) {
			if (!crossedTiles.some(
				(elem) => elem.x === tile.x && elem.y === tile.y
			)) {
				crossedTiles.push(tile);
			}
		}
	}

	return crossedTiles.length;
}

await runner(solve);
