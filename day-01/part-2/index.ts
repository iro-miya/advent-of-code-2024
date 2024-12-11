import { runner } from "../../runner.ts";

function solve(input: string): string {
	const list1: number[] = [];
	const list2: number[] = [];

	for (const line of input.trim().split(/\r?\n/g)) {
		const [num1, num2] = line.split(/\s+/g).map(Number.parseFloat);
		list1.push(num1);
		list2.push(num2);
	}

	let result = 0;

	const occurences = new Map<number, number>();

	for (const num of list2) {
		const occ = occurences.get(num) ?? 0;
		occurences.set(num, occ + 1);
	}

	for (const num of list1) {
		const occ = occurences.get(num) ?? 0;
		result += num * occ;
	}

	return result.toString();
}

await runner(solve);
