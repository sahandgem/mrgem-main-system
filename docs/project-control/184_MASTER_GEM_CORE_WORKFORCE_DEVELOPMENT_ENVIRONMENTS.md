# Master Gem — Independent Core / Workforce Development Environments

Phase: `CORE-WF-ENV-P01` · Date: `2026-09-11`

Coordination branch: `codex/core-workforce-development-environments`

Pre-change checkpoint: `4e8f42cab7bbd0f32b0a0b3f9f5d4494c2889133` (P06).

## Authority and scope

After the Windows recovery and P06 review, the owner clarified that "separate"
means independent development environments, not severing product integration.
The owner accepted one repository with independently runnable Core / Workforce
apps, a minimal shared contract, and separate development worktrees, then asked
that relevant available plugins be considered and used. After a usage pause, the
owner explicitly requested continuation.

This authorizes the bounded moves and execution wiring below. It does not
authorize a real Mahak adapter, production data recovery, a database migration,
general P56 extraction, deleting Workforce management features, merging to main,
pushing to GitHub, or changing another project's code/data. P06's MAHAK-GATE
remains pending. Historical phase-specific paths are superseded only by this map.

## Current ownership and path map

| Previous path | Current path | Owner / change |
| --- | --- | --- |
| `src/integration/contracts/moduleContract.ts` | `packages/module-contracts/src/moduleContract.ts` | Shared contract; content unchanged |
| Other `src/integration/**` | `apps/core/src/integration/**` | Core; contract imports changed to workspace package |
| `src/components/CommandCenterModuleOverview.tsx` | `apps/core/src/components/CommandCenterModuleOverview.tsx` | Core; local presentation-only StatusTone import |
| Other `src/**` | `apps/workforce/src/**` | Workforce; domain and storage contents unchanged |
| `tests/integrationBackbone.test.ts` | `apps/core/tests/integrationBackbone.test.ts` | Core suite |
| `tests/commandCenterViewModel.test.ts` | `apps/core/tests/commandCenterViewModel.test.ts` | Core suite |
| `tests/analysis.test.ts` | `apps/workforce/tests/analysis.test.ts` | Workforce suite; independent runner and deterministic test clock |
| `index.html`, `tsconfig.app.json` | `apps/workforce/index.html`, `apps/workforce/tsconfig.json` | Existing Workforce entry and configuration |

Core has a new independent shell, entry page, small stylesheet and a local badge
component. The existing Command Center appears only there. Workforce's shell
subtitle now identifies employee management; its dashboard no longer embeds the
Core Command Center. No other Workforce runtime changes were made.

An npm workspace package `@master-gem/module-contracts` exposes the original
versioned types. It is private and source-based, not a published SDK. Core imports
it by name; Workforce has no dependency on Core. No new external package version
was introduced. The lockfile delta contains workspace metadata/links only.

## Developer environments

| Purpose | Checkout | Branch | Development port | Preview port |
| --- | --- | --- | --- | --- |
| Coordination / checkpoint | `C:\Users\danesh\Documents\komak khalaban` | `codex/core-workforce-development-environments` | Explicit app command | Explicit app command |
| Core development | `C:\Users\danesh\Documents\MasterGem-Dev\Core` | `codex/dev-core` | 5174 | 4174 |
| Workforce development | `C:\Users\danesh\Documents\MasterGem-Dev\Workforce` | `codex/dev-workforce` | 5173 | 4173 |

The two development checkouts are to be created from this reviewed checkpoint,
not from the older local/remote main. Each contains the whole repo but has an
independent working directory, branch, dependency installation and app output.
They share Git history with the coordination checkout; do not remove that checkout.
This is development isolation, not OS/process/tenant security isolation.

Commands from any checkout root:

- `npm run dev:core`, `npm run dev:workforce`
- `npm run test:core`, `npm run test:workforce`, `npm test`
- `npm run build:core`, `npm run build:workforce`, `npm run build`
- `npm run preview:core`, `npm run preview:workforce`
- Windows launchers: `start-core.cmd`, `start-workforce.cmd`

Servers bind to loopback and use strict ports. Builds go to each app's own `dist`.
Legacy dev/preview/serve select Workforce. Root `vite.config.mjs` forwards to
Workforce for backwards compatibility. Separate worktrees must not share a
node_modules junction because npm's workspace links belong to their own checkout.

## Verification evidence

Story: each app can execute independently; Core reads a mock observation through
its validator/aggregator into Command Center, while Workforce retains its own
schedule, analysis and browser-data workflows.

