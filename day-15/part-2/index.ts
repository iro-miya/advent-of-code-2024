import { runner } from "../../runner.ts";

enum Direction {
	Up,
	Right,
	Down,
	Left,
}

enum Tile {
	Wall,
	Empty,
}

interface Coords {
	x: number;
	y: number;
}

class Level {
	readonly boxes: Box[] = [];

	constructor(
		public tiles: Tile[][],
	) {}

	at(position: Coords): Box | Tile {
		return this.boxes.find(box => box.isAt(position)) ?? this.tiles[position.y][position.x];
	}
}

class Box {
	constructor(
		public readonly level: Level,
		public position: Coords,
	) {
		level.boxes.push(this);
	}

	isAt(position: Coords): boolean {
		return position.y === this.position.y
			&& (
				position.x === this.position.x
				|| position.x === this.position.x + 1
			);
	}

	move(direction: Direction, dry: boolean = false): boolean {
		let newX = this.position.x;
		let newY = this.position.y;

		switch (direction) {
			case Direction.Up:
				newY--;
				break;

			case Direction.Right:
				newX++;
				break;

			case Direction.Down:
				newY++;
				break;

			case Direction.Left:
				newX--;
				break;
		}

		const obstruction: Set<Box | Tile> = new Set();
		switch (direction) {
			case Direction.Up:
			case Direction.Down:
				obstruction.add(this.level.at({ x: newX, y: newY }));
				obstruction.add(this.level.at({ x: newX + 1, y: newY }));
				break;

			case Direction.Left:
				obstruction.add(this.level.at({ x: newX, y: newY }));
				break;

			case Direction.Right:
				obstruction.add(this.level.at({ x: newX + 1, y: newY }));
				break;
		}

		if (obstruction.has(Tile.Wall)) {
			return false;
		}

		for (const box of obstruction) {
			if (box instanceof Box) {
				if (!box.move(direction, true)) {
					return false;
				}
			}
		}

		if (!dry) {
			for (const box of obstruction) {
				if (box instanceof Box) {
					box.move(direction, false);
				}
			}

			this.position.x = newX;
			this.position.y = newY;
		}

		return true;
	}

}

function solve(input: string): number {
	const [inputLevel, inputMoves] = input.split("\n\n");

	let botX: number = 0;
	let botY: number = 0;

	const boxCoords: Coords[] = [];

	const tiles: Tile[][] = inputLevel
		.split("\n")
		.map((line, y) =>
			Iterator.from(line).flatMap((char, x) => {
				if (char === "#") {
					return [Tile.Wall, Tile.Wall];
				}

				if (char === "O") {
					boxCoords.push({ x: x * 2, y });
				} else if (char === "@") {
					botX = x * 2;
					botY = y;
				}

				return [Tile.Empty, Tile.Empty];
			})
			.toArray()
		);

	const level = new Level(tiles);
	const boxes = boxCoords.map((pos) => new Box(level, pos));

	const moves: Direction[] = Iterator.from(inputMoves)
		.filter((char) => char !== "\n")
		.map((char) => {
			switch (char) {
				case "^":
					return Direction.Up;

				case ">":
					return Direction.Right;

				case "v":
					return Direction.Down;

				case "<":
					return Direction.Left;

				default:
					throw new Error("Unknown character in move section: " + char);
			}
		})
		.toArray();

	for (const move of moves) {
		let newX = botX;
		let newY = botY;

		switch (move) {
			case Direction.Up:
				newY--;
				break;

			case Direction.Right:
				newX++;
				break;

			case Direction.Down:
				newY++;
				break;

			case Direction.Left:
				newX--;
				break;
		}

		// Because there are walls around the level, the new coordinates have to be in bounds

		const obstruction = level.at({ x: newX, y: newY });

		if (obstruction === Tile.Wall) {
			continue;
		}

		if (obstruction instanceof Box) {
			if (!obstruction.move(move)) {
				continue;
			}
		}

		// newX,newY has to be empty at this point
		botX = newX;
		botY = newY;
	}

	let result = 0;

	for (const box of boxes) {
		result += (box.position.y * 100) + box.position.x;
	}

	return result;
}

await runner(solve);
