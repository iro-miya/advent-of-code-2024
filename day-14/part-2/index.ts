import { runner } from "../../runner.ts";

const BOT_REGEX = () => /p=(?<B_X>-?\d+),(?<B_Y>-?\d+) v=(?<V_X>-?\d+),(?<V_Y>-?\d+)(?:\n|\n?$)/gy;

interface BotRegexGroups {
	B_X: string;
	B_Y: string;
	V_X: string;
	V_Y: string;
}

interface Coords {
	x: number;
	y: number;
}

interface Bot {
	position: Coords;
	velocity: Coords;
}

const DURATION = 11000;

const BIG_HEIGHT = 103;
const BIG_WIDTH = 101;

const SMALL_HEIGHT = 7;
const SMALL_WIDTH = 11;

console.log("-------------------");
console.log("This solution can't be fully automated.");
console.log("Check the output and look for the frame where the easter egg is displayed.");
console.log("(Reducing the font size helps scroll through the file quickly.)");
console.log("-------------------\n");

function solve(input: string, filename: string): string {
	const height = filename.startsWith("example") ? SMALL_HEIGHT : BIG_HEIGHT;
	const width = filename.startsWith("example") ? SMALL_WIDTH : BIG_WIDTH;
	
	const bots: Bot[] = input.matchAll(BOT_REGEX())
		.map(match => {
			const groups = match.groups as unknown as BotRegexGroups;
			
			return {
				position: {
					x: Number.parseInt(groups.B_X, 10),
					y: Number.parseInt(groups.B_Y, 10),
				},
				velocity: {
					x: Number.parseInt(groups.V_X, 10),
					y: Number.parseInt(groups.V_Y, 10),
				},
			};
		})
		.toArray();

	let result = "";

	for (let frame = 0; frame < DURATION; frame++) {
		const level = Array(height).fill(null).map(() => Array(width).fill("."));

		for (const bot of bots) {
			let futureX = (bot.position.x + (bot.velocity.x * frame)) % width;
			let futureY = (bot.position.y + (bot.velocity.y * frame)) % height;

			if (futureX < 0) futureX += width;
			if (futureY < 0) futureY += height;

			level[futureY][futureX] = "#";
		}

			result += `Frame ${frame.toLocaleString()}\n`;
			result += level.map(line => line.join("")).join("\n");
			result += "\n\n";
	}

	return result;
}

await runner(solve);
