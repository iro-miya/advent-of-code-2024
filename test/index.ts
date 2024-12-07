import { runner } from "../runner.ts";

function solve(input: string): string {
	const numbers = input.split(" ").map(Number.parseFloat);
	const added = numbers.map(num => num + 1);

	if (added.some(Number.isNaN)) {
		throw new Error("Input was not a number");
	}

	return added.join(" ");
}

await runner(solve);
