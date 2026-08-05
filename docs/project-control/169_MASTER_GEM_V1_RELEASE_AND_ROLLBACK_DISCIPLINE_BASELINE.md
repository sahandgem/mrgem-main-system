# Master Gem V1 Release and Rollback Discipline Baseline

Date: 2026-08-05
Phase: CORE-HARDEN-P03
Scope: docs-only release and rollback discipline baseline. No source, test, prototype, package, storage, route, main, remote, or runtime behavior was changed.

## 1. Purpose

Define the canonical V1 discipline for release readiness, local-main promotion, rollback evidence, failed post-merge handling, remote promotion, storage-restore escalation, and evidence retention. This document is a governance contract, not a release action.

## 2. Canonical Repository State

- Starting branch/HEAD: `hardening/master-gem-v1-storage-backup-restore-p02` at `a8cabfc3d2cf4164db17e3891b0bf3fbb723c471`.
- Current P03 docs branch: `docs/master-gem-v1-release-rollback-discipline-p03`.
- Local main: `e42b32027cf642a1d1dc369786490a7427d16034`.
- Origin/main: `b16b1a020168516b2f8ad3e0bcd41e1193c8a824`.
- Ahead/behind (`origin/main...main`): local main is 39 ahead and 0 behind.
- Verified merge commit: `23c5e29573615d8dd729494cf22b60ac060df9bd`, parents `b16b1a0` and `276d526`.
- Verified rollback branch: `backup/main-before-master-gem-core-v1-merge-b16b1a0` at `b16b1a0`.
- Verified review branch: `review/master-gem-core-v1-final-gate` at `276d526`.
- Verified candidate branch: `integration/master-gem-core-v1-candidate` at `d977037`.
- Remote branches observed: `origin/main` and the isolated prototype branch only. No remote promotion for the local V1 merge/hardening sequence was found.

## 3. Release State Model

| State | Entry criteria | Permitted actions | Forbidden actions | Required evidence | Exit criteria / owner | Rollback reference |
|---|---|---|---|---|---|---|
| `WORK_IN_PROGRESS` | approved scoped work exists | scoped implementation and verification | promotion/push | plan and clean ownership | candidate assembled by work owner | baseline branch/commit |
| `CANDIDATE` | scope complete and tests available | review, audit, candidate checks | main merge/push without approval | exact candidate SHA and diff | Project Core sends to final review | candidate base |
| `FINAL_REVIEWED` | review gates pass or accepted debt is explicit | merge authorization decision | unapproved source fixes in gate | review report and verdict | Project Core authorizes local merge | pre-merge main SHA |
| `LOCALLY_MERGED` | explicit merge authorization and merge commit exist | local verification only | push, automatic rollback | merge SHA and parents | verification begins | pre-merge recovery branch |
| `LOCALLY_VERIFIED` | local test/build/required smoke evidence pass | prepare remote-promotion decision | automatic push/tag | verification record and debt list | independent push authorization | pre-merge branch plus merge SHA |
| `READY_FOR_REMOTE_PROMOTION` | explicit authorization and current evidence are complete | one reviewed push action | force-push, implicit promotion | authorization, ahead/behind, release report | operator performs approved push | remote and local SHA recorded |
| `REMOTE_PROMOTED` | approved push confirmed remotely | release communication and monitoring | force-push without emergency approval | remote SHA and promotion evidence | release closed or recovery opened | revert plan/reference |
| `RELEASE_BLOCKED` | required evidence fails or scope/security uncertainty exists | triage and isolated remediation planning | merge/push/release claims | failure report | blocking finding resolved/accepted | last verified state |
| `ROLLBACK_REQUIRED` | post-merge/promotion failure requires recovery | approved recovery procedure | blind retry/automatic rollback | impact and approval record | rollback verified | affected merge/revert references |
| `ROLLBACK_VERIFIED` | approved recovery verified | recovery reporting | normal promotion without new gate | before/after state and tests | Project Core chooses next candidate | recovery SHA |

