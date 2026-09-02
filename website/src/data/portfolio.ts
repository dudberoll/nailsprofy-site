import { readdirSync } from "node:fs";
import { extname, join } from "node:path";

const portfolioDirectory = join(process.cwd(), "public/images/portfolio");
const imageExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

const getPortfolioNumber = (file: string) => Number.parseInt(file, 10);

const portfolioFiles = readdirSync(portfolioDirectory, { withFileTypes: true })
	.filter(
		(entry) =>
			entry.isFile() && imageExtensions.has(extname(entry.name).toLowerCase()),
	)
	.map((entry) => entry.name)
	.sort((left, right) => {
		const leftNumber = getPortfolioNumber(left);
		const rightNumber = getPortfolioNumber(right);

		if (Number.isNaN(leftNumber) && Number.isNaN(rightNumber)) {
			return left.localeCompare(right);
		}
		if (Number.isNaN(leftNumber)) return 1;
		if (Number.isNaN(rightNumber)) return -1;

		return rightNumber - leftNumber || left.localeCompare(right);
	});

export const portfolioItems = portfolioFiles.map((file) => {
	const number = file.match(/^(\d+)/)?.[1];

	return {
		image: `/images/portfolio/${file}`,
		alt: number
			? `Работа мастеров NailsProfi №${number}`
			: `Работа мастеров NailsProfi — ${file}`,
	};
});
