# Master Gem V1 Operational Hardening Readiness Plan

## 1. Purpose

This document defines a docs-only operational-hardening plan after the verified local Master Gem Core V1 merge. It audits existing evidence, identifies exact gaps, orders five hardening workstreams and recommends one separately authorized next phase. CORE-P13 implements no test, browser automation, storage change, runtime behavior, migration, feature or release action.

## 2. Canonical Baseline

| Item | Verified state |
|---|---|
| Canonical local `main` | `e42b32027cf642a1d1dc369786490a7427d16034` |
| Runtime merge commit | `23c5e29573615d8dd729494cf22b60ac060df9bd` |
| Post-merge lock commit | `a145606f117a0ae887ab9bc3d1d51d09bd679f6a` |
| CORE-P13 docs branch | `docs/master-gem-v1-operational-hardening-core-p13`, created directly from `a145606` |
| Remote reference | `origin/main` remains `b16b1a020168516b2f8ad3e0bcd41e1193c8a824` |
| Rollback reference | `backup/main-before-master-gem-core-v1-merge-b16b1a0` at `b16b1a0` |
| Test | `npm.cmd test` PASS at merge gate; existing `--experimental-loader` warning |
| Build | `npm.cmd run build` PASS; 1,751 modules |
| Preview | PASS on seven critical routes; RTL/Persian and console checks passed |
| Routes | 28 registered, 28 unique, zero duplicates |
| Storage | 24 registered keys; 23 included in backup; snapshot container intentionally excluded |
| Encoding | zero visible mojibake; 37 machine-readable compatibility constants preserved |
| Remote action | no push, fetch or pull |

Accepted debt remains the `WorkforcePages.tsx` monolith, 37 compatibility constants, localStorage-only persistence, limited broad E2E evidence, the loader warning and paused P56.

## 3. Current Hardening Posture

### Automated Verification

- `package.json` exposes one test command: Node loads `tests/analysis.test.ts` through the local TypeScript extension loader.
- The repository has one test file, approximately 1,800 lines with 339 `assert.*` occurrences.
- Tests cover analyzers, immutable transformations, route-manifest uniqueness, 12 required route-path entries, page extraction contracts, storage registry, backup coverage, bundle validation, import/restore, maintenance detection, launch/signoff, drift and retention behavior.
- Operations-calendar snooze evidence uses a fixed clock through Node mock timers; the prior nondeterministic-time failure was stabilized without production-source change.
- TypeScript and Vite build verification passed at the merge gate with 1,751 transformed modules.
- There is no CI workflow, coverage metric, browser-test dependency or automated direct-route runner.
- Current accepted warning: Node reports the existing `--experimental-loader` warning during tests.

### Runtime Verification

- The route manifest contains 28 unique routes.
- `OperationalHistoryPage` is standalone and does not import `WorkforcePages` or `WorkforceRouteAdapter`.
- Merge preview opened dashboard, Operational History, Employees, Analysis, Data Center, Maintenance and History Retention.
- Those seven routes resolved with `dir=rtl`, `lang=fa`, healthy Persian labels, no visible suspicious encoding markers and no console warning/error.
- Runtime evidence is local and manually orchestrated; there is no repeatable smoke artifact for all critical routes.
- No complete mobile viewport, overflow, keyboard or accessibility evidence exists for the production Workforce route set.

### Storage And Recovery

- The storage registry has 24 unique keys and zero known literals outside the registry.
- 23 keys are included in backup. `komak.workforce.snapshots.v1` is intentionally excluded to prevent snapshots recursively containing snapshots.
- Existing tests prove registry/coverage counts, checksum stability, rejection when a critical key is missing, warning for an unknown future key, auto-snapshot before import, successful import and restoration of prior in-memory values.
- Maintenance tests detect missing keys, malformed JSON, orphan references, duplicate IDs and stale state; safe-fix evidence includes a pre-fix snapshot.
- Existing evidence is service-level and memory-backed. A repeatable browser-localStorage backup/import/restore drill across all included keys is not recorded.
- No storage migration or migration of the 37 machine-readable constants is approved.

