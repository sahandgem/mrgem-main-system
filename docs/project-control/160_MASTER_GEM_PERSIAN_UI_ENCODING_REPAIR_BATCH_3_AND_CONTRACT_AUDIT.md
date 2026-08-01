# Master Gem Persian UI Encoding Repair — Batch 3 and Contract Audit

## 1. Purpose

Close the remaining visible Workforce mojibake without changing machine-readable contracts, persisted values, storage keys, status values, routes, APIs, or serialization.

## 2. Baseline

| Item | Result |
|---|---|
| Branch | `integration/master-gem-core-v1-candidate` |
| Starting commit | `6011ed8c59d9250875c11a56def306c292120f9d` |
| Rollback reference | `6011ed8` |
| Stable main | `b16b1a0`, locked and unchanged |
| Preflight | Clean |
| Baseline test | `npm.cmd test` — PASS |
| Baseline build | `npm.cmd run build` — PASS |
| Batch 1 | 1,288 repairs; test/build PASS |
| Batch 2 | 113 repairs; test/build PASS |

## 3. Reconciled Inventory

The AST rescan produced 39 raw reversible candidates. One healthy Persian literal, `بکاپ`, was a scanner false positive, leaving the confirmed 38 findings below. Of those 38, 37 participate in machine matching, comparisons, or output contracts. Five were visible: R07 and R13-R16. The four trend findings overlap the visible and machine-readable counts, so those counts are not additive.

