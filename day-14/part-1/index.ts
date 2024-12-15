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

const DURATION = 100;

const BIG_HEIGHT = 103;
const BIG_WIDTH = 101;

const SMALL_HEIGHT = 7;
const SMALL_WIDTH = 11;

function solve(input: string, filename: string): number {
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

	const quadrants = [0, 0, 0, 0];

	for (const bot of bots) {
		let futureX = (bot.position.x + (bot.velocity.x * DURATION)) % width;
		let futureY = (bot.position.y + (bot.velocity.y * DURATION)) % height;

		if (futureX < 0) futureX += width;
		if (futureY < 0) futureY += height;

		const quadrantX = futureX / (width - 1);
		const quadrantY = futureY / (height - 1);

		if (quadrantX === 0.5 || quadrantY === 0.5) {
			continue;
		}

		const index = Math.round(quadrantX) + (Math.round(quadrantY) * 2);

		quadrants[index]++;
	}

	return quadrants.reduce((a, b) => a * b);
}

await runner(solve);
