import { runner } from "../../runner.ts";

function * blink(stones: Iterable<number>): Generator<number> {
	for (const stone of stones) {
		if (stone === 0) {
			yield 1;
		} else {
			const length = Math.ceil(Math.log10(stone + 1));

			if (length % 2 === 0) {
				const last = stone % (10 ** (length / 2));
				const first = (stone - last) / (10 ** (length / 2));

				yield first;
				yield last;
			} else {
				yield stone * 2024; // WHAT DO YOU MEAN IT'S NOT 2048 I SPENT SO LONG DEBUGGING THIS
			}
		}
	}
}

function addStone(stones: Map<number, number>, stone: number, amount: number) {
	stones.set(
		stone,
		(stones.get(stone) ?? 0) + amount,
	);
}

function solve(input: string): number {
	let stones = new Map<number, number>();

	for (const stone of input.split(" ").map(Number.parseFloat)) {
		addStone(stones, stone, 1);
	}

	for (let i = 0; i < 75; i++) {
		let newStones = new Map<number, number>();

		for (const [stone, amount] of stones.entries()) {
			if (stone === 0) {
				addStone(newStones, 1, amount);
			} else {
				const length = Math.ceil(Math.log10(stone + 1));

				if (length % 2 === 0) {
					const last = stone % (10 ** (length / 2));
					const first = (stone - last) / (10 ** (length / 2));

					addStone(newStones, first, amount);
					addStone(newStones, last, amount);
				} else {
					addStone(newStones, stone * 2024, amount);
				}
			}
		}

		stones = newStones;
	}

	return stones.values().reduce((a, b) => a + b);
}

await runner(solve);