### Release Discipline

- Local `main` is canonically locked at `e42b320` with merge report 162 and baseline lock 163.
- The rollback, review and candidate branches are retained.
- Local `main` is 39 commits ahead and zero behind the observed `origin/main` baseline.
- No push occurred, so local Git is the verified source while GitHub remains on the older baseline.
- General QA, merge approval and rollback documents exist, but there is no single V1 pre-release evidence bundle, rehearsed rollback drill or remote-push gate report.

### Security And Boundaries

- The CORE-P12 secret audit found no tracked `.env`, known token/key shape or sensitive binary/database delta.
- CORE-P13 read-only checks found no tracked/workspace `.env` and no source/prototype secret-pattern file.
- There is no automated secret-scanning CI gate; current evidence is manual/read-only.
- Prototype executable scans remain free of storage/API/backend/auth wiring.
- Product/Mahak, Finance/Audit, Production, Mobile and Automation source remains isolated.
- P56, Cockpit runtime, Task/Decision runtime, backend, database, auth, API, storage migration and machine-constant migration remain frozen.

## 4. Evidence Gaps

1. No repeatable browser smoke command opens a defined critical-route set and emits per-route load/console/RTL evidence.
2. Route tests assert manifest uniqueness and 12 required paths, but do not directly open all 28 routes in a browser.
3. The seven-route preview result is documented but not stored as a deterministic machine-readable smoke artifact.
4. No CI workflow automatically runs test, build, route smoke or secret checks.
5. No coverage percentage or module-to-test coverage map exists; 339 assertions alone do not prove broad coverage.
6. No production Workforce mobile viewport matrix proves overflow, readable density and touch behavior across critical routes.
7. No repeatable accessibility/keyboard smoke evidence exists.
8. Backup/import/restore is verified in memory, but not through a disposable browser localStorage fixture containing all 23 included keys.
9. Corruption detection exists, but there is no end-to-end quarantine/recovery drill for malformed persisted data and a downloaded backup file.
10. The intentionally excluded snapshot-container policy is tested structurally, but no release checklist explicitly re-confirms it before release.
11. No executed rollback drill proves operator steps from the current local baseline to `b16b1a0` without data loss; only references and policy are recorded.
12. No consolidated V1 release evidence pack binds commit, tests, build, route smoke, storage drill, secret scan and rollback result.
13. Local and remote truth differ; no approved remote publication plan currently reconciles them.
14. Secret scanning is manual and has no repeatable automated gate.

## 5. Hardening Workstreams

### H1 — Route And Browser Smoke Coverage

| Gate | Definition |
|---|---|
| Objective | Establish a repeatable browser-level baseline for critical routes with load, console, RTL, Persian-label and standalone-page evidence. |
| Exact scope | Define critical route inventory, desktop/mobile viewport matrix, direct URL checks, lazy-load completion, console capture, `dir/lang` assertions and deterministic evidence output. |
| Excluded scope | UI redesign, route creation, product behavior changes, broad E2E workflows, authentication or backend wiring. |
| Evidence required | Route list/version, command and environment, per-route result, console errors, screenshots only where useful, viewport, timestamp and commit hash. |
| Entry criteria | Clean dedicated branch from approved baseline; existing test/build pass; route manifest remains 28/unique. |
| Exit criteria | Approved critical routes pass direct browser smoke at required viewports; failures are reproducible; no source behavior change unless separately authorized. |
| Stop rules | Stop on required source/package/runtime change, route mismatch, real-data need, storage mutation, hidden network dependency or baseline drift. |
| Risk level | P0 critical evidence gap; implementation risk low if smoke-only and isolated. |
| Dependency | First workstream; creates evidence used by H3 and H4. |
| Recommended phase | `CORE-HARDEN-P01 — Critical Route Browser Smoke Baseline` |

