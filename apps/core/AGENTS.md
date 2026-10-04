# Core ownership

Scope: Core shell, Command Center, integration registry, validator, aggregator,
and mock adapters. Shared interfaces are in `@master-gem/module-contracts`.

Never import `apps/workforce` models, services, hooks, styles or components.
Do not read its localStorage or another project's SQLite/files. No actual Mahak connection is enabled; MAHAK-GATE must be explicitly resolved
before its pilot. Phase 6.13 permits only the Friday Market read-only HTTP adapter;
it must not contain credentials or write commands. Keep demo/mock labels visible
for mock modules. A demo health badge is not evidence of a real connected module.

From the checkout root: `npm run test:core`, `npm run build:core`,
`npm run dev:core`. See root AGENTS.md for shared-change and data-safety rules.
