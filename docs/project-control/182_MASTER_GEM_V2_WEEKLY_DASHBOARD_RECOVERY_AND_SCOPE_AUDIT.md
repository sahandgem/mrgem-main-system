# Master Gem V2 Weekly Dashboard Recovery and Scope Audit

**Phase:** `CORE-V2-WEEKLY-P00`
**Type:** read-only discovery and documentation
**Starting baseline:** `7250e777efd6d2e9e6f56d1ce289c6c257a24937`
**Recovery branch:** `review/master-gem-v2-weekly-dashboard-recovery-p00`
**Rollback point:** `7250e777efd6d2e9e6f56d1ce289c6c257a24937`

## 1. Executive Summary

The Weekly Dashboard is a Core-owned Workforce capability, not a prototype or external subproject. It is already usable: the main dashboard and the separate weekly schedule route consume persisted Workforce records, expose schedule CRUD and filters, run the real analyzer, and derive capacity, workload, alert, recommendation, employee-summary, decision, readiness, and operational signals.

It is not genuinely half-built. Its main weakness is architectural and product-definition debt: both route entry files still re-export the large `WorkforcePages.tsx`, that file contains an inactive legacy dashboard body beside the active `DashboardPageV2`, and the schedule model represents a repeating day-of-week template rather than a dated/versioned week. Focused browser/component tests for the independent Schedule route are also absent.

P04 did not replace the Weekly Dashboard. It added one bounded mock-only Command Center section beside the existing Workforce KPIs and weekly grid. This creates deliberate coexistence, but also overlap in KPI, alert, attention, and management-summary concepts. The unique weekly schedule, Workforce analyzer, and Workforce-specific operational decisions remain complementary to Command Center module health and trust/freshness summaries.

**Technical recommendation:** Option C. Keep the unique weekly schedule and Workforce-specific weekly analysis. Freeze expansion of duplicated management-summary areas until a separate information-architecture decision assigns generic cross-module summaries to Command Center. Do not auto-retire data or routes, do not resume P56, and do not treat this recommendation as operator approval.

## 2. Why Audit Opened

P05 left Gate V2-C pending while the next real pilot remained undecided. Before Mahak P06 can resume, Project Core needs a truthful account of whether the existing Weekly Dashboard is unfinished work, duplicated cockpit work, or a stable Core capability that should be preserved. This audit answers that question without changing runtime code.

## 3. Repository Evidence

Evidence was inspected in runtime source and control history, including:

- `src/routes/workforceRouteManifest.ts` and `src/routes/workforceRoutes.tsx`;
- `src/pages/workforce/core/WorkforceDashboardPage.tsx` and `SchedulePage.tsx`;
- `src/WorkforcePages.tsx`;
- `src/components/WeeklyGrid.tsx` and `src/styles.css`;
- `src/models/workforce.ts`, `src/hooks/useWorkforceStore.ts`, `src/services/workforceService.ts`, `src/services/analysisSettingsService.ts`;
- `src/analysis/workforceAnalyzer.ts` and related recommendation/simulation/decision modules;
- `src/registry/workforceStorageKeys.ts` and backup/maintenance services;
- `tests/analysis.test.ts`;
- historical phase, hardening, P56, P03/P04, and P05 reports.

`WorkforcePages.tsx` is currently 4,387 lines. The active route dispatcher uses `DashboardPageV2`; an older `DashboardPage` body remains in the file but is not selected by the dispatcher.

## 4. Ownership and Classification

| Question | Finding | Evidence-based classification |
|---|---|---|
| Is Weekly Dashboard Core-owned? | Yes. It is registered in the Core Workforce route manifest and consumes Core Workforce store/service/analyzer data. | `IMPLEMENTED / CORE-OWNED` |
| Is Weekly Schedule separate? | Yes. `/schedule` has its own route identity, CRUD/filter UI, and route component key. | `IMPLEMENTED / CORE SURFACE` |
| Is WeeklyGrid shared? | Yes. The active dashboard and Schedule page both render the same component. The inactive legacy dashboard also references it. | `IMPLEMENTED / SHARED` |
| Is any weekly surface prototype-only? | No. The weekly routes are under `src`; cockpit prototypes remain isolated elsewhere. | `NOT PROTOTYPE` |
| Is it tied to P56? | Only architecturally: route bodies remain in the monolith that P56 could later extract. Product behavior does not depend on P56. | `PARTIAL ARCHITECTURE RELATION` |
| Did P04 replace it? | No. P04 inserted one bounded Command Center section before the existing weekly cockpit grid. | `COMPLEMENTARY WITH OVERLAP` |

