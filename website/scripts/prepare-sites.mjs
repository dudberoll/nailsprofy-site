import { cpSync, mkdirSync, readdirSync, renameSync } from "node:fs";
import { join } from "node:path";

const projectRoot = new URL("..", import.meta.url).pathname;
const distRoot = join(projectRoot, "dist");
const clientRoot = join(distRoot, "client");
const serverRoot = join(distRoot, "server");

mkdirSync(clientRoot);

for (const entry of readdirSync(distRoot)) {
	if (entry === "client") continue;
	renameSync(join(distRoot, entry), join(clientRoot, entry));
}

mkdirSync(serverRoot);
cpSync(join(projectRoot, "server", "index.js"), join(serverRoot, "index.js"));
