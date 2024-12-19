import { runner } from "../../runner.ts";

enum Direction {
	Up,
	Right,
	Down,
	Left,
}

// A graph connection from one node to another
interface Connection {
	start: number;
	end: number;
	score: number;

	// The direction allows us to add the 1000 points penalty on turning.
	startDirection: Direction;
	// Connections are simplified and only intersections are kept.
	// Because of that, a connection may end in a different direction than it started in.
	endDirection: Direction;
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

// Deletes all dead-ends in a graph, except the ones in the allowed set.
// Also deletes all nodes that link to nothing.
// Returns a boolean indicating whether any changes were made
function deleteDeadEnds(connectionMap: Map<number, Set<Connection>>, allowed?: Set<number>): boolean {
	let changed = false;
	const toCheck = new Set(connectionMap.keys());

	// while loop because elements may be added during iteration
	while (toCheck.size > 0) {
		const ref = toCheck.values().next().value!;
		toCheck.delete(ref);

		if (allowed && allowed.has(ref)) {
			continue;
		}

		const connections = connectionMap.get(ref)!;

		if (connections.size <= 1) {
			// Only one connection = dead-end
			connectionMap.delete(ref);
			changed = true;

			// Delete the connection from the node that links to this one

			const [connection] = connections; // There is only a single connection

			if (connection) {
				const inward = connectionMap.get(connection.end)!;
				const deadLinks = inward.values()
					.filter(val => val.end === ref);

				for (const deadLink of deadLinks) {
					inward.delete(deadLink);
				}

				// Check whether we didn't create a dead-end just now
				toCheck.add(connection.end);
			}
		}
	}

	return changed;
}

// Collapses paths that aren't intersections, removing the node.
// Those nodes are not interesting since they don't offer any choice.
// Returns a boolean indicating whether any changes were made
function collapseStraightPaths(connectionMap: Map<number, Set<Connection>>, allowed: Set<number>): boolean {
	let changed = false;

	for (const [ref, connections] of connectionMap) {
		if (connections.size === 2 && !allowed.has(ref)) {
			// This is a straight node, it needs to be removed.

			// Get both outward connections
			const [con1, con2] = connections;
			
			// Collapse them both ways
			for (const [outward, end] of [[con1, con2], [con2, con1]]) {
				const startConnections = connectionMap.get(outward.end)!;

				for (const start of startConnections) {
					// start is the connection going to this node
					// end is the connection goint out of this node
					// Since the node is getting removed, they get collapsed.
					if (start.end === ref) {
						start.end = end.end;
						start.score += end.score;

						if (start.endDirection !== end.startDirection) {
							start.score += 1000;
						}

						start.endDirection = end.endDirection;
					}
				}
			}

			connectionMap.delete(ref);
			changed = true;
		}
	}

	return changed;
}

// Deletes connections when another connection with the same properties but a lower cost exists.
// Also deletes connections that lead to the same node.
// Returns a boolean indicating whether any changes were made
function deleteUselessPaths(connectionMap: Map<number, Set<Connection>>): boolean {
	let changed = false;

	for (const [ref, connections] of connectionMap) {
		for (const connection of connections) {
			if (connection.start === connection.end
				|| connections.values().some(
					(val) => val !== connection
						&& val.start === connection.start
						&& val.end === connection.end
						&& val.startDirection === connection.startDirection
						&& val.endDirection === connection.endDirection
						&& val.score < connection.score
				)
			) {
				connections.delete(connection);
				changed = true;

				if (connections.size === 0) {
					connectionMap.delete(ref);
				}
			}
		}
	}

	return changed;
}

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

function solve(input: string) {
	// The graph representing every possible path in the labyrinth
	const connectionMap: Map<number, Set<Connection>> = new Map();

	const level = input.split(/\r?\n/g).map(
		line => [...line],
	);

	const height = level.length;
	const width = level[0]?.length ?? 0;

	let start: number = 0;
	let end: number = 0;

	// For performance, coordinates as saved as a single integer
	function pointToRef(x: number, y: number) {
		return (y * width) + x;
	}

	function refToPoint(ref: number): [number, number] {
		return [ref % width, Math.floor(ref / width)];
	}

	// We iterate the grid in both directions to record every path as a graph
	for (const [i, grid] of [level, iterateVertically(level)].entries()) {
		let direction: Direction; // Parsing direction
		let mirrorDirection: Direction; // Reverse direction

		if (i === 0) {
			direction = Direction.Right;
			mirrorDirection = Direction.Left;
		} else {
			direction = Direction.Down;
			mirrorDirection = Direction.Up;
		}

		// grid and line may be an array or a generator
		// forEach works on both arrays and generators
		grid.forEach((line, index1) => {
			// When we find multiple empty spaces in a row, we create a connection
			let currentConnection: Connection | null = null;

			line.forEach((char, index2) => {
				let x: number;
				let y: number;

				// Get adjacent characters so we can check for intersections
				let charAbove: string;
				let charBelow: string;

				if (direction === Direction.Right) {
					x = index2;
					y = index1;
					charAbove = level[y - 1]?.[x];
					charBelow = level[y + 1]?.[x];
					
				} else {
					x = index1;
					y = index2;
					charAbove = level[y][x - 1];
					charBelow = level[y][x + 1];
				}

				// Empty space: add point to current connection
				if (char !== "#" && currentConnection != null) {
					currentConnection.end = pointToRef(x, y);
					currentConnection.score++;
				}

				// Wall or intersection: Terminate current connection
				if (
					currentConnection != null && (
						char === "#"
						|| charAbove !== "#"
						|| charBelow !== "#"
					)
				) {
					if (currentConnection.score > 0) {
						// Create a "mirror" connection because nodes must link both ways
						const mirror: Connection = {
							start: currentConnection.end,
							end: currentConnection.start,
							startDirection: mirrorDirection,
							endDirection: mirrorDirection,
							score: currentConnection.score,
						}

						for (const connection of [currentConnection, mirror]) {
							// Initialise an empty set if needed
							if (connectionMap.has(connection.start)) {
								connectionMap.get(connection.start)!.add(connection);
							} else {
								connectionMap.set(connection.start, new Set<Connection>().add(connection));
							}
						}
					}

					currentConnection = null;
				}

				// Empty spaces: Start new connection if there isn't one
				// Notice that in the case of an intersection or an S/E character, all three conditions will run.
				if (char !== "#" && currentConnection == null) {
					currentConnection = {
						start: pointToRef(x, y),
						end: pointToRef(x, y),
						score: 0,
						startDirection: direction,
						endDirection: direction,
					}
				}

				// On the first iteration, record the position of S and E
				if (direction === Direction.Right) {
					if (char === "S") {
						start = pointToRef(x, y);
					} else if (char === "E") {
						end = pointToRef(x, y);
					}
				}
			});
		});
	}

	// Graph simplification: the simplification algorithms are run until the graph is stable (it stops changing)
	while (true) {
		const deadEnds = deleteDeadEnds(connectionMap, new Set([start, end]));
		const nodesCollapsed = collapseStraightPaths(connectionMap, new Set([start, end]));
		const uselessPaths = deleteUselessPaths(connectionMap);

		if (!deadEnds && !nodesCollapsed && !uselessPaths) {
			break;
		}
	}

	// Turn the graph into an SVG to check how it looks
	/*
	let svg = `<svg version="2" width="${width * 10}" height="${height * 10}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`

	for (const [ref, connections] of connectionMap) {
		const [startX, startY] = refToPoint(ref);

		svg += `<circle cx="${startX}" cy="${startY}" r="1" fill="red" />`;

		for (const connection of connections) {
			const [endX, endY] = refToPoint(connection.end);
			svg += `<line x1="${startX}" y1="${startY}" x2="${endX}" y2="${endY}" stroke="black" />`
		}
	}

	const [startX, startY] = refToPoint(start);
	svg += `<circle cx="${startX}" cy="${startY}" r="1" fill="green" />`;

	const [endX, endY] = refToPoint(end);
	svg += `<circle cx="${endX}" cy="${endY}" r="1" fill="blue" />`;
	svg += "</svg>";

	return svg;
	//*/

	// Pathfinding!!!

	interface Attempt {
		visited: Set<number>,
		location: number,
		score: number;
		direction: Direction | null;
	}

	// The current attempts
	// On every iteration, we pick one the one with the lowest score and expand it in every possible direction
	const attempts: Set<Attempt> = new Set<Attempt>().add(
		{
			visited: new Set<number>().add(start),
			location: start,
			score: 0,
			direction: null,
		}
	);

	// The lowest scores in which each connection was traversed.
	// It's useless to attempt to traverse a connection if it would result in a higher score than a previous attempt,
	// so we skip those cases.
	const highScores: Map<Connection, number> = new Map();

	while (attempts.size > 0) {
		// Find the attempt with the lowest score (or one of them)
		const [bestAttempt] = attempts.values()
			.reduce(reduceLowest((attempt) => attempt.score), []);

		attempts.delete(bestAttempt);

		// If the attempt turns out to have reached the end, then we found the solution!!!
		if (bestAttempt.location === end) {
			return bestAttempt.score;
		}

		// Get every connection from our current location and expand in all of them.
		const connections = connectionMap.get(bestAttempt.location)!;

		for (const connection of connections) {
			if (bestAttempt.visited.has(connection.end)) {
				// Won't go back to a previously visited location.
				continue;
			}

			const highScore = highScores.get(connection) ?? Infinity;
			let newScore = bestAttempt.score + connection.score;

			if (bestAttempt != null && bestAttempt.direction !== connection.startDirection) {
				newScore += 1000;
			}

			// Don't go through a connection if we already managed to visit it with a lower score
			if (newScore >= highScore) {
				continue;
			}

			attempts.add({
				visited: new Set(bestAttempt.visited).add(connection.end),
				location: connection.end,
				direction: connection.endDirection,
				score: newScore,
			});

			highScores.set(connection, newScore);
		}
	}

	throw new Error("No solution found");
}

await runner(solve);