## 5. Routes and Surfaces

| Route | Component key | Entry | Actual body | Status |
|---|---|---|---|---|
| `/organization/workforce-dashboard` | `dashboard` | `src/pages/workforce/core/WorkforceDashboardPage.tsx` | `DashboardPageV2` in `WorkforcePages.tsx` | active, Core-owned, adapter entry |
| `/organization/workforce-dashboard/schedule` | `schedule` | `src/pages/workforce/core/SchedulePage.tsx` | `SchedulePage` in `WorkforcePages.tsx` | active, separate Core surface, adapter entry |

Both routes are visible in navigation and lazy-loaded through the route registry. No route is supplied by a prototype or subproject.

## 6. WeeklyGrid Role

`WeeklyGrid` is a presentational, shared RTL grid over seven Persian weekdays and configured working hours. It:

- hides inactive schedule items;
- applies employee, space, task-type, and day filters;
- resolves employee, space, and task references;
- renders task-driven status colors and badges;
- supports multiple blocks in one hour/day cell;
- falls back to explicit deleted-reference labels;
- remains locally horizontally scrollable on narrow viewports.

It does not edit data, select a dated week, model partial-hour geometry, expose loading/error states, or perform drag-and-drop. `isInHour` uses hour components only, so a block is repeated in every covered hourly cell rather than rendered as a duration-positioned timeline.

## 7. Weekly Dashboard Feature Inventory

| Feature | Classification | Evidence / limitation |
|---|---|---|
| Week/day grid | `IMPLEMENTED` | Shared `WeeklyGrid` renders Saturday-Friday and working-hour rows. |
| Weekly KPIs | `IMPLEMENTED` | Control, findings, sales coverage, focus, and conflicts derive from analyzer output. |
| Alerts | `IMPLEMENTED` | Findings are severity-ranked and linked to Analysis. |
| Recommendations | `IMPLEMENTED` | Recommendation engine supplies ranked weekly scenarios and drill-down. |
| Workload/capacity | `IMPLEMENTED` | Analyzer computes workload thresholds and occupancy/capacity snapshots. |
| Employee summaries | `IMPLEMENTED` | Active employees receive role, scheduled hours, alert count, and tone. |
| Status badges/colors | `IMPLEMENTED` | Shared badge/tone system is used throughout. |
| Decision linkage | `IMPLEMENTED / PARTIAL` | Links to recommendation, decision queue, reports, and highlighted schedule item exist; no cross-module Task Core bridge. |
| Operational summaries | `IMPLEMENTED` | Readiness, backup, drift, history, retention, calendar, launch, and notification summaries are present. |
| Command Center module health | `IMPLEMENTED / MOCK-ONLY` | P04 bounded section uses normalized P02 mock aggregation, not Workforce local data. |
| Loading/empty/error | `PARTIAL` | P04 has explicit trust/failure states; the local Workforce dashboard is synchronous and has limited empty-state treatment. |
| Legacy dashboard body | `LEGACY` | Inactive `DashboardPage` duplicates an earlier subset and remains in the monolith. |
| Management KPI/alert concepts | `DUPLICATED / OVERLAPPING` | Weekly dashboard and P04 both surface summary, attention, KPI, and alert concepts from different sources. |

## 8. Weekly Schedule Feature Inventory

