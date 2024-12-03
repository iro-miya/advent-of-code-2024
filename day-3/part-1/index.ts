import { runner } from "../../runner.ts";

const MULL_REGEX = () => /mul\((\d{1,3}),(\d{1,3})\)/g;

function solve(input: string) {
	let result = 0;

	for (const [, num1, num2] of input.matchAll(MULL_REGEX())) {
		result += Number.parseFloat(num1) * Number.parseFloat(num2);
	}

	return result;
}

await runner(solve);
