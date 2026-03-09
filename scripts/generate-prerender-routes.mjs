import path from "node:path";
import { buildSeoRoutes, writeJsonFile } from "./seo.routes.mjs";

const routes = await buildSeoRoutes();
const outputFile = path.resolve(process.cwd(), "scripts", "prerender-routes.json");

await writeJsonFile(outputFile, routes);
process.stdout.write(`[seo] Generated ${routes.length} prerender routes -> ${outputFile}\n`);