| Feature | Classification | Evidence / limitation |
|---|---|---|
| Create schedule item | `IMPLEMENTED` | Uses `workforceService.create`. |
| Edit schedule item | `IMPLEMENTED` | Uses `workforceService.update`. |
| Soft delete/deactivate | `IMPLEMENTED` | Uses `isActive=false`. |
| Employee/space/task/day filters | `IMPLEMENTED` | Applied to `WeeklyGrid`; active reference options only. |
| Input validation | `PARTIAL` | Required references and start-before-end are checked. Cross-item conflicts are analyzed after save, not blocked at write time. |
| Item drill-down | `IMPLEMENTED / PARTIAL` | `?itemId=` highlights a row; there is no dedicated item detail route. |
| Week/date selector | `MISSING` | Model stores only weekday and time, with no week start/date. |
| Dated history/versioning | `MISSING` | No week identity, effective period, published/draft state, or schedule revision. |
| Table/filter consistency | `PARTIAL` | Filters affect the grid; the item list still renders all schedule items. |
| Loading/error/recovery | `PARTIAL` | Synchronous local load with demo fallback; no per-operation failure UI. |
| Drag-and-drop | `MISSING` | Intentionally not implemented in current baseline. |
| Real attendance/actuals | `MISSING / OUT OF SCOPE` | Schedule is planned work only. |

## 9. Data-Source Map

| Consumer | Input | Authority | Derived or authoritative | Real vs mock |
|---|---|---|---|---|
| Weekly Schedule page | `useWorkforceStore` -> `workforceService` | browser localStorage collections | Schedule items and master references are local authority | user-editable local data with demo seed fallback |
| Weekly Dashboard | same Workforce state plus analysis settings and compatibility rules | Workforce local services | source rows authoritative locally; KPI/findings/summaries derived | real local user data, with seed records when empty |
| Workforce analyzer | spaces, employees, tasks, schedule, rules, settings, compatibility | caller-provided Workforce state | fully derived and deterministic | not a mock engine |
| Recommendation/simulation/decision | analyzer input and stored reports/queues | Workforce services | derived scenarios plus locally stored decisions/reports | local runtime data |
| P04 Command Center | `CommandCenterMockDataSource` -> P02 mock adapter/aggregator | synthetic in-memory adapter baseline | normalized module observation and derived view model | explicitly `DEMO / MOCK` |

Workforce Core data and P04 data are intentionally separate. P04 neither reads `komak.workforce.scheduleItems.v1` nor changes Workforce business formulas.

## 10. Storage and Persistence Map

Core weekly inputs:

| Key | Owner | Weekly role | Backup/snapshot/import |
|---|---|---|---|
| `komak.workforce.spaces.v1` | `workforceService` | capacity/location reference | included / included / included |
| `komak.workforce.employees.v1` | `workforceService` | employee reference and capabilities | included / included / included |
| `komak.workforce.taskTypes.v1` | `workforceService` | task semantics and tones | included / included / included |
| `komak.workforce.scheduleItems.v1` | `workforceService` | authoritative local weekly schedule | included / included / included |
| `komak.workforce.rules.v1` | `workforceService` | enabled analyzer rules | included / included / included |
| `komak.workforce.analysisSettings.v1` | `analysisSettingsService` | working hours and risk thresholds | included / included / included |
| `komak.workforce.compatibilityRules.v1` | `compatibilityService` | task/space compatibility | included / included / included |

The storage registry contains 24 known keys; 23 are included in backup. The snapshot container is intentionally excluded from recursive backup. Schedule data is therefore covered by backup, snapshot, import validation, maintenance checks, and reset pre-snapshot behavior.

Constraints:

- localStorage is the current local source of truth; there is no server concurrency or multi-device authority;
- item timestamps exist, but collection-level freshness and source version are not exposed to the weekly UI;
- seed data is merged by fixed demo IDs, so an apparently empty collection may be repopulated with demo records;
- migration compatibility is local-key/version based, not a database schema contract;
- browser-storage loss remains a data-loss risk unless operators use backup/export.

## 11. Test and Browser Evidence

Existing evidence:

- route manifest tests assert unique paths and required Dashboard/Schedule routes;
- analyzer tests cover capacity, companion safety, store coverage, focus, workload, compatibility, risk settings, recommendations, simulation, decisions, backup/restore, maintenance, readiness, drift, and operations;
- storage registry tests verify 24 known keys, 23 backup keys, and snapshot exclusion;
- hardening browser work verified the Dashboard at 320/360/390/430/1280/1440 after CSS containment repair;
- the 30-case route/viewport matrix reported zero page/body overflow, no clipping, valid RTL, no visible mojibake, and a reachable local WeeklyGrid scroller;
- P04 separately verified its bounded section at 1280/390/320.

