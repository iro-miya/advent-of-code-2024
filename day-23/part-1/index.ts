import { runner } from "../../runner.ts";

function solve(input: string): number {
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

	const matchingNames = new Set(
		graph.keys().filter(key => key[0] === "t"),
	);

	const threeway: string[][] = []

	for (const first of matchingNames) {
		const paths = graph.get(first)!;
		for (const [i, second] of paths.entries()) {
			// Skip values already visited
			for (const third of paths.values().drop(i)) {
				if (
					graph.get(second)!.includes(third)

					// Prevents duplicates
					&& !threeway.some(val =>
						val.includes(first)
						&& val.includes(second)
						&& val.includes(third)
					)
				) {
					threeway.push([first, second, third]);
				}
			}
		}
	}

	return threeway.length;
}

await runner(solve);
