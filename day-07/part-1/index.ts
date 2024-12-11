import { runner } from "../../runner.ts";

function * iterateCombinations<T>(elements: T[], length: number): Generator<T[]> {
	if (length === 1) {
		yield* elements.map(elem => [elem]);
	} else {
		for (const elem of elements) {
			for (const rest of iterateCombinations(elements, length - 1)) {
				yield [elem, ...rest];
			}
		}
	}
}

function solve(input: string): number {
	let calibrationResult = 0;

	inputLoop:
	for (const line of input.trim().split(/\r?\n/g)) {
		const [resultStr, numbersStr] = line.split(": ");

		const expectedResult: number = Number.parseFloat(resultStr);
		const numbers: number[] = numbersStr.split(" ").map(Number.parseFloat);

		for (const solution of iterateCombinations(["+", "*"], numbers.length - 1)) {
			let result = numbers[0];

			for (let i = 0; i < solution.length; i++) {
				switch (solution[i]) {
					case "+":
						result += numbers[i + 1];
						break;

					case "*":
						result *= numbers[i + 1];
						break;
				}
			}

			if (result === expectedResult) {
				calibrationResult += expectedResult;
				continue inputLoop;
			}
		}
	}

	return calibrationResult;
}

await runner(solve);
