import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { join } from "node:path";

const root = fileURLToPath(new URL("..", import.meta.url));
const suites = {
  core: ["integrationBackbone.test.ts", "commandCenterViewModel.test.ts"],
  workforce: ["analysis.test.ts"],
};
const selected = process.argv[2];
if (selected && !Object.hasOwn(suites, selected)) {
  console.error("Usage: node scripts/run-tests.mjs [core|workforce]");
  process.exit(1);
}

function run(args, cwd) {
  // The fixtures use UTC month boundaries; never inherit the Windows timezone.
  const result = spawnSync(process.execPath, args, {
    cwd, env: { ...process.env, TZ: "UTC" }, stdio: "inherit",
  });
  if (result.error) console.error(result.error.message);
  if (result.status !== 0) process.exit(result.status ?? 1);
}

run(["--test", join(root, "tests/workspaceBoundary.test.mjs")], root);
for (const app of selected ? [selected] : Object.keys(suites)) {
  const cwd = join(root, "apps", app);
  for (const suite of suites[app]) {
    console.log(`Testing ${app}/${suite}`);
    run(["--import", pathToFileURL(join(root, "scripts/register-ts-loader.mjs")).href, join(cwd, "tests", suite)], cwd);
  }
}