| ID | File:line | Literal/role | Visible | Producer to consumer | Stored/serialized | Comparison/key/test | Classification | Action |
|---|---|---|---|---|---|---|---|---|
| R01 | `WorkforcePages.tsx:334` | sales alias | NO | space type to tone | NO | `includes` | `MACHINE_VALUE_NOT_VISIBLE` | `PRESERVE_MACHINE_VALUE` |
| R02 | `WorkforcePages.tsx:947` | conflict alias | NO | finding title to count | NO | `includes` | `MACHINE_VALUE_NOT_VISIBLE` | `PRESERVE_MACHINE_VALUE` |
| R03 | `WorkforcePages.tsx:948` | conflict alias | NO | finding title to count | NO | `includes` | `MACHINE_VALUE_NOT_VISIBLE` | `PRESERVE_MACHINE_VALUE` |
| R04 | `WorkforcePages.tsx:949` | separation alias | NO | recommendation to count | NO | `includes` | `MACHINE_VALUE_NOT_VISIBLE` | `PRESERVE_MACHINE_VALUE` |
| R05 | `WorkforcePages.tsx:1269` | sales alias | NO | space text to sales matcher | Input may come from storage | `includes` | `MACHINE_VALUE_NOT_VISIBLE` | `PRESERVE_MACHINE_VALUE` |
| R06 | `WorkforcePages.tsx:1269` | double-pass sales alias | NO | space text to sales matcher | Input may come from storage | `includes` | `MACHINE_VALUE_NOT_VISIBLE` | `PRESERVE_MACHINE_VALUE` |
| R07 | `DataCenterPage.tsx:89` | broken opening guillemet in TemplateHead | YES | restore action to audit description | Future human-readable description only | None | `DISPLAY_ONLY_SAFE` | `REPAIR_LITERAL` |
| R08 | `OperationalHistoryPage.tsx:107` | worsening machine value | NO | trend helper to KPI tone | NO | comparison; tested | `MACHINE_KEY_AND_LABEL_COUPLED` | `PRESERVE_MACHINE_VALUE` |
| R09 | `OperationalHistoryPage.tsx:107` | improving machine value | NO | trend helper to KPI tone | NO | comparison; tested | `MACHINE_KEY_AND_LABEL_COUPLED` | `PRESERVE_MACHINE_VALUE` |
| R10 | `OperationalHistoryPage.tsx:113` | worsening machine value | NO | trend helper to badge tone | NO | comparison; tested | `MACHINE_KEY_AND_LABEL_COUPLED` | `PRESERVE_MACHINE_VALUE` |
| R11 | `OperationalHistoryPage.tsx:113` | improving machine value | NO | trend helper to badge tone | NO | comparison; tested | `MACHINE_KEY_AND_LABEL_COUPLED` | `PRESERVE_MACHINE_VALUE` |
| R12 | `OperationalHistoryPage.tsx:129` | worsening machine value | NO | trend helper to print tone | NO | comparison; tested | `MACHINE_KEY_AND_LABEL_COUPLED` | `PRESERVE_MACHINE_VALUE` |
| R13 | `workforcePageUtils.ts:106` | insufficient-data trend value | YES | helper to Operational History UI | NO | result contract; tested | `MACHINE_KEY_AND_LABEL_COUPLED` | `ADD_PRESENTATION_MAPPING` |
| R14 | `workforcePageUtils.ts:107` | worsening trend value | YES | helper to branch and UI | NO | compared downstream; tested | `MACHINE_KEY_AND_LABEL_COUPLED` | `ADD_PRESENTATION_MAPPING` |
| R15 | `workforcePageUtils.ts:108` | improving trend value | YES | helper to branch and UI | NO | compared downstream; tested | `MACHINE_KEY_AND_LABEL_COUPLED` | `ADD_PRESENTATION_MAPPING` |
| R16 | `workforcePageUtils.ts:109` | stable trend value | YES | helper to UI | NO | result contract; tested | `MACHINE_KEY_AND_LABEL_COUPLED` | `ADD_PRESENTATION_MAPPING` |
| R17 | `compatibilityService.ts:10` | sales alias | NO | task text to rule inference | Derived rules may persist | `includes` | `MACHINE_VALUE_NOT_VISIBLE` | `PRESERVE_MACHINE_VALUE` |
| R18 | `compatibilityService.ts:11` | sales alias | NO | space text to rule inference | Derived rules may persist | `includes` | `MACHINE_VALUE_NOT_VISIBLE` | `PRESERVE_MACHINE_VALUE` |
| R19 | `compatibilityService.ts:12` | dirty-space alias | NO | space text to rule inference | Derived rules may persist | `includes` | `MACHINE_VALUE_NOT_VISIBLE` | `PRESERVE_MACHINE_VALUE` |
| R20 | `compatibilityService.ts:13` | photography alias | NO | task text to rule inference | Derived rules may persist | `includes` | `MACHINE_VALUE_NOT_VISIBLE` | `PRESERVE_MACHINE_VALUE` |
| R21 | `compatibilityService.ts:13` | digital alias | NO | task text to rule inference | Derived rules may persist | `includes` | `MACHINE_VALUE_NOT_VISIBLE` | `PRESERVE_MACHINE_VALUE` |
| R22 | `compatibilityService.ts:24` | high-focus alias | NO | focus text to rule inference | Derived rules may persist | `includes` | `MACHINE_VALUE_NOT_VISIBLE` | `PRESERVE_MACHINE_VALUE` |
| R23 | `compatibilityService.ts:25` | high-distraction alias | NO | distraction text to rule inference | Derived rules may persist | `includes` | `MACHINE_VALUE_NOT_VISIBLE` | `PRESERVE_MACHINE_VALUE` |
| R24 | `preventiveAlertAnalyzer.ts:92` | sales token | NO | report title to risk type | NO | matcher array | `MACHINE_VALUE_NOT_VISIBLE` | `PRESERVE_MACHINE_VALUE` |
| R25 | `preventiveAlertAnalyzer.ts:93` | focus token | NO | report title to risk type | NO | matcher array | `MACHINE_VALUE_NOT_VISIBLE` | `PRESERVE_MACHINE_VALUE` |
| R26 | `preventiveAlertAnalyzer.ts:93` | distraction token | NO | report title to risk type | NO | matcher array | `MACHINE_VALUE_NOT_VISIBLE` | `PRESERVE_MACHINE_VALUE` |
| R27 | `preventiveAlertAnalyzer.ts:94` | capacity token | NO | report title to risk type | NO | matcher array | `MACHINE_VALUE_NOT_VISIBLE` | `PRESERVE_MACHINE_VALUE` |
| R28 | `preventiveAlertAnalyzer.ts:94` | floor token | NO | report title to risk type | NO | matcher array | `MACHINE_VALUE_NOT_VISIBLE` | `PRESERVE_MACHINE_VALUE` |
| R29 | `workforceAnalyzer.ts:43` | high alias | NO | domain text to detector | NO | `includes` | `MACHINE_VALUE_NOT_VISIBLE` | `PRESERVE_MACHINE_VALUE` |
| R30 | `workforceAnalyzer.ts:47` | medium alias | NO | domain text to detector | NO | `includes` | `MACHINE_VALUE_NOT_VISIBLE` | `PRESERVE_MACHINE_VALUE` |
| R31 | `workforceAnalyzer.ts:51` | sales alias | NO | space text to detector | NO | `includes` | `MACHINE_VALUE_NOT_VISIBLE` | `PRESERVE_MACHINE_VALUE` |
| R32 | `workforceAnalyzer.ts:56` | dirty alias | NO | space/task text to detector | NO | `includes` | `MACHINE_VALUE_NOT_VISIBLE` | `PRESERVE_MACHINE_VALUE` |
| R33 | `workforceAnalyzer.ts:61` | clean alias | NO | space/task text to detector | NO | `includes` | `MACHINE_VALUE_NOT_VISIBLE` | `PRESERVE_MACHINE_VALUE` |
| R34 | `workforceRecommendationEngine.ts:56` | low alias | NO | domain text to ranking | NO | matcher array | `MACHINE_VALUE_NOT_VISIBLE` | `PRESERVE_MACHINE_VALUE` |
| R35 | `workforceRecommendationEngine.ts:60` | high alias | NO | domain text to ranking | NO | matcher array | `MACHINE_VALUE_NOT_VISIBLE` | `PRESERVE_MACHINE_VALUE` |
| R36 | `workforceRecommendationEngine.ts:60` | double-pass high alias | NO | domain text to ranking | NO | matcher array | `MACHINE_VALUE_NOT_VISIBLE` | `PRESERVE_MACHINE_VALUE` |
| R37 | `workforceRecommendationEngine.ts:64` | sales alias | NO | space text to ranking | NO | `includes` | `MACHINE_VALUE_NOT_VISIBLE` | `PRESERVE_MACHINE_VALUE` |
| R38 | `workforceRecommendationEngine.ts:64` | double-pass sales alias | NO | space text to ranking | NO | `includes` | `MACHINE_VALUE_NOT_VISIBLE` | `PRESERVE_MACHINE_VALUE` |

