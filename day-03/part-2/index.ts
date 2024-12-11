import { runner } from "../../runner.ts";

const MULL_REGEX = () => /(do|don't)\(\)|mul\((\d{1,3}),(\d{1,3})\)/g;

function solve(input: string) {
	let result = 0;
	let enabled = true;

	for (const [, enable, num1, num2] of input.matchAll(MULL_REGEX())) {
		if (enable === "do") {
			enabled = true;
		} else if (enable === "don't") {
			enabled = false;
		} else if (enabled) {
			result += Number.parseFloat(num1) * Number.parseFloat(num2);
		}
	}

	return result;
}

await runner(solve);
