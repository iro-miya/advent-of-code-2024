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

	for (const update of updates) {
		const validUpdate = update.toSorted((a, b) => {
			if (rules.has(a)) {
				const ruleA = rules.get(a)!;

				if (ruleA.includes(b)) {
					return -1;
				}
			}

			if (rules.has(b)) {
				const ruleB = rules.get(b)!;

				if (ruleB.includes(a)) {
					return 1;
				}
			}

			return 0;
		});

		if (!Bun.deepEquals(update, validUpdate)) {
			result += middleElement(validUpdate);
		}
	}
	
	return result;
}

await runner(solve);
