import { runner } from "../../runner.ts";

function solve(input: string): string {
	const list1: number[] = [];
	const list2: number[] = [];

	for (const line of input.trim().split(/\r?\n/g)) {
		const [num1, num2] = line.split(/\s+/g).map(Number.parseFloat);
		list1.push(num1);
		list2.push(num2);
	}

	list1.sort((a, b) => a - b);
	list2.sort((a, b) => a - b);

	let result = 0;

	for (let i = 0; i < list1.length; i ++) {
		const num1 = list1[i];
		const num2 = list2[i];

		const difference = Math.abs(num1 - num2);
		result += difference;
	}

	return result.toString();
}

await runner(solve);
