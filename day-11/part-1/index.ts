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

function count(acc: number) {
	return acc + 1;
}


function solve(input: string): number {
	let stones: IteratorObject<number> = input.split(" ").map(Number.parseFloat).values();

	for (let i = 0; i < 25; i++) {
		stones = blink(stones);
	}

	return stones.reduce(count, 0);
}

await runner(solve);
