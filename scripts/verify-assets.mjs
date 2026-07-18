import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, resolve } from "node:path";

const sourceRoot = resolve("website/src");
const publicRoot = resolve("website/public");
const sourceExtensions = new Set([".astro", ".css", ".js", ".json", ".ts", ".tsx"]);
const assetPattern = /["'(](\/(?:images|media|videos)\/[^"'?#)\s}]+)/g;
const references = new Set();

function sourceFiles(directory) {
	return readdirSync(directory).flatMap((name) => {
		const path = join(directory, name);
		return statSync(path).isDirectory() ? sourceFiles(path) : [path];
	});
}

for (const file of sourceFiles(sourceRoot)) {
	if (!sourceExtensions.has(extname(file))) continue;

	for (const match of readFileSync(file, "utf8").matchAll(assetPattern)) {
		references.add(decodeURIComponent(match[1]));
	}
}

const missing = [...references]
	.filter((assetPath) => !existsSync(join(publicRoot, assetPath)))
	.sort();

if (missing.length > 0) {
	console.error("Missing public assets:");
	for (const assetPath of missing) console.error(`- ${assetPath}`);
	process.exit(1);
}

console.log(`Verified ${references.size} public asset references.`);
