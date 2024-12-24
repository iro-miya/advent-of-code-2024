import { runner } from "../../runner.ts";

function solve(input: string): string {
	const graph: Map<string, string[]> = new Map();

	for (const line of input.trim().split(/\r?\n/g)) {
		const [first, second] = line.split("-");

		if (!graph.has(first)) {
			graph.set(first, [second]);
		} else {
			graph.get(first)!.push(second);
		}

		if (!graph.has(second)) {
			graph.set(second, [first]);
		} else {
			graph.get(second)!.push(first);
		}
	}

	const biggestNodes: string[] = graph
		.entries()
		.toArray()
		.sort(([, a], [, b]) => b.length - a.length)
		.map(([key]) => key);

	let bestMatch: string[] = [];

	for (const start of biggestNodes) {
		const paths = graph.get(start)!;

		if (bestMatch.length >= paths.length) {
			// If the current node has fewer paths than the best match, it can't possibly be better
			break;
		}

		// We're doing A* here with a lot of constraints as to where the attempt can go

		interface Attempt {
			// Where the attempt is
			location: string;

			// Where the attempt has been
			seen: string[];

			// Nodes that have been linked by every node visited so far
			potentiallyConnected: string[];
		}

		const attempts: Set<Attempt> = new Set<Attempt>().add(
			{
				location: start,
				seen: [start],
				potentiallyConnected: [start, ...paths],
			},
		);

		const highScores: Map<string, number> = new Map();

		while (attempts.size > 0) {
			const [attempt] = attempts;
			attempts.delete(attempt);

			const { location, potentiallyConnected, seen } = attempt;

			const paths = graph.get(location)!;

			for (const next of paths) {
				const nextPaths = graph.get(next)!;
				const highScore = highScores.get(next) ?? 0;

				if (
					// A node is valid if...
					// It hasn't been traversed before
					!seen.includes(next)

					// It is linked by every node visited so far
					&& potentiallyConnected.includes(next)

					// It links to every node visited so far
					&& seen.every(val => nextPaths.includes(val))

					// There is a longer path than any attempt previously involving this node
					&& seen.length > highScore
				) {
					highScores.set(next, seen.length);

					const newSeen = [...seen, next];
					const newPotentiallyConnected = potentiallyConnected.filter(
						(val) => nextPaths.includes(val) || val === next,
					);

					if (newSeen.length > bestMatch.length) {
						bestMatch = newSeen;
					}

					attempts.add({
						location: next,
						seen: newSeen,
						potentiallyConnected: newPotentiallyConnected,
					});
				}
			}
		}
	}

	return bestMatch.sort().join();
}

await runner(solve);