## 4. Current V1 Release Classification

Current classification: `LOCALLY_VERIFIED`.

Git proves that the reviewed V1 branch was locally merged in `23c5e295`, then recorded on local main by `e42b320`. The required local verification evidence is retained by the preceding hardening phases. This phase did not re-promote or re-test runtime work. The state is not `READY_FOR_REMOTE_PROMOTION` because no explicit Project Core push authorization exists, and it is not `REMOTE_PROMOTED` because `origin/main` remains at `b16b1a0`.

## 5. Pre-Release Checklist

### Repository
- [ ] Working tree is clean.
- [ ] Expected branch, HEAD, and ancestry are verified.
- [ ] Unknown commits since the reviewed candidate are audited.
- [ ] A rollback branch/reference exists and resolves exactly.
- [ ] No secret finding is recorded by an approved scan.

### Quality
- [ ] Full test PASS.
- [ ] Build PASS.
- [ ] Browser smoke PASS.
- [ ] Critical mobile viewport PASS.
- [ ] Visible mojibake count is 0.
- [ ] Route count is 28.
- [ ] Storage registry count is 24.
- [ ] Backup/restore baseline PASS or an accepted documented gap exists.

### Boundaries
- [ ] Prototypes remain isolated.
- [ ] Subprojects remain isolated.
- [ ] P56 is frozen unless separately approved.
- [ ] Package and lock state are expected.
- [ ] No source change exists outside the approved scope.

### Release records
- [ ] Current State and phase report are current.
- [ ] Accepted debt is listed.
- [ ] Exact rollback reference is recorded.
- [ ] Remote-push authorization is recorded before any push.

## 6. Local Merge Discipline

A local merge requires separate explicit Project Core authorization. Prefer the method justified by reviewed ancestry; preserve a merge commit when it communicates the reviewed branch identity. The canonical example is pre-merge main `b16b1a0`, review `276d526`, merge `23c5e295`, and docs/report main `e42b320`.

After a merge, run only verification: test, build, required browser/viewport checks, and scope audit. Source or test fixes are forbidden inside the merge phase; a failed check becomes a separate stabilization decision. No automatic rollback and no push are allowed until local verification is complete.

## 7. Post-Merge Verification

Verify the merge SHA and parents, local main HEAD, clean tree, test/build evidence, required browser/route matrix, mobile evidence, storage compatibility baseline, route count, registry count, accepted debt, and rollback reference. A failed test/build/preview stops promotion, preserves the evidence, and moves the decision to Project Core; it does not authorize an in-place merge-phase fix.

## 8. Rollback Runbook

### A. Pre-merge abort

Trigger: conflict or blocked review before a merge completes. Permitted conceptual action: abort the merge so main remains unchanged. Forbidden: partial manual conflict edits outside approved scope, push, or release claims. Retain conflict context and verify main SHA/clean tree. Project Core approval is required for any retry.

### B. Post-merge local failure before push

Trigger: local test, build, smoke, or scope gate fails after merge and before remote promotion. Stop, preserve the merge commit/evidence, and do not fix source inside the merge phase. Project Core chooses one approved recovery route: revert the merge commit; use an isolated recovery branch/reset only with explicit approval; or create a targeted stabilization branch. Verify the selected recovery SHA, clean tree, and applicable gates. Automatic rollback is forbidden.

### C. Failure after remote promotion

Trigger: promoted release causes a verified issue. Do not force-push by default. Prefer an approved revert commit/merge, communicate impact, verify local and remote main, and create a recovery report. Any exceptional history rewrite requires separate explicit Project Core authorization.

### D. Storage restore failure

Trigger: import/restore detects validation failure or a write-stage failure. Preserve the pre-import snapshot, stop further writes, do not retry blindly, collect bundle/validation/error evidence without storing private raw data, and do not claim transactional rollback. Escalate to the future approved failure-injection/rollback-contract track. Approval is required before recovery operations beyond the documented manual snapshot route.