Missing or weak evidence:

- no focused unit/DOM test for `WeeklyGrid` filtering, deleted references, multi-block cells, or boundary times;
- no repository-owned E2E/browser test runner;
- no direct browser matrix for `/schedule`;
- no automated form CRUD/validation test for Schedule page;
- route entry tests do not require Dashboard/Schedule to be standalone pages;
- existing host duplicate-key console findings and external Unsplash network dependency remain accepted gaps.

## 12. P56 Relationship

Historical control documents define P56 as the next controlled `WorkforcePages.tsx` extraction/refactor after P55A verification. Its intended constraints were: no new feature, no redesign, and no route/storage/model/service/analyzer change. P55A later proved the Operational History extraction clean, then the no-code freeze was restored.

P56 is frozen because Project Core requires a separate `CORE-RESUME-P56`, exact file scope, rollback, test/build evidence, and explicit approval before another extraction. It was not a product-completion phase and no exact Weekly Dashboard product requirement was assigned to it.

Weekly product discovery, scope decisions, and a future bounded feature phase can proceed without P56. Extracting `DashboardPageV2` or `SchedulePage` out of `WorkforcePages.tsx` would be refactor work in the P56 family and must remain separately gated. This audit does not unfreeze it.

## 13. P04 Command Center Relationship

P04 extends and sits beside the Weekly Dashboard. The active dashboard renders Workforce KPI cards, then `<CommandCenterModuleOverview />`, then the existing weekly cockpit/grid and Workforce operational panels.

The boundaries are different:

- Weekly Dashboard owns Workforce business truth, weekly schedule analysis, and Workforce decisions.
- Command Center owns read-only presentation of normalized cross-module observations.
- P04 is mock-only and in-memory; Workforce is localStorage-backed and user-editable.
- P04 explicitly avoids Workforce business formulas, arbitrary drill-down, source write-back, and Task/Decision mutation.

The main risk is not data collision today; it is future information-architecture collision if both surfaces independently expand generic KPI, alert, attention, and decision-summary concepts.

## 14. Overlap and Duplication Matrix

| Concept | Relationship | Future ownership guidance |
|---|---|---|
| KPI summary | `OVERLAPPING` | Workforce-specific weekly KPI stays in Weekly; cross-module KPI belongs in Command Center. |
| Alerts | `OVERLAPPING` | Workforce findings stay in Weekly; normalized module alerts belong in Command Center. |
| Attention list | `DUPLICATED CONCEPT` | Avoid two generic top-attention queues; define one cross-module entry point. |
| Workforce schedule | `COMPLEMENTARY / UNIQUE` | Keep in Weekly; Command Center may link read-only. |
| Weekly operational status | `COMPLEMENTARY WITH OVERLAP` | Keep detailed domain status in Weekly; expose only a compact module observation to Command Center later. |
| Task/decision surfacing | `OVERLAPPING / INCOMPLETE BRIDGE` | Weekly local decision surfaces remain; future Core Task/Decision bridge needs separate approval. |
| Module health | `COMMAND CENTER UNIQUE` | Do not duplicate in Weekly beyond Workforce-local data health. |
| Freshness/trust | `COMMAND CENTER STRONGER` | P04 has explicit trust states; Weekly needs a future local-data freshness contract if required. |
| Recommendations | `WEEKLY UNIQUE TODAY` | Workforce recommendations remain domain-owned; Command Center may summarize approved references only. |
| Drill-down | `COMPLEMENTARY` | Weekly owns schedule/finding detail routes; Command Center uses Core allowlisted references. |

## 15. Product Gaps

