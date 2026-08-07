# Master Gem Storage Backup Restore Verification Baseline

Date: 2026-08-05
Phase: CORE-HARDEN-P02
Scope: verification baseline only. No production source, registry policy, storage key, route, UI, package, or dependency was changed.

## 1. Purpose and Scope

This report records the evidence-based baseline for Workforce local storage backup, import, snapshot, and restore behavior. It verifies the existing contract with disposable in-memory storage and documents one architectural limitation without changing runtime behavior.

## 2. Preflight and Branch Boundary

- Source branch and initial commit were verified before work: `hardening/master-gem-v1-mobile-overflow-repair-p02` at `34707d2f81db6c87b9bd35db0d14f9609166e26e`.
- Main remained untouched at `e42b32027cf642a1d1dc369786490a7427d16034`.
- Verification branch: `hardening/master-gem-v1-storage-backup-restore-p02`.
- No fetch, pull, merge, push, package change, source change, or registry change was performed.

## 3. Registry Baseline

- Registry source: `src/registry/workforceStorageKeys.ts`.
- Total unique registered keys: 24.
- Included in backup/import/snapshot payload: 23.
- Excluded: 1, `komak.workforce.snapshots.v1`.
- Exclusion reason: the internal snapshot container is intentionally excluded so a snapshot bundle cannot recursively contain snapshot history.
- Backup service source: `src/services/workforceBackupService.ts`.
- Existing machine contract: app name `komak-workforce-dashboard`, backup version `1.0.0`, coverage version `2026-06-p25-coverage-v1`.

## 4. Storage Registry Inventory

| Key | Owner | Backup | Expected shape / recovery risk |
|---|---|---:|---|
| `komak.workforce.spaces.v1` | workforceService | yes | JSON array; critical master data |
| `komak.workforce.employees.v1` | workforceService | yes | JSON array; critical master data |
| `komak.workforce.taskTypes.v1` | workforceService | yes | JSON array; critical master data |
| `komak.workforce.scheduleItems.v1` | workforceService | yes | JSON array; critical weekly schedule |
| `komak.workforce.rules.v1` | workforceService | yes | JSON array; critical analysis rules |
| `komak.workforce.analysisSettings.v1` | analysisSettingsService | yes | JSON object; critical analyzer thresholds |
| `komak.workforce.compatibilityRules.v1` | compatibilityService | yes | JSON array; critical compatibility rules |
| `komak.workforce.decisionQueue.v1` | WorkforcePages decision queue storage | yes | JSON array; operational queue |
| `komak.workforce.decisionReports.v1` | decisionReportService | yes | JSON array; decision audit/report data |
| `komak.workforce.monthlyGoals.v1` | monthlyGoalService | yes | JSON array; operational goals |
| `komak.workforce.preventiveAlertStates.v1` | preventiveAlertStateService | yes | JSON array; alert state |
| `komak.workforce.snapshots.v1` | workforceBackupService | no | JSON array; protected internal snapshot container |
| `komak.workforce.maintenanceReports.v1` | workforceMaintenanceService | yes | JSON array; maintenance evidence |
| `komak.workforce.launchChecklist.v1` | launchChecklistService | yes | JSON array; launch-control status |
| `komak.workforce.launchSignoffs.v1` | launchSignoffService | yes | JSON array; critical signed baseline |
| `komak.workforce.operationalResignoffs.v1` | operationalResignoffService | yes | JSON array; critical re-signoff audit |
| `komak.workforce.operationalHistory.v1` | operationalHistoryService | yes | JSON array; critical audit history |
| `komak.workforce.historyRetentionPolicy.v1` | historyRetentionService | yes | JSON object; retention policy |
| `komak.workforce.historyArchives.v1` | historyRetentionService | yes | JSON array; archived history |
| `komak.workforce.operationsCalendar.v1` | operationsCalendarService | yes | JSON array; operational controls |
| `komak.workforce.operationsControlSchedulePolicy.v1` | operationsControlSettingsService | yes | JSON object; control cadence |
| `komak.workforce.operationsControlExportOptions.v1` | operationsControlSettingsService | yes | JSON object; export options |
| `komak.workforce.operationalNotificationPreferences.v1` | operationsControlSettingsService | yes | JSON object; notification preferences |
| `komak.workforce.operationalInAppNotifications.v1` | operationalNotificationService | yes | JSON array; generated in-app notices |