## 4. Visible Issue Trace

### Trend values

`historyTrendLabel` is the runtime producer. `OperationalHistoryPage` consumes the result in five tone comparisons and rendered it in management facts, KPI, badge, print badge, and print facts. Repository searches found no localStorage registry, backup/restore, or serialization path for the result. Direct replacement would still break the comparison contract. A single nearby presentation mapping now preserves each legacy machine value and renders these labels:

| Trend | Display label | Direct machine change | Confidence |
|---|---|---|---|
| insufficient data | `داده روند کافی نیست` | NO | high |
| worsening | `رو به بدترشدن` | NO | high |
| improving | `رو به بهبود` | NO | high |
| stable | `پایدار` | NO | high |

The mapping returns an unknown value unchanged as its fallback. Tests assert all four legacy machine outputs exactly.

### Data Center TemplateHead

The broken `Snapshot آ«` fragment was inside a future human-readable restore audit description. It was not an identifier, key, comparison operand, status, or storage key. The one-pass repair is `Snapshot «`; the closing guillemet and the remainder of the Persian sentence were already healthy. Classification is `DISPLAY_ONLY_SAFE`, runtime risk is low, reversibility is proven by the isolated one-character diff, and confidence is high.

## 5. Machine-Readable Contract Audit

| Area | Count | Role | Persisted | Compared | Visible after repair | Action | Risk |
|---|---:|---|---|---|---|---|---|
| `WorkforcePages.tsx` | 6 | Matching aliases | Possible input dependency | YES | NO | Preserve | medium |
| `OperationalHistoryPage.tsx` | 5 | Trend tone comparisons | NO | YES | NO | Preserve | medium |
| `workforcePageUtils.ts` | 4 | Trend output values | NO | Downstream | NO | Preserve plus label mapping | medium |
| `compatibilityService.ts` | 7 | Compatibility inference | Derived output may persist | YES | NO | Preserve | high |
| `preventiveAlertAnalyzer.ts` | 5 | Alert classification | NO | YES | NO | Preserve | medium |
| `workforceAnalyzer.ts` | 5 | Analysis detection | NO | YES | NO | Preserve | high |
| `workforceRecommendationEngine.ts` | 5 | Recommendation detection | NO | YES | NO | Preserve | high |

No machine value, object key, API value, status, enum, storage key, or serialization shape changed.

## 6. Whitelist And Changes

| File | Issue IDs | Change | Machine preserved | Structure | Contract |
|---|---|---|---|---|---|
| `src/pages/workforce/system/DataCenterPage.tsx` | R07 | One display-only character repair | YES | PASS | PASS |
| `src/pages/workforce/workforcePageUtils.ts` | R13-R16 | One presentation mapping and fallback helper | YES | Approved helper-only delta | PASS |
| `src/pages/workforce/operations/OperationalHistoryPage.tsx` | R13-R16 display sites | Render mapped label only | YES | PASS | PASS |
| `tests/analysis.test.ts` | Contract coverage | Assert four old outputs, four labels, and fallback | YES | Test-only | PASS |