## 9. Remote Promotion Gate

A future push requires independent, explicit Project Core authorization; expected local main HEAD; current ahead/behind check; no unexpected remote update; clean tree; current test/build/critical-browser verification; current rollback plan; no secret finding; and a finalized release report.

Forbidden: automatic push after local merge, force-push, pulling/merging remote changes without a new review, or tag creation without separate authorization. Current remote state remains `origin/main = b16b1a0`; no push authorization exists.

## 10. Evidence Retention

Retain phase reports, test/build summaries, route/browser matrix, backup/restore result, merge SHA and parents, rollback branch, local-main and origin-main SHA, accepted debt, and relevant failure screenshot/log summaries. Do not retain secrets, live user data, raw private backup contents, or temporary browser profiles.

## 11. Storage Restore Failure Gap

Current behavior captures a pre-operation snapshot before import/restore and has otherwise verified registry/backup/restore behavior. It does not provide automatic transactional rollback for a mid-write failure.

- Operational severity: medium.
- Failure likelihood: low but non-zero for browser storage/write interruption conditions.
- Current release blocker: NO, because validation containment, manual pre-operation snapshot, and explicit recovery discipline exist; it must remain visible as accepted debt.
- Current recovery: stop writes, preserve snapshot/evidence, obtain approval for manual recovery.
- Future contract: `CORE-HARDEN-STORAGE-P03 - Failure Injection and Transactional Rollback Contract`.
- Implementation status: not approved; the future phase must begin with docs/test design.

## 12. Accepted Debt

| Debt | Severity | Release blocker? | Future track |
|---|---|---:|---|
| WorkforcePages monolith | medium | no | approved small-scope extraction only |
| 37 machine-readable constants | medium | no | separate compatibility contract/migration approval |
| localStorage architecture | medium | no | data-platform decision gate |
| limited E2E coverage | medium | no | runtime regression evidence gate |
| Node experimental loader warning | low | no | test tooling modernization |
| duplicate React key warnings | medium | conditional | warning triage before remote promotion if reproduced |
| Unsplash external dependency | low | no | asset/dependency review |
| no transactional restore rollback | medium | no | `CORE-HARDEN-STORAGE-P03` docs/test-design first |
| P56 frozen | governance | no | separate `CORE-RESUME-P56` approval only |

## 13. Gate Matrix

| Gate | Status | Evidence / condition |
|---|---|---|
| Git canonical refs | PASS | main, origin/main, merge, review, candidate, and rollback refs resolved |
| Local merge evidence | PASS | `23c5e295` merge and `e42b320` report commit verified |
| Remote promotion | CONDITIONAL | remote is intentionally unchanged; separate authorization absent |
| Test/build evidence | PASS | latest P02 baseline recorded PASS |
| Browser/mobile evidence | CONDITIONAL | prior hardening evidence exists; refresh before any remote promotion |
| Route/storage baseline | PASS | contract records 28 routes and 24 storage keys; P02 registry baseline verified |
| Backup/restore rollback atomicity | CONDITIONAL | behavior verified; transactional rollback gap accepted and documented |
| Secret scan | NOT_EVALUATED | must be an explicit pre-promotion check |
| Scope boundary | PASS | P03 is docs-only |

## 14. Verdict

`RELEASE_ROLLBACK_BASELINE_READY_WITH_GAPS`

The local V1 release discipline, rollback references, remote promotion gate, and storage escalation boundary are defined. Remote promotion remains prohibited until its independent gate is satisfied.

## 15. Exact Next Phase

`CORE-HARDEN-P04 - Runtime Regression and Warning Triage Baseline`

Do not start transactional rollback implementation automatically; it is a separately approved future contract track.

## 16. Final Lock

This phase is docs-only. Main and origin remain unchanged. No push, rollback, feature work, or runtime implementation occurred. Any merge, promotion, recovery, or implementation requires separate approval.
