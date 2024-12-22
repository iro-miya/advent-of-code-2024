import { runner } from "../../runner.ts";

function iterateSecret(secret: number): number {
	secret ^= secret << 6; // like * 64
	secret &= 16777215; // like % 16777216
	secret ^= secret >> 5; // like / 32
	// Turns out you don't neet to prune after that
	secret ^= secret << 11; // like * 2048
	secret &= 16777215; // like % 16777216

	return secret;
}

function solve(input: string): number {
	let result = 0;

	for (const line of input.trim().split(/\r?\n/g)) {
		let num = Number.parseInt(line, 10);

		for (let i = 0; i < 2000; i++) {
			num = iterateSecret(num);
		}

		result += num;
	}

	return result;
}

await runner(solve);
