import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative, resolve, isAbsolute } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import ts from "typescript";
import coreConfig from "../apps/core/vite.config.mjs";
import workforceConfig from "../apps/workforce/vite.config.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
function sourceFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? sourceFiles(path) : /\.(tsx?|css)$/.test(entry.name) ? [path] : [];
  });
}
function isInside(directory, target) {
  const path = relative(directory, target);
  return path === "" || (!path.startsWith("..") && !isAbsolute(path));
}

for (const app of ["core", "workforce"]) {
  test(`${app} source does not import another app or hidden root implementation`, () => {
    const directory = join(root, "apps", app, "src");
    const allowed = new Set(["react", "react-dom/client", "lucide-react"]);
    if (app === "core") allowed.add("@master-gem/module-contracts");
    for (const file of sourceFiles(directory)) {
      const source = readFileSync(file, "utf8");
      if (file.endsWith(".css")) {
        assert.doesNotMatch(source, /@import\b/, `CSS must remain app-local: ${file}`);
        continue;
      }
      for (const item of ts.preProcessFile(source, true, true).importedFiles) {
        const specifier = item.fileName;
        if (specifier.startsWith(".")) {
          assert.ok(isInside(directory, resolve(dirname(file), specifier)), `${file} crosses its boundary: ${specifier}`);
        } else {
          assert.ok(allowed.has(specifier), `${file} imports an unreviewed dependency: ${specifier}`);
        }
      }
    }
  });
}

test("shared contract remains domain-independent and has no implementation dependencies", () => {
  const directory = join(root, "packages/module-contracts/src");
  const files = sourceFiles(directory);
  assert.ok(files.length > 0);
  for (const file of files) {
    assert.equal(ts.preProcessFile(readFileSync(file, "utf8"), true, true).importedFiles.length, 0, file);
  }
  const pkg = JSON.parse(readFileSync(join(root, "packages/module-contracts/package.json"), "utf8"));
  assert.equal(pkg.exports["."].default, "./src/moduleContract.ts");
});

test("development and preview ports, roots and outputs are separate and fixed", () => {
  const ports = [];
  for (const [app, config] of [["core", coreConfig], ["workforce", workforceConfig]]) {
    assert.equal(resolve(config.root), join(root, "apps", app));
    for (const server of [config.server, config.preview]) {
      assert.equal(server.host, "127.0.0.1");
      assert.equal(server.strictPort, true);
      ports.push(server.port);
    }
    assert.equal(config.build?.outDir ?? "dist", "dist");
  }
  assert.equal(new Set(ports).size, ports.length);
});

test("Core stays mock-only: it cannot access browser business storage or make network requests", () => {
  for (const file of sourceFiles(join(root, "apps/core/src"))) {
    if (file.endsWith(".css")) continue;
    assert.doesNotMatch(readFileSync(file, "utf8"), /\b(localStorage|sessionStorage|indexedDB|fetch|XMLHttpRequest|WebSocket)\b/, file);
  }
});
