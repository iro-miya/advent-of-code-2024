import { runner } from "../../runner.ts";

function solve(input: string): number {
	const diskMap = Uint8Array.from(
		[...input]
			// If you pass Number.parseInt directly to .map, the index gets passed as the base!!!
			.map((num) => Number.parseInt(num, 10))
			.filter(Number.isFinite));

	const diskSize = diskMap.reduce((a, b) => a + b);

	// Empty space is represented by 0, and ID numbers *start at one*
	const disk = new Uint16Array(diskSize);

	let pos = 0;

	for (const [i, length] of diskMap.entries()) {
		const id = i % 2 === 1 ? 0 : (i / 2) + 1;

		for (let i = 0; i < length; i++) {
			disk[pos + i] = id;
		}

		pos += length;
	}

	diskLoop:
	for (const i of disk.keys()) {
		if (disk[i] === 0) {
			for (let j = disk.length - 1; j > i; j--) {
				if (disk[j] !== 0) {
					[disk[i], disk[j]] = [disk[j], disk[i]];
					continue diskLoop;
				}
			}

			break diskLoop;
		}
	}

	let result = 0;

	for (const [i, id] of disk.entries()) {
		if (id > 0) {
			result += (id - 1) * i;
		}
	}

	return result;
}

await runner(solve);