## 5. Direct Storage Use Audit

A source scan found 24 distinct `komak.workforce.*` literals under `src`, exactly matching all 24 registered keys. Active unregistered storage key count is 0. The direct uses are either service-owned or the existing decision-queue/page helper ownership declared in the registry. No `localStorage.clear`, `sessionStorage`, `fetch`, `XMLHttpRequest`, or IndexedDB usage was found in the audited source/test scope.

## 6. Backup Construction and Integrity

`createBackupBundle` reads the 23 backup keys, adds coverage metadata, and calculates a deterministic checksum using stable key ordering. The test baseline uses arrays, objects, booleans, null values, nested values, and machine-like constants (`MACHINE_*_V1`). Bundle creation excludes the snapshots key while preserving every included key byte-equivalently through JSON serialization/checksum verification.

## 7. Validation and Version Compatibility

`validateBackupBundle` rejects a non-object payload, missing critical registered keys, and a checksum mismatch. A wrong-shaped data payload is blocked by critical-key coverage validation. Unknown future keys are accepted with warnings and ignored by import. A legacy bundle without coverage metadata is identified as legacy. A version mismatch is intentionally a warning rather than a blocker when the payload otherwise validates; that behavior is recorded as the current compatibility policy.

## 8. Restore and Import Outcomes

The isolated test verifies full restore for all 23 included keys after deliberate mutation. A partial bundle leaves an omitted existing key unchanged. An injected unknown key is not written. Invalid checksum and malformed/wrong-shape input leave data unchanged. Round-trip checksum equality confirms a restored payload can be recreated without content drift.

The excluded snapshots payload is never imported from a bundle. Import and restore intentionally create a pre-operation snapshot, so the internal snapshot container changes only by appending controlled rollback evidence; its prior entries are preserved and no bundle payload overwrites it.

## 9. Snapshot and Rollback Boundary

Before import or snapshot restore, the service captures a pre-operation snapshot. This provides manual recovery evidence. There is no transactional, automatic rollback if an individual storage write fails after earlier writes succeed. This is a documented recovery gap, not a defect corrected in this phase. Future work must define failure injection and a transactional rollback strategy before claiming atomic restore semantics.

## 10. Test Evidence

- Baseline `npm.cmd test`: PASS; only the pre-existing Node `--experimental-loader` warning.
- Added one isolated test block in `tests/analysis.test.ts`.
- Updated test coverage: all registry keys, full restore, partial restore, unknown-key injection, invalid checksum, malformed object, wrong payload shape, legacy baseline, version mismatch, excluded snapshot behavior, and checksum round-trip.
- `npm.cmd test` after the test addition: PASS.
- `npm.cmd run build` is required again after final documentation/scope checks; no source build behavior was changed by this phase.

## 11. Scope and Safety Checks

No new storage keys, migrations, routes, UI changes, components, prototypes, package changes, or production source changes were introduced. Only this report, optional project-control status records, and one allowed test file belong to this phase.

## 12. Conclusion and Verdict

Verdict: `STORAGE_BACKUP_RESTORE_VERIFIED_WITH_DOCUMENTED_GAPS`.

The registry coverage, validation, full/partial restore behavior, unknown-key containment, snapshot exclusion, compatibility warning behavior, and round-trip integrity are verified. The remaining gap is non-transactional rollback during a hypothetical partial storage-write failure. It is documented for a future, separately approved hardening phase.

## 13. Required Follow-up

1. Keep registry changes coupled with coverage, backup, import, and restore tests.
2. Add a failure-injection design and transactional rollback contract only with separate approval.
3. Run a browser-local storage drill before any release process that relies on user-managed backup recovery.
4. Keep the snapshot container excluded from payload import to prevent recursive backup growth.
