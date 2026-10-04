# Master Gem workspace instructions

Read START-HERE.fa.md, README.md and Report 184 before continuing after a lost session.
Check `git status --short`, current branch and worktree location before editing.

- Communicate with the owner in Persian. Explain the affected project plainly.
- The owner wants relevant available plugins considered, suggested and used when
  useful. Prefer existing connected tools; explain their purpose. This is not
  blanket permission to install software, transmit project data, deploy or push.
- `apps/core` owns the integration backbone and Command Center. `apps/workforce`
  owns all workforce domain code and browser persistence. No cross-app imports.
- `packages/module-contracts` is the only current shared package. Keep it free of
  application dependencies and domain logic. Contract changes need coordinated
  review and both apps' tests/builds; do not silently broaden the contract.
- Phase 6.13 authorizes one bounded read-only HTTP adapter for Friday Market
  observations. It does not authorize direct external database access, browser
  storage bridges, write/command transports, or other real adapters. P06's Mahak
  gate remains pending. Broad P56 monolith cleanup stays frozen.
- Keep real-data recovery separate from source recovery. Do not reset demo,
  import, clear storage, or overwrite a browser profile as a diagnostic shortcut.
- Core worktree branch: `codex/dev-core`. Workforce: `codex/dev-workforce`.
  Worktree folders contain the full repo; edit only the task's designated scope.
  Do not delete/move the original coordination checkout or another worktree.
- Preserve unrelated changes. No merge, push, deployment, history rewrite, or
  automatic contract synchronization without the owner's authorization.
- Run `npm run test:core` / `npm run build:core` for Core changes; the Workforce
  equivalents for Workforce. Root/shared changes require `npm test` and
  `npm run build`. Do not skip existing tests to conceal a failure.
- Use an isolated browser origin/profile for UI tests. Keep development ports
  5174 (Core) and 5173 (Workforce) fixed; never silently pick another port.
- Historical docs retain old `src/` paths. Use Report 184's path mapping. Its
  narrowly authorized environment setup does not approve unrelated old phases.