Import/export and declaration count changed only for the approved helper. JSX element structure, route strings, localStorage keys, CSS classes, status values, persisted values, API values, and comparison literals matched before/after fingerprints.

## 7. Compatibility

- Storage registry and keys: unchanged.
- Existing persisted data: unchanged.
- Serialization schemas: unchanged.
- Status and enum values: unchanged.
- Trend machine values: unchanged and asserted in the focused test.
- Unknown presentation value: returned unchanged.
- Data Center repair: affects only a future human-readable audit description.

## 8. Rescan

| Metric | Result |
|---|---:|
| Visible issues before | 5 |
| Visible repaired | 5 |
| Visible unresolved | 0 |
| Machine-readable values preserved | 37 |
| Machine-readable display repaired through mapping | 4 |
| Contract uncertain | 0 |
| False positives | 1 (`بکاپ`) |
| Raw mojibake-like literals remaining | 37 machine values plus 1 false positive |
| User-visible mojibake remaining | 0 |

## 9. Test And Build

| Gate | Command | Result |
|---|---|---|
| Focused | `node --loader ./scripts/ts-extension-loader.mjs tests/analysis.test.ts` | PASS |
| Full | `npm.cmd test` | PASS |
| Build | `npm.cmd run build` | PASS |

The only test warning is the pre-existing Node `--experimental-loader` warning. No serious build warning was emitted.

## 10. Preview

Checked routes:

- `/organization/workforce-dashboard`
- `/organization/workforce-dashboard/operational-history`
- `/organization/workforce-dashboard/data-center`
- `/organization/workforce-dashboard/employees`
- `/organization/workforce-dashboard/analysis`
- `/organization/workforce-dashboard/maintenance`
- `/organization/workforce-dashboard/history-retention`

All routes loaded. The DOM scan found zero visible mojibake markers. Operational History rendered healthy Persian trend labels on normal and print surfaces. Data Center source/build contains the corrected TemplateHead; restore was intentionally not executed because it mutates local data. `dir=rtl` and `lang=fa` remained active. Layout and CSS did not change, and no Batch 1/2 regression was observed. The local preview process was stopped after verification.

## 11. Scope Verification

- Source files changed: 3 of maximum 4.
- Test files changed: 1 of maximum 1.
- Route changed: NO.
- CSS/layout changed: NO.
- Storage key changed: NO.
- Existing persisted value changed: NO.
- API value changed: NO.
- Enum/status machine value changed: NO.
- JSX layout changed: NO.
- Prototype changed: NO.
- Subproject changed: NO.
- P56 started: NO.
- Main changed: NO.
- Push performed: NO.

## 12. Encoding Verdict

`ENCODING_GATE_RECOVERED_WITH_MACHINE_CONSTANT_DEBT`

The active Workforce UI is healthy, while 37 legacy machine-readable literals remain intentionally preserved for compatibility.

## 13. Main Merge Readiness

`READY_FOR_FINAL_REVIEW`

This status permits only the separate final review gate. It does not authorize a merge to main.

## 14. Machine Constant Debt Register

| File | Count | Reason preserved | Compatibility dependency | Future migration | Severity |
|---|---:|---|---|---|---|
| `src/WorkforcePages.tsx` | 6 | Matching aliases | KPI/conflict/sales detection | Required, contract-led | medium |
| `src/pages/workforce/operations/OperationalHistoryPage.tsx` | 5 | Comparison operands | Trend tone branching | Required with producer | medium |
| `src/pages/workforce/workforcePageUtils.ts` | 4 | Producer output contract | Existing comparisons/tests | Prefer semantic enum later | medium |
| `src/services/compatibilityService.ts` | 7 | Text inference aliases | Compatibility rules | Requires migration/test plan | high |
| `src/analyzers/preventiveAlertAnalyzer.ts` | 5 | Classification tokens | Preventive risk type | Normalize later | medium |
| `src/analyzers/workforceAnalyzer.ts` | 5 | Detector aliases | Analysis findings | Normalize later | high |
| `src/analyzers/workforceRecommendationEngine.ts` | 5 | Detector aliases | Scenario/ranking logic | Normalize later | high |

## 15. Recommended Next Phase

`CORE-P12 — Integration Candidate Final Review and Main Merge Gate`

Final Review must explicitly accept the debt register or authorize a separate future migration. This phase performs no merge.

## 16. Final Lock

- Main remains unchanged.
- No merge was performed.
- No push was performed.
- P56 remains frozen.
- Subprojects remain isolated.
- Final review and any future merge require separate approval.