### H2 — Storage Backup/Restore Verification

| Gate | Definition |
|---|---|
| Objective | Define and later execute a repeatable, disposable backup/import/restore verification for the 24-key registry and 23-key backup set. |
| Exact scope | Registry count, included/excluded policy, fixture snapshot, checksum, validate-only, import, pre-import snapshot, restore, malformed JSON and missing-critical-key cases. |
| Excluded scope | New storage key, schema migration, backend/database, production data, machine-constant migration or destructive user-data test. |
| Evidence required | Synthetic fixture inventory, before/after values, import decision, snapshot ID, restore equality, excluded-key proof and cleanup proof. |
| Entry criteria | H1 smoke baseline available for Data Center/Maintenance routes; disposable profile/storage fixture approved. |
| Exit criteria | All 23 included keys round-trip; snapshot container remains excluded; corruption/blocking cases behave as specified; test leaves no persistent residue. |
| Stop rules | Stop on real data, destructive production storage, unknown key ownership, missing rollback, checksum mismatch or migration requirement. |
| Risk level | P0 critical due recovery impact; execution risk medium because persistence is mutated in a disposable environment. |
| Dependency | After H1 baseline; before release/rollback drill H3. |
| Recommended phase | `CORE-HARDEN-P02 — Disposable Storage Backup Restore Drill` |

### H3 — Release And Rollback Discipline

| Gate | Definition |
|---|---|
| Objective | Define a single pre-release evidence bundle, rollback drill and remote-push approval boundary. |
| Exact scope | Commit identity, clean tree, test/build/smoke/storage evidence, secret check, branch references, rollback rehearsal plan, remote divergence and approval record. |
| Excluded scope | Push, tag, release publication, force operation, branch deletion or actual rollback of canonical main. |
| Evidence required | Signed checklist, evidence references, dry rollback steps/result, local/remote hashes, approver and explicit publish decision. |
| Entry criteria | H1 and H2 evidence complete; rollback branch still exact; no unresolved P0 issue. |
| Exit criteria | One auditable release pack exists; rollback procedure is rehearsed safely; push remains separately approved or explicitly held. |
| Stop rules | Stop on dirty tree, stale remote knowledge, missing rollback ref, failed evidence gate, unknown commit, or request for unapproved remote mutation. |
| Risk level | P1 high; procedural execution risk low when local/docs-only. |
| Dependency | Depends on H1 and H2; informs any future remote gate. |
| Recommended phase | `CORE-HARDEN-P03 — V1 Release Evidence And Rollback Gate` |

### H4 — Runtime Regression Checklist

| Gate | Definition |
|---|---|
| Objective | Consolidate repeatable runtime acceptance for RTL, visible encoding, critical labels, console health, standalone Operational History and prototype isolation. |
| Exact scope | Checklist and evidence mapping for desktop/mobile smoke, visible Persian labels, zero suspicious markers, TemplateHead/trend labels, lazy routes and isolation scans. |
| Excluded scope | CSS redesign, accessibility overhaul, prototype integration, new runtime action or machine-constant replacement. |
| Evidence required | Completed checklist tied to commit and H1 output, isolated prototype scan, source boundary scan and exception register. |
| Entry criteria | H1 route smoke format established. |
| Exit criteria | Every runtime acceptance item has reproducible PASS/FAIL evidence and owner; no unresolved critical regression. |
| Stop rules | Stop on visible encoding regression, console crash, prototype wiring, route change, storage/API access or need to alter frozen machine values. |
| Risk level | P1 high; low execution risk as an evidence/checklist layer. |
| Dependency | Uses H1; can run alongside H2 after H1 format is stable. |
| Recommended phase | `CORE-HARDEN-P04 — V1 Runtime Regression Evidence Gate` |

### H5 — Technical Debt Register

