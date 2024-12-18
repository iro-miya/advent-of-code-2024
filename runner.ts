// Custom runner by Miya Ironami

import * as fs from "node:fs/promises";
import * as path from "node:path";

export type RunnerReturn = string | number;
export type RunnerFunction = (input: string, filename: string) => RunnerReturn | Promise<RunnerReturn>;

const BASE_DIR = path.dirname(Bun.main);
const INPUT_DIR = path.join(BASE_DIR, "input/");
const CHECK_DIR = path.join(BASE_DIR, "check/");
const OUTPUT_DIR = path.join(BASE_DIR, "output/");

const DISABLE_COLORS = Bun.env.NO_COLOR != null && Bun.env.NO_COLOR !== "";
const RED_ANSI = DISABLE_COLORS ? "" : "\x1B[31m";
const GREEN_ANSI = DISABLE_COLORS ? "" : "\x1B[32m";
const BOLD_ANSI = DISABLE_COLORS ? "" : "\x1B[1m";
const RESET_COLOR_ANSI = DISABLE_COLORS ? "" : "\x1B[39m";
const RESET_ANSI = DISABLE_COLORS ? "" : "\x1B[m";

const OK_PREFIX = `[${GREEN_ANSI}OK${RESET_COLOR_ANSI}]`;
const FAIL_PREFIX = `[${RED_ANSI}FAIL${RESET_COLOR_ANSI}]`;

function formatTime(ns: number) {
	if (ns < 1_000_000) {
		return ns.toLocaleString("en") + " ns";
	}

	if (ns < 1_000_000_000) {
		return (ns / 1_000_000).toFixed(3) + " ms";
	}

	if (ns <  60_000_000_000) {
		return (ns / 1_000_000_000).toFixed(3) + " s";
	}

	if (ns < 3_600_000_000_000) {
		return (ns /  60_000_000_000).toFixed(3) + " min";
	}

	return (ns / 3_600_000_000_000).toFixed(3) + " h";
}

 
export async function runner(func: RunnerFunction) {
	const files = await fs.readdir(INPUT_DIR);

	const results = await Promise.all(files.map(async file => {
		const inputFilepath = path.join(INPUT_DIR, file)
		const checkFilepath = path.join(CHECK_DIR, file);
		const outputFilepath = path.join(OUTPUT_DIR, file)

		// 1. Check that the file isn't actually a directory
		const stat = await fs.stat(inputFilepath);

		if (stat.isDirectory()) {
			return true;
		}

		// 2. Check for the existence of a check file, and read it if it exists
		//    This happens in parallel to the input file getting read
		const checkDataPromise = fs.access(checkFilepath)
			.then(() => true)
			.catch(() => false)
			.then(async (checkFileExists) => {
				if (!checkFileExists) {
					return null;
				} else {
					return Bun.file(checkFilepath).text();
				}
			});

		// 3. Read the input file and process it
		const inputData = await Bun.file(inputFilepath).text();

		const startTime = Bun.nanoseconds();

		// This API has only existed for a week right now,
		// it's not typed in ESNext but it's there.
		const process = Promise.try(func, inputData, file) as Promise<RunnerReturn>;

		const elapsed = Bun.nanoseconds() - startTime;

		return process
			.then(async (output: RunnerReturn) => {
				output = output.toString();

				// If the runner function returns...
				return Promise.all([
					// Write output to file
					Bun.write(outputFilepath, output),

					// Compare with the check file if it exists
					checkDataPromise.then(async (checkData) => {
						const formatted = formatTime(elapsed);
						if (checkData == null) {
							console.log(`${OK_PREFIX} ${file} was processed. This took ${formatted}.`);
							return true;
						}

						const checkTrim = checkData.trim();
						const outputTrim = output.trim();
						if (checkData.trim() === output.trim()) {
							console.log(`${OK_PREFIX} ${file} was processed and matched check. This took ${formatted}.`);
							return true;
						}

						console.log(`${FAIL_PREFIX} ${file} was processed and did not match check. This took ${formatted}.`);

						if (checkTrim.length < 10 && outputTrim.length < 10 && !checkTrim.includes("\n") && !outputTrim.includes("\n")) {
							console.log(`        Expected: ${checkTrim}    Got: ${outputTrim}`);
						}
						return false;
					}),
				]).then(([, result]) => result);
			})
			.catch(async (error) => {
				console.log(`${FAIL_PREFIX} ${file} processing failed.`);
				console.error(Bun.inspect(error, { colors: true }));
				return false;
			});
	}));

	if (results.every(result => result === true)) {
		console.log(`\n${BOLD_ANSI}${OK_PREFIX} Processing successful.${RESET_ANSI}`);
		return true;
	} else {
		console.log(`\n${BOLD_ANSI}${FAIL_PREFIX} Some files couldn't be processed.${RESET_ANSI}`);
		return false;
	}
}
