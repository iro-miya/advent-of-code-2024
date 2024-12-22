import { runner } from "../../runner.ts";

function iterateSecret(secret: number): number {
	secret ^= secret << 6; // like * 64
	secret &= 16777215; // like % 16777216
	secret ^= secret >> 5; // like / 32
	// Turns out you don't neet to prune after that *shrugs*
	secret ^= secret << 11; // like * 2048
	secret &= 16777215; // like % 16777216

	return secret;
}

function solve(input: string): number {
	let result = 0;

	const lines = input.split(/\r?\n/g).map(Number.parseFloat);

	function simulateWinnings(pattern1: number, pattern2: number, pattern3: number, pattern4: number): number {
		let result = 0;

		for (let num of lines) {
			let change1 = Infinity;
			let change2 = Infinity;
			let change3 = Infinity;
			let lastDigit = Infinity;

			for (let i = 0; i < 2000; i++) {
				num = iterateSecret(num);
				const digit = num % 10;
				const change = digit - lastDigit;

				if (pattern4 === change3 && pattern3 === change2 && pattern2 === change1 && pattern1 === change) {
					result += digit;
					break;
				}

				lastDigit = digit;
				change3 = change2;
				change2 = change1;
				change1 = change;
			}
		}

		return result;
	}

	let bestWin = 0;

	for (let pattern1 = -9; pattern1 <= 9; pattern1++) {
		for (let pattern2 = -9; pattern2 <= 9; pattern2++) {
			for (let pattern3 = -9; pattern3 <= 9; pattern3++) {
				for (let pattern4 = -9; pattern4 <= 9; pattern4++) {
					const win = simulateWinnings(pattern1, pattern2, pattern3, pattern4);

					if (win > bestWin) {
						bestWin = win;
					}
				}
			}
		}

		console.log(`Progress: ${pattern1 + 10} / 19`);
	}

	return bestWin;
}

await runner(solve);
