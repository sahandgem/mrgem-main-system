// C49 fixture configuration. Fails closed; never replaces Core production build.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const root = fileURLToPath(new URL("../../", import.meta.url));
const input = fileURLToPath(new URL("./index.html", import.meta.url));
const outDirRaw = process.env.C49_DISPOSABLE_OUT_DIR;
const tempBase = fs.realpathSync(os.tmpdir());
const outDir = outDirRaw && path.resolve(outDirRaw);
if (process.env.C49_SYNTHETIC_BUILD_ENABLED !== "true"
    || !outDir || !path.isAbsolute(outDir)
    || path.dirname(outDir) !== tempBase
    || !path.basename(outDir).startsWith("mr-gem-c49-fixture-")) {
  throw new Error("C49_DISPOSABLE_BUILD_ONLY");
}
if (fs.existsSync(outDir)) {
  throw new Error("C49_REFUSING_TO_OVERWRITE_EXISTING_OUTPUT");
}
export default defineConfig({
  root,
  base: "/",
  plugins: [react()],
  define: { "import.meta.env.VITE_C49_SYNTHETIC_ONLY": JSON.stringify("true") },
  build: {
    outDir,
    emptyOutDir: false,
    rollupOptions: { input },
    sourcemap: false,
    minify: true,
  },
});
