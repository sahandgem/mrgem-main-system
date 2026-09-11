# Workforce ownership

Scope: employees, spaces, tasks, weekly schedule, analysis/simulation, operational
controls and all existing Workforce backup/history/browser-storage behavior.
Do not move domain logic into Core or import Core internals into this app.

Preserve storage keys, schema versions, backup coverage and route paths unless
the owner explicitly approves a migration. Demo data is not restored real data.
Keep broad WorkforcePages.tsx extraction and removal of older management screens
separate from routine development; no blanket P56 cleanup is approved.

From the checkout root: `npm run test:workforce`, `npm run build:workforce`,
`npm run dev:workforce`. Tests intentionally run in UTC; the final retention test
uses its fixture clock. Do not change production timezone semantics to satisfy tests.
Known inherited UI issues are recorded in Report 184 and are not migration losses.
