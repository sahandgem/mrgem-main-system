# Master Gem V2 Command Center Baseline Implementation

**Phase:** CORE-V2-P04
**Parent:** `9b0a9494a911c56c78e07b55108cb3183ee7666a`
**Branch:** `feature/master-gem-v2-command-center-p04`
**Gate V2-B:** `APPROVED_AS_DESIGNED`
**Verdict:** `COMMAND_CENTER_BASELINE_VERIFIED_WITH_GAPS`

## Scope

P04 implements the smallest approved Command Center consumption slice:

```text
P02 mock adapter and static registry
  -> P02 validation and aggregation
  -> pure Command Center view model
  -> deterministic attention ranking
  -> bounded read-only section
  -> /organization/workforce-dashboard
```

The implementation is mock-only. It does not connect Product, Mahak, Finance, Audit, Production, Mobile, n8n, or any other real subproject.

## Files

Runtime and tests:

- `src/integration/commandCenter/commandCenterViewModel.ts`
- `src/integration/commandCenter/commandCenterMockDataSource.ts`
- `src/components/CommandCenterModuleOverview.tsx`
- `src/WorkforcePages.tsx` (one import and one bounded mount)
- `src/styles.css` (isolated Command Center and responsive rules)
- `tests/commandCenterViewModel.test.ts`
- `tests/analysis.test.ts` (test registration only)

Control documents:

- `docs/project-control/180_MASTER_GEM_V2_COMMAND_CENTER_BASELINE_IMPLEMENTATION.md`
- minimal updates to Current State, Phase Log, Branch Registry, QA Checklist, and Backlog.

No route, package, lock file, storage key, model, Workforce analyzer/service, prototype, subproject, migration, backend, database, auth, or API file changed.

## Data Flow and Ownership

`CommandCenterMockDataSource` owns an in-memory `ModuleObservationAggregator` and adapters created from the static P02 registry. It calls the existing mock adapter only. Aggregated normalized data is passed to `buildCommandCenterViewModel`; the component never receives or inspects a raw adapter payload.

Source modules remain owners of business truth. The Command Center owns presentation derivation only and defines no source business formula.

## View Model

The read-only model includes:

- `CommandCenterModuleSummary`
- `CommandCenterAttentionItem`
- `CommandCenterKpiHighlight`
- `CommandCenterManagementSummary`
- `CommandCenterReliabilitySummary`
- `CommandCenterViewModel`

The model includes a visible `DEMO/MOCK` label and carries generated time, normalized status, health, freshness, reliability, alert counts, highlighted KPI counts, and risk context.

## Deterministic Priority

Priority uses the approved tier plus deterministic rank tuple:

1. blocking invalid/unsupported/registry conditions;
2. urgent unavailable, critical alert, or critical KPI;
3. stale, degraded, no-data, warning alert, or warning KPI;
4. informational unknown state.

Within a tier, ordering is severity, reliability risk, newest detection time, module ID, then attention ID. There is no AI score. Noncritical items have a soft per-module cap of three; the visible list is capped at eight. Critical items are not removed by the per-module cap.

## Trust and Reliability

The implementation explicitly distinguishes:

- fresh and valid;
- valid with warnings / degraded;
- stale last-known-good;
- unavailable, with or without last-known-good;
- invalid payload;
- unsupported contract version;
- no data;
- disabled;
- unknown.

Invalid current values are suppressed. Last-known-good KPI values may remain visible only with a stale label and explanation. Missing data is never rendered as zero. Disabled modules are excluded from enabled and unavailable counts.

The UI uses Persian text badges as well as color, so fresh, stale, unavailable, invalid, and disabled states do not rely on color alone.

## Alert and KPI Promotion

- Open critical alerts become urgent attention.
- Open warning alerts become attention.
- Info and resolved/acknowledged alerts are not promoted to top attention.
- Critical and warning KPIs become highlights and attention items.
- Normal/info/unknown KPIs are not highlighted automatically.
- Stale or retained KPI values are labeled as last-known-good context.
- No source-specific Product, Mahak, Finance, or Workforce business formula is added.

## Refresh

The component performs one page-load read and exposes one icon-labeled manual refresh button. An in-flight guard blocks concurrent refreshes. The last successful view model remains rendered when a later refresh fails, and an explicit error message explains whether retained data is present.

No interval, polling, worker, websocket, event source, background synchronization, fetch, external network dependency, or storage write was added.

## UI Location

The section is mounted once between the existing KPI strip and cockpit grid on `/organization/workforce-dashboard`. The rest of `DashboardPageV2` remains in place. The section contains:

- management summary;
- needs-attention list;
- module health;
- KPI highlights;
- mock/data trust labels;
- last refresh time;
- manual refresh.

It is a bounded adaptation, not a page replacement or broad redesign.

## Task and Decision Boundary

P04 does not surface, create, update, approve, reject, or close Core tasks or decisions. No alert or KPI is converted to a task or decision. Optional Task/Decision read-model fields from Report 179 remain deferred because that runtime boundary is frozen.