| Check | Result / evidence |
| --- | --- |
| Source preservation | Git blob comparison of 92 original source files: 84 unchanged. The remaining 8 are App, WorkforcePages, CommandCenterModuleOverview and five contract-import consumers; only shell/import wiring changed. Domain services, analyzers, models, route manifest, storage registry, backup code and Workforce CSS are unchanged. |
| Lockfile | Offline install added 3 local workspace links; external versions/integrities unchanged. |
| Boundaries | 5/5 tests passed: app-local imports, contract independence, distinct strict ports/output roots, Core mock-only/no browser storage or network APIs. |
| Integration Backbone | Existing baseline suite passed. |
| Command Center | Existing view-model suite passed. |
| Workforce | Existing analysis/service assertions completed with exit 0, including backup/retention checks. |
| Build | Both independent TypeScript + Vite builds passed. Core: 1679 transformed modules; Workforce: 1751. |
| Core browser | Independent page rendered; mock/safety notices visible; manual refresh advanced the displayed receive time from 06:50 to 06:53; captured warn/error log empty. |
| Workforce browser | Dashboard, direct schedule route (grid/form/items) and direct Data Center route rendered with demo data. No reset, import, restore, or edit was submitted. |
| Real data | Not restored or certified. Browser tests used temporary origins 5273 / 5274; demo content is not recovery evidence. |
| Responsive test | Default desktop viewport inspected. Requested temporary 320px override did not actually change the reported viewport (1265px); override reset. Mobile verification is inconclusive, not marked passed. |

The first development-server attempt inside the Windows sandbox failed in esbuild
with `Cannot read directory ... Access is denied`. Re-running the same commands
with approved file access succeeded; no application security setting was weakened.
The first browser attachment timed out; the subsequently attached tab was read
and verified. The `agent-browser` CLI was absent, so the existing connected
browser plugin was used instead.

### Test determinism / known residual issues

- Before migration, Workforce tests failed at a UTC month boundary on the host's
  America/Los_Angeles timezone. The test runner now supplies `TZ=UTC` to child
  processes only, without changing Windows or browser timezone.
- The final retention service test used the actual date against June 27 fixtures.
  That test now freezes Date to its fixture clock and resets it in `finally`.
  Production retention behavior and assertion expectations are unchanged.
- Node 26.7 prints a `module.register()` deprecation notice and a Workforce
  experimental-localStorage notice. Tests pass; these are not hidden or silenced.
- Workforce dashboard's existing InfoPanel uses `key={item.title}`. Repeated
  alert/suggestion titles cause duplicate-key React console errors. The identical
  code exists at the pre-change checkpoint. It remains a separate UI-hardening
  task, not a claim of clean end-to-end production verification.
- The existing Workforce dashboard heading became very narrow alongside many
  actions at the inspected desktop width. Its stylesheet is unchanged. Record
  this for focused Workforce layout work rather than broad styling changes here.
- Sidebar click-based navigation was inconclusive in the browser session; the
  observed direct URLs rendered. Do not describe all navigation as verified.
- No authentication, external API, database bridge, operational write, complete
  CRUD cycle, production deployment, or real-data restore was tested/introduced.

## Recovery and handoff

Pre-change all-refs Git bundle:
`E:\MasterGem-Recovery\core-workforce-before-4e8f42c\core-all-refs.bundle`

Git bundle verification passed and reported complete history (43 refs).
SHA256: `08663816566BAA87ED30AD0ACE9912CFED4A1EC0A06AF0CC43D8FF7612DEF179`.
E: is another volume; physical disk independence was not established. This backup
does not contain browser localStorage, profiles, dependency caches or external
project data. A final all-refs bundle should be taken after creating the worktrees.

Source rollback should use a separate checkout of the pre-change commit, never
a destructive reset over uncommitted work. An old app version at the same browser
origin can still access current storage: export data before intentional rollback.

The owner-facing guide is `START-HERE.fa.md`; README documents commands and root
/ per-app AGENTS.md documents scope. These files make continuation independent
of chat history. Do not infer authorization to auto-create tasks or modify saved
app-project settings from this filesystem setup.

## Plugins used and future work

- GitHub connector: read-only remote main inspection (`7d39d79` at inspection),
  confirming that the V2 working history was not the remote main. No remote write.
- Plugin Management guidance: prefer useful existing tools; no installation of
  unrelated plugins or unsupported claims that a recommended plugin is connected.
- Vercel React guidance: independent component ownership, no shared domain/UI
  imports, keyboard focus/safety labels, existing lazy Workforce routes preserved.
- Vercel verification guidance + connected browser: inspect actual rendered
  output and logs; disclose inherited warnings and unverified boundaries.

Next Core work: resolve the P06 gate/preparation for the first real read-only
Mahak pilot. Next Workforce work: a separate UI-hardening pass and locating a
verified real-data export/profile before any data restore. Root/contract changes
must be reviewed across both branches, not synchronized by copying folders.