1. No actual week/date identity; the schedule is an evergreen weekday template.
2. No draft/published/locked lifecycle or schedule revision model.
3. No exceptions, recurrence, holiday, timezone, or actual-vs-planned semantics.
4. Filters do not constrain the lower item list.
5. Save-time validation does not prevent cross-item overlap/capacity conflicts.
6. No dedicated schedule-item detail; query highlight is the current drill-down.
7. No explicit operator workflow for promoting a recommendation into a reviewed schedule change beyond existing scenario/decision surfaces.

## 16. Architecture Gaps

1. Dashboard and Schedule entry files are raw re-exports from `WorkforcePages.tsx`.
2. `WorkforcePages.tsx` remains a 4,387-line monolith.
3. The inactive legacy `DashboardPage` duplicates a subset of the active V2 dashboard.
4. Route dispatch, page bodies, store wiring, and many operational concerns are coupled in one file.
5. Weekly-derived logic is partly local to the page and partly in analyzer/services.
6. Command Center and Weekly information architecture lacks a final ownership contract.
7. Any extraction remains P56-gated and cannot be bundled into product work silently.

## 17. Data Gaps

1. localStorage is single-browser and has no concurrency, server authority, or multi-device synchronization.
2. No collection-level freshness, provenance, author, publish state, or week version is visible.
3. Demo seeds are valid fallback data but can blur the distinction between empty operational data and demo state.
4. Deleted/deactivated references are tolerated visually but no referential-integrity gate blocks invalid imports or edits at save time.
5. Command Center P04 data is synthetic and cannot yet summarize real Workforce weekly state through the integration backbone.

## 18. Test Gaps

1. No focused `WeeklyGrid` unit/DOM coverage.
2. No direct Schedule CRUD/browser test.
3. No schedule date/version tests because those concepts do not exist.
4. No CI-owned E2E runner or machine-consumable browser artifact.
5. No test preventing the inactive legacy dashboard body from remaining or diverging.
6. Existing duplicate React keys in host recommendation labels remain a console-quality gap.

## 19. UX, Mobile, and RTL Gaps

1. RTL and dark mode are implemented and browser-verified for Dashboard.
2. Page-level mobile overflow was repaired; WeeklyGrid intentionally uses a local horizontal scroller.
3. The seven-day grid still requires horizontal exploration on mobile and has no compact day-focused mode.
4. The active Dashboard is very dense and exposes many action links and operational cards.
5. Schedule has no week/date picker despite being labeled weekly.
6. Schedule filters do not filter the list below the grid.
7. Local Workforce load/save has no visible loading, last-saved, stale, or recovery status.
8. Schedule route lacks dedicated mobile browser evidence.

## 20. Maturity Assessment

| Dimension | Rating | Reason |
|---|---|---|
| Product functionality | `USABLE` | CRUD, filters, analyzer, recommendations, alerts, decisions, and summaries work. |
| Data/persistence | `USABLE` | Local persistence and backup coverage are real, but local-only and undated. |
| UX/responsive | `USABLE` | RTL/dark/mobile containment are proven; density and schedule-specific mobile evidence remain gaps. |
| Test coverage | `PARTIAL` | Broad business/service tests exist; focused component and Schedule E2E tests do not. |
| Architecture/maintainability | `PARTIAL` | Large monolith, adapter entries, and legacy duplication remain. |
| Command Center integration | `EARLY` | Bounded P04 coexistence works, but it is mock-only and ownership overlap is unresolved. |

## 21. Is It Really Half-Finished?

No. It is **usable but architecturally incomplete**. The unique weekly schedule and Workforce analysis are substantial and operationally meaningful. The missing dated-week contract is a real product gap, but the system is not a placeholder. It should not be retired wholesale or described as replaced by P04.

## 22. Option A - Complete as Distinct Core Module

**Survives:** both routes, WeeklyGrid, Workforce KPIs, analysis, alerts, recommendations, decisions, and operational summaries.

**Changes later:** define dated-week/version lifecycle, focused Schedule QA, local freshness UI, and a separate approved extraction plan.

**Risks:** continued competition with Command Center, dashboard density, duplicated management concepts, and temptation to combine product work with P56 refactor.

**Next safe phase:** docs-only Weekly Product Contract and acceptance matrix, followed by a separately approved bounded implementation.

