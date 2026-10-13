// Keep the original entry point while serving the selected app's dist.
import { preview } from "vite";
import { fileURLToPath } from "node:url";

const app = process.argv[2] ?? "workforce";
if (!["core", "workforce"].includes(app)) {
  console.error("Usage: node scripts/preview-server.mjs [core|workforce]");
  process.exit(1);
}
const server = await preview({
  configFile: fileURLToPath(new URL(`../apps/${app}/vite.config.mjs`, import.meta.url)),
  configLoader: "native",
  ...(process.env.PORT ? { preview: { port: Number(process.env.PORT) } } : {}),
});
server.printUrls();
