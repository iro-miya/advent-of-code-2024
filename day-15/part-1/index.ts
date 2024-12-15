import { runner } from "../../runner.ts";

enum Direction {
	Up,
	Down,
	Right,
	Left,
}

enum Tile {
	Wall,
	Box,
	Empty,
}

function solve(input: string): number {
	const [inputLevel, inputMoves] = input.split("\n\n");

	let botX: number = 0;
	let botY: number = 0;

	const level: Tile[][] = inputLevel
		.split("\n")
		.map((line, y) =>
			Iterator.from(line).map((char, x) => {
				switch (char) {
					case "#":
						return Tile.Wall;

					case "O":
						return Tile.Box;

					case "@":
						botX = x;
						botY = y;
						// Fall through

					default:
						return Tile.Empty;
				}
			})
			.toArray()
		);

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

	moveLoop:
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

		switch (level[newY][newX]) {
			case Tile.Wall:
				// Can't move into a wall
				continue;

			case Tile.Empty:
				// Can move into empty space
				break;

			case Tile.Box:
				// Attempt to push the box away
				for (let i = 1; true; i++) {
					let checkX: number;
					let checkY: number;

					switch (move) {
						case Direction.Up:
							checkX = newX;
							checkY = newY - i;
							break;

						case Direction.Right:
							checkX = newX + i;
							checkY = newY;
							break;

						case Direction.Down:
							checkX = newX;
							checkY = newY + i;
							break;

						case Direction.Left:
							checkX = newX - i;
							checkY = newY;
							break;
					}

					switch (level[checkY][checkX]) {
						case Tile.Wall:
							// Can't move this box into a wall
							continue moveLoop;

						case Tile.Empty:
							// Move the box into the space
							level[newY][newX] = Tile.Empty;
							level[checkY][checkX] = Tile.Box;
							break;

						case Tile.Box:
							// Look at the next tile
							continue;
					}

					break;
				}
		}

		// newX,newY has to be empty at this point
		botX = newX;
		botY = newY;
	}

	let result = 0;

	for (const [y, line] of level.entries()) {
		for (const [x, tile] of line.entries()) {
			if (tile === Tile.Box) {
				result += (y * 100) + x;
			}
		}
	}

	return result;
}

await runner(solve);
