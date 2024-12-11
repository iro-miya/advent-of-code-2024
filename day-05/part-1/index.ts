import { runner } from "../../runner.ts";

function middleElement<T>(arr: T[]): T {
	const index = Math.floor(arr.length / 2);
	return arr[index];
}

function solve(input: string): number {
	const rules: Map<number, number[]> = new Map();
	const updates: number[][] = [];

	for (const line of input.split(/\r?\n/)) {
		if (line.includes("|")) {
			const [num1, num2] = line.split("|").map(Number.parseFloat);

			if (rules.has(num1)) {
				rules.get(num1)!.push(num2);
			} else {
				rules.set(num1, [num2]);
			}
		} else if (line.includes(",")) {
			updates.push(line.split(",").map(Number.parseFloat));
		}
	}

	let result = 0;

	updateLoop:
	for (const update of updates) {
		for (let i = 1; i < update.length; i++) {
			if (!rules.has(update[i])) {
				continue;
			}

			const rule = rules.get(update[i])!;

			for (let j = 0; j < i; j++) {
				if (rule.includes(update[j])) {
					continue updateLoop;
				}
			}
		}

		result += middleElement(update);
	}
	
	return result;
}

await runner(solve);
