# Master Gem V1 Technical Debt and Hardening Closure Baseline

## 1. Purpose

This is the canonical documentation-only debt register and hardening-closure decision for Master Gem V1. It consolidates verified H1-H4 evidence without changing prior verdicts or implementing a debt fix.

## 2. Canonical Repository State

| Item | Value |
|---|---|
| P05 starting branch / commit | `hardening/master-gem-v1-runtime-regression-warning-triage-p04` / `c7180b6c25687d8cb2a894be410a98da795139fb` |
| P05 working branch | `docs/master-gem-v1-hardening-closure-p05` |
| Local main | `e42b32027cf642a1d1dc369786490a7427d16034` |
| Observed origin/main | `b16b1a020168516b2f8ad3e0bcd41e1193c8a824` |
| Remote divergence | local `main` is 39 commits ahead and 0 behind `origin/main`; observed only, not a promotion decision |
| Mutation boundary | docs/project-control only; no main change, merge, fetch, pull, push, or source change |

## 3. Hardening Evidence Reviewed

| Gate | Evidence | Result retained |
|---|---|---|
| H1 | 165 browser smoke; 166 audit; 167 repair | Critical routes and repaired mobile containment passed; no page-level overflow remains. |
| H2 | 168 storage backup/restore verification | Registered localStorage backup and restore verification passed; transactional mid-write recovery remains bounded debt. |
| H3 | 169 release and rollback discipline | Local V1 is verified with a rollback reference; remote promotion remains separately unauthorized. |
| H4 | 170 runtime regression and warning triage | Test/build passed; 31 Chrome/CDP records passed; no unknown runtime signal. |

The retained P04 runtime classification is `RUNTIME_BASELINE_VERIFIED_WITH_ACCEPTED_WARNINGS`. It found no crash, uncaught exception, unhandled rejection, visible mojibake, clipping, or horizontal overflow. The warning set is stable and classified.

## 4. Canonical Technical Debt Register