## Drill-down Boundary

The view model accepts only references present in a Core-owned allowlist. The P04 mock source supplies no approved drill-down mapping, so the baseline renders no arbitrary links. Adapter data cannot inject a URL and no subproject screen is imported.

## Failure and Empty States

The pure derivation and UI cover:

- zero enabled modules;
- all healthy;
- all unavailable;
- mixed healthy/failed modules;
- invalid payload;
- unsupported version;
- stale-only data;
- degraded/partial data;
- no data;
- disabled module;
- no alerts;
- no KPI highlights;
- no attention;
- initial loading;
- refresh failure with retained last-success view.

Aggregation and derivation remain per-module; one failed module does not blank successful module summaries.

## Tests

`npm.cmd test` passed. The new suite covers 20 required cases:

1. all healthy;
2. degraded;
3. unavailable;
4. stale;
5. invalid;
6. unsupported version;
7. no data;
8. disabled versus unavailable;
9. critical alert promotion;
10. info alert non-promotion;
11. warning/critical KPI promotion;
12. fresh versus stale KPI reliability;
13. multi-module ordering;
14. failure isolation;
15. no attention;
16. no KPI highlights;
17. stable deterministic tie-break;
18. no task/decision/execute surface;
19. unavailable with stale last-known-good KPI;
20. no input mutation, repeated determinism, and invalid-not-healthy.

The existing P02 Integration Backbone suite and full project analysis suite also passed. The known Node `--experimental-loader` warning remains unchanged.

## Build

`npm.cmd run build` passed:

- TypeScript build: PASS
- Vite production build: PASS
- transformed modules: `1758`
- new build warning: none

## Browser and RTL Verification

The route was served locally and verified with Chrome through Playwright. The in-app browser bootstrap encountered a workspace ACL failure, so the bundled Playwright runtime and locally installed Chrome executable were used without downloading a browser or adding a dependency.

| Viewport | Route/status | RTL | Page overflow | Section overflow | Clipping | Mojibake | Manual refresh |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1280 x 900 | PASS / 200 | PASS | none | none | none | none | PASS |
| 390 x 844 | PASS / 200 | PASS | none | none | none | none | PASS |
| 320 x 700 | PASS / 200 | PASS | none | none | none | none | PASS |

Measured document `scrollWidth` equaled `clientWidth` in all three viewports. The Command Center section also had equal scroll/client width and zero clipped visible descendants. Screenshots showed a stable single-column mobile layout with wrapped badges and no overlap.

## Console and Runtime Signals

- runtime crash: none;
- uncaught page exception: none;
- P04 component error: none;
- visible mojibake: none;
- existing React duplicate-key errors remain in the host dashboard for repeated Workforce recommendation labels such as `پوشش فروشگاه خالی است` and `افزودن شیفت فروش`;
- the existing external Unsplash background reference can produce a 404/timeout when unavailable.

The duplicate-key and external-image signals originate in existing dashboard/analyzer/CSS code, not the new Command Center keys or data source. They were not changed because that would exceed the bounded P04 scope. Their presence prevents a gap-free verdict even though the new section itself is clean.

## Scope and Security Verification

- real adapter or real subproject integration: NO;
- Product/Mahak/Finance/Audit source import: NO;
- command execution or source write-back: NO;
- automatic task/decision creation: NO;
- AI or automation: NO;
- interval/background refresh: NO;
- fetch/API/backend/database/auth/migration: NO;
- localStorage/sessionStorage or new key: NO;
- external dependency or package change: NO;
- route change: NO;
- prototype merge: NO;
- P56 work: NO;
- pilot selected: NO.

## Rollback

Rollback point is `9b0a9494a911c56c78e07b55108cb3183ee7666a`. P04 is additive. Reverting the single P04 commit removes the two Command Center integration files, component, tests, bounded mount, isolated CSS, and P04 docs. No data or migration rollback is required.

## Known Gaps

1. The host dashboard still reports pre-existing duplicate React keys.
2. The host CSS still references an external Unsplash image and can emit a network error when offline.
3. Only the P02 synthetic Workforce module is registered; this is intentionally not a real pilot or integration.
4. Task/Decision read-only counts and drill-down mappings remain deferred.
5. The initial loading state is brief with the in-memory mock source, though its explicit UI and containment rules are implemented.

## Final Verdict

`COMMAND_CENTER_BASELINE_VERIFIED_WITH_GAPS`

The bounded Command Center baseline, deterministic derivation, trust semantics, tests, build, manual refresh, RTL, mobile containment, and mock-only security boundary are verified. Gaps are limited to pre-existing host-dashboard console signals and intentionally deferred real integrations.

## Recommended Next Project Core Action

Do not start P05 automatically. Review this P04 evidence with the operator. If accepted, the next step is the V2.3 pilot-selection gate: choose exactly one real subproject or explicitly defer.