| Gate | Definition |
|---|---|
| Objective | Keep V1 debt visible, ranked, owned and gated without turning the hardening program into feature/refactor work. |
| Exact scope | WorkforcePages monolith, 37 machine constants, localStorage architecture, limited E2E, loader warning and paused P56. |
| Excluded scope | Debt implementation, extraction, migration, package update, backend adoption or P56 resume. |
| Evidence required | Severity, business impact, owner, dependency, trigger, do-not-touch rule, acceptance date and future phase candidate. |
| Entry criteria | Canonical V1 baseline and report 163 remain valid. |
| Exit criteria | All six debts have explicit status and no debt is silently activated by H1-H4. |
| Stop rules | Stop if planning implies source change, migration, package change, P56, or combines unrelated debts into one execution phase. |
| Risk level | P2 medium; documentation risk low, accidental scope-expansion risk medium. |
| Dependency | Continuous register; review after H1-H4 evidence updates. |
| Recommended phase | `CORE-HARDEN-P05 — V1 Technical Debt Ownership Review` |

## 6. Priority Matrix

| Rank | Workstream | Priority | Production risk addressed | Reversibility | Evidence gap | Dependency order | Effort | Chance of breaking V1 |
|---|---|---|---|---|---|---|---|---|
| 1 | H1 Route and Browser Smoke | P0 critical | undetected route/runtime regression | high | highest immediate | first | low/medium | low if isolated |
| 2 | H2 Storage Backup/Restore | P0 critical | data loss or unusable recovery | medium/high in disposable storage | high | after H1 | medium | medium |
| 3 | H4 Runtime Regression Checklist | P1 high | RTL/encoding/isolation regression | high | high | uses H1 | low | very low |
| 4 | H3 Release and Rollback Discipline | P1 high | unrecoverable or unaudited release | high | high | after H1/H2 | medium | low |
| 5 | H5 Technical Debt Register | P2 medium | silent debt activation | high | moderate | continuous | low | very low |

No P3 item is selected for execution. The five workstreams remain planning outputs until separately authorized.

## 7. Recommended First Hardening Phase

`CORE-HARDEN-P01 — Critical Route Browser Smoke Baseline`

This is selected because route/browser evidence is the first dependency for runtime and release gates, has a large current evidence gap, is highly reversible, and can be kept isolated without changing V1 behavior. CORE-P13 does not start it.

## 8. Main/Remote Policy

- Local `main` at `e42b320` remains the canonical verified V1 baseline.
- `origin/main` remains unchanged at `b16b1a0` based on local refs; no fetch was authorized.
- CORE-P13 performs no push and does not recommend push as an automatic execution step.
- Any push requires a separate Project Core authorization, clean preflight, fresh remote-state decision and completed release gate.

## 9. Frozen Work

- P56 and all Workforce extraction/refactor.
- Cockpit runtime and prototype merge.
- Task/Decision runtime.
- Product/Mahak, Finance/Audit, Production, Mobile and Automation integration.
- Backend, database, auth or API changes.
- localStorage schema/key migration.
- Migration of the 37 machine-readable compatibility constants.
- UI redesign and new feature work.
- Remote push, merge, rebase or cherry-pick.

## 10. Final Verdict

`HARDENING_PLAN_READY_WITH_GAPS`

The plan is actionable and safely ordered, while the evidence gaps in section 4 must be closed by separately authorized hardening phases before claiming broad operational readiness.

## 11. Exact Next Phase

`CORE-HARDEN-P01 — Critical Route Browser Smoke Baseline`

Objective: define and execute an isolated, repeatable browser smoke baseline for approved critical Workforce routes with direct-load, console, RTL, Persian-label and viewport evidence, without changing product behavior.

## 12. Final Lock

- CORE-P13 is docs-only.
- No source, test, prototype or package file changed.
- No test/build rerun was required because the phase implemented no runtime change.
- No push, fetch, pull, merge, rebase or cherry-pick occurred.
- No feature, refactor, migration or hardening implementation started.
- `main` remains unchanged at `e42b320`.
- `CORE-HARDEN-P01` requires separate explicit Project Core authorization.