| ID | Title | Category | Evidence / affected area | Severity | Release impact | Status | User-visible / data integrity / runtime stability | Reopen trigger | Future phase | Bundle? | Owner | Why not fixed now |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| D1 | `WorkforcePages.tsx` monolith | ARCHITECTURE_DEBT | 164; `src/WorkforcePages.tsx` | MEDIUM | POST_V1_HARDENING | ACCEPTED | No / No / Indirect maintenance risk | Any approved page extraction or regression traced to shared page shell | Workforce monolith decomposition | NO | WF architecture | V1 hardening was evidence-only; broad refactor is out of scope. |
| D2 | 37 preserved machine-readable constants | MAINTAINABILITY_DEBT | P12/P13 encoding and machine-contract evidence; seven files | MEDIUM | FUTURE_ARCHITECTURE_TRACK | DEFERRED | No / Compatibility risk if changed / No | Contract audit authorizes a value migration | Machine-constant migration contract | NO | WF compatibility | Values were intentionally preserved to avoid serialization and storage drift. |
| D3 | localStorage-only architecture with 24 registered keys | STORAGE_DEBT | 168; registry and workforce storage services | MEDIUM | FUTURE_ARCHITECTURE_TRACK | ACCEPTED | Possible / Local-device recovery limitation / No | Approved persistence or sync architecture decision | Storage architecture evolution | NO | CORE/DATA | V1 local-first boundary remains intentional; no migration was approved. |
| D4 | No automatic transactional rollback on mid-write restore failure | STORAGE_DEBT | 168 storage restore baseline | MEDIUM | POST_V1_HARDENING | ACCEPTED | No / Yes for interrupted restore / No | Failure-injection evidence finds non-recoverable state | `CORE-HARDEN-STORAGE-P03` | NO | CORE/DATA | The verified baseline covers supported restore flow, not a new transaction system. |
| D5 | Limited formal E2E/browser automation | TESTING_DEBT | 164 and 165-170; recorder/CDP evidence | MEDIUM | POST_V1_HARDENING | OPEN | No / No / Detection coverage risk | A critical route expands or manual/CDP evidence becomes insufficient | Formal browser automation tooling | NO | CORE QA | Existing evidence is valid, but the repository has no approved automation framework. |
| D6 | Node `--experimental-loader` test warning | RUNTIME_WARNING_DEBT | 164, 165, 167, 170; `npm.cmd test` | LOW | POST_V1_HARDENING | ACCEPTED | No / No / Test-tooling noise only | Warning becomes an error or Node tooling upgrade is approved | Test-loader modernization | YES with tooling work | CORE tooling | Deterministic development-only warning; tests pass. |
| D7 | Historical React duplicate title-key collisions | RUNTIME_WARNING_DEBT | 170 RT-01/RT-02; `InfoPanel.tsx`, urgent alerts and smart suggestions | MEDIUM | POST_V1_HARDENING | ACCEPTED | Possible list rendering ambiguity / No / Low | Reproduced in fresh capture or list behavior regresses | `CORE-HARDEN-WARN-P01` | NO | WF UI | Not reproduced in fresh P04 capture; source change needs separate approval. |
| D8 | Unsplash decorative image dependency | EXTERNAL_DEPENDENCY_DEBT | 170 RT-03; `src/styles.css` decorative background | LOW | ACCEPTED_FOR_V1 | ACCEPTED | Decorative image can fail / No / No application failure | Asset becomes functional, affects readability, or policy forbids external image | External image dependency cleanup | YES with asset work | UI | Eight observed external failures did not affect route behavior or core UI. |
| D9 | `/favicon.ico` 404 | RUNTIME_WARNING_DEBT | 170 RT-04 | LOW | ACCEPTED_FOR_V1 | ACCEPTED | Browser chrome only / No / No | Favicon becomes required release asset or repeated noise obscures signals | Asset hygiene pass | YES with asset work | UI | One fresh-profile benign browser request; no app impact. |
| D10 | P56 remains frozen | FROZEN_SCOPE_DEBT | 164 and control docs | MEDIUM | FUTURE_ARCHITECTURE_TRACK | FROZEN | No / No / No | Separate Project Core approval for P56 | `CORE-RESUME-P56` only | NO | Project Core / WF | No leakage from hardening into paused extraction scope. |
| D11 | Cockpit runtime remains frozen | FROZEN_SCOPE_DEBT | Control/prototype records | MEDIUM | FUTURE_ARCHITECTURE_TRACK | FROZEN | No / No / No | Independent implementation approval | Cockpit runtime approval track | NO | Project Core / UI | Isolated prototypes do not authorize main runtime work. |
| D12 | Task/Decision runtime remains frozen | FROZEN_SCOPE_DEBT | Core contracts and current-state boundary | MEDIUM | FUTURE_ARCHITECTURE_TRACK | FROZEN | No / No / No | Independent implementation approval | Task/Decision execution track | NO | Project Core | Contract documentation is not implementation authority. |
| D13 | Product/Mahak, Finance/Audit, Production Center, Mobile Companion and Automation/n8n remain isolated | FROZEN_SCOPE_DEBT | Source-integration and subproject control records | MEDIUM | FUTURE_ARCHITECTURE_TRACK | FROZEN | No / Import/integration risk if merged directly / No | Approved connector, migration and review plan | Subproject integration planning | NO | Project Core | Direct merge is forbidden; only contracts and staged adapters may be considered later. |
| D14 | Backend/database/auth/API/storage migration is not approved | FROZEN_SCOPE_DEBT | Current-state and core freeze boundaries | HIGH | FUTURE_ARCHITECTURE_TRACK | FROZEN | No / High if bypassed / High if bypassed | Explicit architecture, security and migration approval | Future core architecture track | NO | Project Core | V1 is local-first and must not gain unreviewed persistence or auth. |
| D15 | Remote promotion has not been performed | RELEASE_PROCESS_DEBT | 169 and canonical local/remote refs | MEDIUM | FIX_BEFORE_REMOTE_PROMOTION | OPEN | No / Promotion/recovery risk / No | Any request to push, tag, publish, or promote remote main | `CORE-HARDEN-P06` then remote gate | NO | Project Core / release owner | P05 has no push authority; local verification is not remote release completion. |

