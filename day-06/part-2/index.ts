import { runner } from "../../runner.ts";

function step(x: number, y: number, direction: number): [number, number] {
	switch (direction) {
		case 0:
			return [x, y - 1];

		case 1:
			return [x + 1, y];

		case 2:
			return [x, y + 1];

		case 3:
			return [x - 1, y];

		default:
			throw new Error(`Invalid direction: ${direction}`);
	}
}

function solve(input: string): number {
	const level = input
		.split(/\r?\n/g)
		.map(line => line.trim())
		.filter(line => line.length > 0)
		.map(line => [...line]);

	const height = level.length;
	const width = level[0].length;

	const startY = level.findIndex(line => line.includes("^"));
	const startX = level[startY].indexOf("^");

	// Tiles are stored as comma-separatd strings in a set so they get de-duplicated
	const tilesVisited = new Set<string>([`${startX},${startY}`]);

	let x = startX;
	let y = startY;
	let direction = 0; // 0 = up, 1 = right, 2 = down, 3 = left

	while (true) {
		const [newX, newY] = step(x, y, direction);

		if (
			newX < 0
			|| newX >= width
			|| newY < 0
			|| newY >= height
		) {
			// Guard has left the area
			break;
		}

		const newTile = level[newY][newX];

		if (newTile === "#") {
			// Guard hit a wall
			direction += 1;
			direction %= 4;
			continue;
		}

		x = newX;
		y = newY;
		tilesVisited.add(`${x},${y}`);
	}

	let result = 0;

	for (const obstacle of tilesVisited) {
		const [obstacleX, obstacleY] = obstacle
			.split(",")
			.map(Number.parseFloat);

		// Record every states to detect loops
		// A state is "x,y,direction", if it occurs twice, the guard is looping
		const states = new Set<string>();

		let x = startX;
		let y = startY;
		let direction = 0; // 0 = up, 1 = right, 2 = down, 3 = left

		while (true) {
			const [newX, newY] = step(x, y, direction);

			if (
				newX < 0
				|| newX >= width
				|| newY < 0
				|| newY >= height
			) {
				// Guard has left the area
				break;
			}

			const newTile = level[newY][newX];

			if (newTile === "#" || (newY === obstacleY && newX === obstacleX)) {
				// Guard hit a wall
				direction += 1;
				direction %= 4;
				continue;
			}

			x = newX;
			y = newY;
			const state = `${x},${y},${direction}`;

			if (states.has(state)) {
				// Guard is looping
				result++;
				break;
			}

			states.add(state);
		}
	}

	return result;
}

await runner(solve);
