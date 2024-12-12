import { runner } from "../../runner.ts";

interface Point {
	x: number;
	y: number;
}

function isPointInArray(arr: Point[], point: Point): boolean {
	return arr.some(elem => Bun.deepEquals(elem, point));
}

function * pointsInArea(grid: any[][], origin: Point): Generator<Point> {
	const seen: Point[] = [];

	function * recurse(point: Point): Generator<Point> {
		if (isPointInArray(seen, point)) {
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

type Direction = "up" | "down" | "left" | "right";

function sidesFenced(grid: any[][], point: Point): Direction[] {
	const result: Direction[] = [];
	const height = grid.length;
	const width = grid[0]?.length ?? 0;

	const tile = grid[point.y][point.x];

	if (point.x <= 0 || grid[point.y][point.x - 1] !== tile) {
		result.push("left");
	}

	if (point.y <= 0 || grid[point.y - 1][point.x] !== tile) {
		result.push("up");
	}

	if (point.x >= width - 1 || grid[point.y][point.x + 1] !== tile) {
		result.push("right");
	}

	if (point.y >= height - 1 || grid[point.y + 1][point.x] !== tile) {
		result.push("down");
	}

	return result;
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
		for (const x of line.keys()) {
			const origin = { x, y };

			if (!isPointInArray(seen, origin)) {
				let fences = 0;
				let area = 0;

				const directionsSeen: Record<Direction, Point[]> = {
					up: [],
					left: [],
					right: [],
					down: [],
				};

				for (const point of pointsInArea(level, origin)) {
					seen.push(point);
					area++;

					const sides = sidesFenced(level, point);

					if (sides.includes("up")) {
						let direction: Direction = "right";
						let position = point;

						const fencesDirections: Direction[] = [];

						while (!isPointInArray(directionsSeen[direction], position)) {
							directionsSeen[direction].push(position);
							fencesDirections.push(direction);

							let expectedWall: Direction;
							let nextTile: Point;

							// Follow wall on left hand side
							switch (direction) {
								case "up":
									expectedWall = "left";
									nextTile = { x: position.x, y: position.y - 1 };
									break;

								case "left":
									expectedWall = "down";
									nextTile = { x: position.x - 1, y: position.y };
									break;

								case "down":
									expectedWall = "right";
									nextTile = { x: position.x, y: position.y + 1 };
									break;

								case "right":
									expectedWall = "up";
									nextTile = { x: position.x + 1, y: position.y };
									break;
							}

							if (
								nextTile.x >= 0
								&& nextTile.x < width
								&& nextTile.y >= 0
								&& nextTile.y < height
								&& level[position.y][position.x] === level[nextTile.y][nextTile.x]
							) {
								// We can proceed
								if (!sidesFenced(level, nextTile).includes(expectedWall)) {
									// We should turn counter-clockwise

									switch (direction) {
										case "left":
											direction = "down";
											break;

										case "down":
											direction = "right";
											break;

										case "right":
											direction = "up";
											break;

										case "up":
											direction = "left";
											break;
									}
								}

								position = nextTile;
							} else {
								// Bumps into a wall, we should turn clockwise
								switch (direction) {
									case "up":
										direction = "right";
										break;

									case "right":
										direction = "down";
										break;

									case "down":
										direction = "left";
										break;

									case "left":
										direction = "up";
										break;
								}
							}
						}

						const uniqueFences: Direction[] = [];

						for (let i = 0; i < fencesDirections.length; i++) {
							const curr = fencesDirections[i];
							const prev = i === 0
								? fencesDirections[fencesDirections.length - 1]
								: fencesDirections[i - 1];

							if (curr !== prev) {
								uniqueFences.push(curr);
							}
						}

						fences += uniqueFences.length;
					}
				}

				result += area * fences;
			}
		}
	}

	return result;
}

await runner(solve);