## 5. Debt by Category

| Category | Debt IDs |
|---|---|
| ARCHITECTURE_DEBT | D1 |
| STORAGE_DEBT | D3, D4 |
| TESTING_DEBT | D5 |
| RUNTIME_WARNING_DEBT | D6, D7, D9 |
| EXTERNAL_DEPENDENCY_DEBT | D8 |
| MAINTAINABILITY_DEBT | D2 |
| RELEASE_PROCESS_DEBT | D15 |
| FROZEN_SCOPE_DEBT | D10, D11, D12, D13, D14 |

## 6. Release Impact Summary

| Impact | Count | Debt IDs |
|---|---:|---|
| ACCEPTED_FOR_V1 | 2 | D8, D9 |
| POST_V1_HARDENING | 5 | D1, D4, D5, D6, D7 |
| FUTURE_ARCHITECTURE_TRACK | 7 | D2, D3, D10, D11, D12, D13, D14 |
| FIX_BEFORE_REMOTE_PROMOTION | 1 | D15 |
| BLOCKS_RELEASE | 0 | None |

Severity counts: LOW 3 (D6, D8, D9); MEDIUM 11 (D1-D5, D7, D10-D13, D15); HIGH 1 (D14); CRITICAL 0. D14 is a frozen governance boundary, not an active release blocker.

## 7. H1-H5 Closure Matrix

| Hardening gate | Status | Basis |
|---|---|---|
| H1 Route and Browser Smoke Coverage | PASS_WITH_ACCEPTED_DEBT | Critical-route smoke and mobile re-runs pass; tooling breadth is D5. |
| H2 Storage Backup/Restore Verification | PASS_WITH_ACCEPTED_DEBT | Backup/restore baseline passes; D4 is explicitly retained. |
| H3 Release and Rollback Discipline | PASS_WITH_ACCEPTED_DEBT | Local verification and rollback reference exist; D15 applies before remote promotion. |
| H4 Runtime Regression Checklist | PASS_WITH_ACCEPTED_DEBT | P04 passed with known accepted/post-V1 warning debt. |
| H5 Technical Debt Register | PASS | This report owns and bounds D1-D15. |

## 8. V1 Hardening Closure Criteria

All H1-H5 are PASS or PASS_WITH_ACCEPTED_DEBT. There is no CRITICAL open debt, no `BLOCKS_RELEASE` debt, no unknown runtime signal, and P04 test/build evidence remains valid. Main/origin references are documented, no push occurred, deferred tracks are bounded, and no P56 or subproject work leaked into this phase.

## 9. Frozen Scope

P56, Cockpit runtime, Task/Decision runtime, subproject integration, backend, database, auth, API work, storage migration, machine-constant migration, route/UI/CSS changes and debt remediation remain frozen. This phase does not authorize any of them.

## 10. Remote Promotion Status

Remote promotion is not authorized and has not occurred. Hardening evidence exists on hardening/docs branches only; it is not automatically integrated into local `main`. Any future remote promotion must first satisfy D15 and an explicitly approved release gate.

## 11. Hardening Closure Verdict

`HARDENING_CLOSURE_READY_WITH_ACCEPTED_DEBT`

The local V1 hardening evidence is sufficient to close the current hardening documentation track. This is not a claim that a remote release is complete.

## 12. Recommended Next Phase

`CORE-HARDEN-P06 - V1 Hardening Integration Readiness Review`

P06 must audit ancestry of hardening commits, determine the exact local-main integration chain, detect divergence, and prepare one reviewed local integration plan. P06 must not merge or push.

## 13. Deferred Tracks

- Transactional rollback contract and failure injection.
- React duplicate-key cleanup.
- Formal browser automation tooling.
- External image dependency cleanup.
- Workforce monolith decomposition.
- Storage architecture evolution.

## 14. Final Lock

P05 is documentation and decision only. No source, test, prototype, package, route, storage key, migration, main, remote, or runtime behavior changed. Debt fixes require separate approved phases.
