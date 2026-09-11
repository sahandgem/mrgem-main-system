# Master Gem — Core & Workforce

برای شروع و انتخاب پوشه درست، **[راهنمای فارسی ادامه کار](START-HERE.fa.md)** را بخوانید.

One repository, two independently runnable applications. Separate development
worktrees do not mean separate Git histories or duplicated ownership of data.

| Workspace | Owns | Develop | Build | Test |
| --- | --- | --- | --- | --- |
| `apps/core` | Command Center, integration registry, validation, aggregation | `npm run dev:core` | `npm run build:core` | `npm run test:core` |
| `apps/workforce` | Employees, schedules, analysis, operational controls, browser data | `npm run dev:workforce` | `npm run build:workforce` | `npm run test:workforce` |
| `packages/module-contracts` | Versioned, domain-independent observation types | — | Checked by Core | Both apps' boundary checks |

## Run locally

Use Node.js 22.18+ with npm. This checkpoint was tested on Windows with Node
26.7.0. From the checkout root, run `npm ci`, then one of the development commands
above. Windows double-click launchers: `start-core.cmd`, `start-workforce.cmd`.

- Core: `http://127.0.0.1:5174/`
- Workforce: `http://127.0.0.1:5173/organization/workforce-dashboard`
- Preview: `npm run preview:core` on 4174; `npm run preview:workforce` on 4173.
- Build output: each application's own `dist/` directory.
- `npm test` runs all suites and boundary checks; `npm run build` builds both.
- Legacy `npm run dev`, `npm run preview`, and `npm run serve` select Workforce.
- Occupied ports fail explicitly; they never silently switch to another origin.

Neither application needs external credentials at this checkpoint. Core is
**MOCK ONLY**, has no production connection, and must not read Workforce storage.
Its fixed demo observation may correctly appear stale relative to today's date.

## Development discipline

Keep Core and Workforce source independent. Use the shared contract package for
approved future integration, not cross-app imports, shared localStorage, copied
business models, or direct access to another project's database. Changing a
shared contract requires explicit review and both apps' tests/builds.

Each worktree contains the entire repository, but day-to-day changes belong in
its designated app. Dependencies must be installed separately in each checkout;
do not share `node_modules` with junctions. Coordinate changes to the root lockfile
and tooling. Branches diverge after new commits; synchronize reviewed changes via
Git, never by replacing folders. Do not merge or push without authorization.

## Data and recovery

Git protects source, not the browser profile or localStorage. Preserve the exact
scheme/host/port and browser profile used for real Workforce data. `localhost`
and `127.0.0.1`, and different ports, are different data origins. Never infer
successful data recovery from seeing the demo. Use the app's Data Center export
before intentional data changes; store that backup outside the browser.

See `docs/project-control/184_MASTER_GEM_CORE_WORKFORCE_DEVELOPMENT_ENVIRONMENTS.md`
for migration evidence, known gaps, and the pre-change recovery point. Historical
reports retain their original `src/` paths; Report 184 supplies the current map.