**P56 needed:** no for product contract or narrow capability work; yes only if extracting page bodies is selected separately.

## 23. Option B - Merge or Absorb Duplicated Management Parts into Command Center

**Survives:** Weekly schedule, analyzer, and domain detail routes. Generic management KPI/attention summaries move conceptually to Command Center.

**Changes later:** real Workforce observation adapter, allowlisted drill-down, ownership map, and careful removal of duplicate summaries after verification.

**Risks:** P04 is currently mock-only; premature absorption could weaken a working dashboard, blur source authority, or create a large integration phase.

**Next safe phase:** docs-only ownership and real Workforce observation contract. No deletion or integration until Gate V2-C and a separate implementation gate.

**P56 needed:** not for the contract; possibly later for clean removal/extraction, under a separate resume.

## 24. Option C - Freeze or Retire Duplicated Dashboard Parts, Keep Unique Weekly Schedule Functionality

**Survives:** Schedule route, WeeklyGrid, Workforce analyzer, capacity/workload findings, Workforce-specific alerts, recommendations, and drill-down routes.

**Changes later:** stop expanding generic dashboard summaries; identify legacy/inactive and cross-module duplicate sections; preserve current behavior until a separate retirement plan is approved.

**Risks:** temporary coexistence remains and the current dashboard stays dense; careless retirement could remove useful Workforce context.

**Next safe phase:** docs-only Weekly/Command Center ownership matrix plus a no-delete retirement candidate list and acceptance tests.

**P56 needed:** no for the decision/design phase; only for a separately approved extraction or code cleanup.

## 25. Technical Recommendation

Recommend **Option C**, without auto-approval.

Reasoning:

- the unique schedule and Workforce analyzer are already useful and should remain Core-owned;
- P04 is not mature enough to replace them because it is mock-only;
- generic KPI/attention concepts should not continue growing in two management surfaces;
- freezing duplicate expansion is safer than immediate absorption or wholesale retirement;
- the next step can remain docs-only and does not require P56, Mahak P06, or runtime mutation.

## 26. What Must Happen Before Mahak P06 Resumes

1. Project Core reviews this report.
2. The operator explicitly selects Weekly-Gate A, B, or C.
3. The selected option records ownership boundaries between Weekly Dashboard and Command Center.
4. No Weekly decision may silently authorize P56, a real adapter, or subproject merge.
5. Gate V2-C remains separately pending; a Weekly-Gate choice is not a Mahak pilot approval.
6. Only after both control decisions are explicit may Project Core decide whether Mahak P06 resumes.

## 27. Next Safe Phase per Option

| Option | Next phase | Runtime change? |
|---|---|---|
| A | Weekly Product Contract: dated-week model, lifecycle, acceptance matrix, focused QA plan | No, docs-only first |
| B | Workforce-to-Command-Center Observation and Ownership Contract | No, docs-only first |
| C | Weekly/Command-Center Responsibility Lock and Duplicate Retirement Candidate Audit | No, docs-only first |

## 28. Non-Goals

This phase does not:

- change source, runtime, UI, CSS, routes, tests, package, lock file, storage, model, service, or analyzer;
- resume P56;
- start Mahak P06 or select a real pilot;
- create a real Workforce adapter for Command Center;
- remove the legacy dashboard body or any visible card;
- merge, push, migrate data, or alter backend/database/auth/API.

## 29. WEEKLY-GATE Decision Package

### WEEKLY-GATE - DECIDE WEEKLY DASHBOARD FUTURE

**A. COMPLETE AS DISTINCT CORE MODULE**

**B. MERGE / ABSORB DUPLICATED MANAGEMENT PARTS INTO COMMAND CENTER**

**C. FREEZE / RETIRE DUPLICATED DASHBOARD PARTS, KEEP UNIQUE WEEKLY SCHEDULE FUNCTIONALITY**

**Technical recommendation:** `C`
**Operator selection:** `NONE`
**WEEKLY-GATE:** `PENDING_OPERATOR_DECISION`

No option is auto-selected. P56 remains frozen. Gate V2-C remains pending. Mahak P06 remains paused until Project Core reviews this report and the operator records a Weekly-Gate decision.
