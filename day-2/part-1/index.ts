import { runner } from "../../runner.ts";

function isReportSafe(report: number[]) {
	let sign = 0;

	for (let i = 0; i < report.length - 1; i++) {
		const current = report[i]
		const next = report[i + 1];

		const diff = current - next;

		if (Math.abs(diff) > 3 || current === next) {
			// Numbers differed by more than 3 or were the same
			return false;
		}

		if (
			sign === -1 && Math.sign(diff) === 1 ||
			sign === 1 && Math.sign(diff) === -1
		) {
			// Numbers aren't all increasing or decreasing
			return false;
		}

		sign = Math.sign(diff);
	}

	return true;
}

function solve(input: string): number {
	let result = 0;

	for (const line of input.trim().split(/\r?\n/g)) {
		const report = line.split(/\s+/g).map(Number.parseFloat);

		if (isReportSafe(report)) {
			result++;
		}
	}

	return result;
}

await runner(solve);
