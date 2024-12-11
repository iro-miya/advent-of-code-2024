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

	interface File {
		start: number;
		length: number;
	}

	const files: File[] = [];

	let pos = 0;

	for (const [i, length] of diskMap.entries()) {
		const id = i % 2 === 1 ? 0 : (i / 2) + 1;

		for (let i = 0; i < length; i++) {
			disk[pos + i] = id;
		}

		if (id > 0) {
			files.push({
				start: pos,
				length,
			});
		}

		pos += length;
	}

	fileLoop:
	for (let i = files.length - 1; i >= 0; i--) {
		const file = files[i];

		let freeSpace = 0;
		let freeSpaceStart = 0;

		for (let j = 0; j < file.start; j++) {
			if (disk[j] === 0) {
				freeSpace++;

				if (freeSpace >= file.length) {
					// Enough free space found, swap the file with the free space
					for (let i = 0; i < file.length; i++) {
						[disk[freeSpaceStart + i], disk[file.start + i]] = [disk[file.start + i], disk[freeSpaceStart + i]];
					}
					continue fileLoop;
				}
			} else {
				freeSpace = 0;
				freeSpaceStart = j + 1;
			}
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
