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

// Generates every possible report with one level removed
function * reportsWithLevelRemoved<T>(report: T[]): Generator<T[]> {
	for (let i = 0; i < report.length; i++) {
		yield report.toSpliced(i, 1);
	}
}

function solve(input: string): number {
	let result = 0;

	for (const line of input.trim().split(/\r?\n/g)) {
		const completeReport = line.split(/\s+/g).map(Number.parseFloat);

		for (const report of reportsWithLevelRemoved(completeReport)) {
			if (isReportSafe(report)) {
				result++;
				break;
			}
		}
	}

	return result;
}

await runner(solve);
