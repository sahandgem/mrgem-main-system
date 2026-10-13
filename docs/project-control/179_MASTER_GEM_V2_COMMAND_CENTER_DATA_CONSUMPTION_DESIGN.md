# Master Gem V2 Command Center Data Consumption Design

**Phase:** CORE-V2-P03
**Type:** Design and documentation only
**Parent baseline:** `7ec283150e9e78696ef2b736d8be6ccebb03b957`
**Gate:** V2-B `PENDING_OPERATOR_DECISION`
**Runtime implementation:** Not authorized

## 1. Executive Summary

The Command Center is a read-only management consumer of the normalized integration backbone established in CORE-V2-P02. It must receive only validated `ModuleAggregationResult` and `CoreModuleResult` values, derive a small deterministic view model, and render management summaries without importing raw adapters, subproject payloads, or business-service internals.

The recommended first implementation target is a bounded module-status band inside the existing workforce dashboard route, `/organization/workforce-dashboard`. This surface already acts as the weekly command room and has established KPI, alert, decision, RTL, and dark-mode patterns. P04 must not redesign that page or refactor its large container; it may only mount one isolated component backed by P02 mock observations.

No implementation may begin until the operator explicitly chooses Gate V2-B option A or B.

## 2. Current V1 Surface Evidence

The current application provides these relevant management surfaces:

| Surface | Evidence | Fit | Constraint |
| --- | --- | --- | --- |
| Workforce dashboard | Existing route, weekly command-room heading, KPI strip, urgent alerts, cockpit grid, decision center | Highest management relevance | Body remains inside large `WorkforcePages.tsx` |
| Maintenance page | Independent page with system-health, finding, snapshot, and data-volume indicators | Strong diagnostic fit | Maintenance semantics are narrower than central management |
| Data Center page | Independent page with data health, backups, records, keys, and danger zone | Strong operational-data fit | Storage-oriented, not a general Command Center |
| Frozen cockpit prototype | Useful visual concept evidence | Strong conceptual fit | Runtime integration and modification remain frozen |

The app shell already supplies lazy route resolution, RTL layout, route loading, and route error isolation. Existing `InfoPanel`, `StatusBadge`, KPI-card, cockpit-grid, and decision-panel patterns can be reused without creating a new route.

## 3. P02 Backbone Evidence

CORE-V2-P02 established a mock-only integration backbone with:

- versioned module contracts;
- a static module registry;
- adapter boundaries and a mock adapter;
- observation validation;
- deterministic aggregation;
- normalized per-module `CoreModuleResult` records;
- module health states `healthy`, `degraded`, `unavailable`, and `unknown`;
- freshness states `fresh`, `stale`, and `unknown`;
- explicit result statuses including `valid`, `valid_with_warnings`, `no_data`, `unavailable`, `invalid_payload`, `unsupported_version`, `disabled`, and `registry_error`;
- module-level fault isolation.

The baseline contains no real Product, Mahak, Finance, or Audit adapter and no fetch, storage, backend, database, or auth integration.

## 4. Command Center Responsibility

The Command Center shall:

- summarize normalized module state for a manager;
- promote deterministic attention items from normalized alerts, KPIs, reliability, and data-quality states;
- expose source, freshness, confidence, and diagnostic context;
- provide safe drill-down references;
- preserve partial results when one module fails;
- remain read-only in V2.1.

It shall not validate raw payloads, execute module commands, reproduce module business formulas, create tasks or decisions automatically, write data, or treat itself as a source of truth.

## 5. Data Flow

```text
MockModuleAdapter
  -> ModuleObservationValidator
  -> ModuleObservationAggregator
  -> ModuleAggregationResult
  -> CommandCenterViewModelBuilder
  -> deterministic attention ranking
  -> CommandCenterViewModel
  -> existing management surface
```

The UI must never receive raw adapter payloads. Command Center derivation is pure, deterministic, and non-mutating.

## 6. View Model

Conceptual contract:

```ts
interface CommandCenterViewModel {
  generatedAt: string;
  sourceSchemaVersion: string;
  overallState: "healthy" | "attention" | "critical" | "unknown";
  managementSummary: CommandCenterManagementSummary;
  modules: CommandCenterModuleSummary[];
  topAttention: CommandCenterAttentionItem[];
  kpiHighlights: CommandCenterKpiHighlight[];
  reliability: CommandCenterReliability;
  refresh: {
    state: "idle" | "refreshing" | "partial" | "failed";
    lastSuccessfulAt?: string;
  };
}
```

The contract is intentionally display-oriented. It does not expose adapter methods, storage keys, transport details, or raw module records.

## 7. Module Summary

```ts
interface CommandCenterModuleSummary {
  moduleId: string;
  title: string;
  enabled: boolean;
  resultStatus: string;
  health: "healthy" | "degraded" | "unavailable" | "unknown";
  freshness: "fresh" | "stale" | "unknown";
  observedAt?: string;
  alertCounts: { critical: number; warning: number; info: number };
  highlightedKpiCount: number;
  reliabilityLabel: string;
  summaryText: string;
  detailRouteRef?: string;
}
```

Disabled modules are excluded from operational totals and top-attention ranking. They may appear only in a diagnostic inventory view.

## 8. Attention Item

```ts
type CommandCenterAttentionSource =
  | "module_state"
  | "alert"
  | "kpi"
  | "data_quality"
  | "existing_core_decision"
  | "existing_core_task";

interface CommandCenterAttentionItem {
  attentionId: string;
  moduleId: string;
  sourceType: CommandCenterAttentionSource;
  sourceRef?: string;
  title: string;
  summary: string;
  severity: "critical" | "warning" | "info";
  confidence: "high" | "medium" | "low" | "unknown";
  freshness: "fresh" | "stale" | "unknown";
  priorityTier: 0 | 1 | 2 | 3;
  riskFlags: string[];
  detectedAt?: string;
  suggestedNextStep?: string;
  drillDownRef?: string;
}
```

`suggestedNextStep` is explanatory text only. It is not a command and must not imply that an action was executed.

## 9. KPI Highlight

```ts
interface CommandCenterKpiHighlight {
  highlightId: string;
  moduleId: string;
  kpiKey: string;
  label: string;
  displayValue: string;
  status: "critical" | "warning" | "normal" | "unknown";
  freshness: "fresh" | "stale" | "unknown";
  observedAt?: string;
  explanation: string;
  drillDownRef?: string;
}
```

The view model keeps values typed upstream and formats them for display at this boundary. It must not sum unrelated values, currencies, units, or business meanings across modules.

## 10. Management Summary

```ts
interface CommandCenterManagementSummary {
  enabledModuleCount: number;
  healthyModuleCount: number;
  attentionModuleCount: number;
  unavailableModuleCount: number;
  staleModuleCount: number;
  criticalAttentionCount: number;
  warningAttentionCount: number;
  pendingCoreDecisionCount?: number;
  pendingCoreTaskCount?: number;
}

interface CommandCenterReliability {
  completeModuleCount: number;
  partialModuleCount: number;
  failedModuleCount: number;
  unknownFreshnessCount: number;
  hasPartialData: boolean;
}
```

Optional task and decision counts may be populated only from an existing approved Core read model. Missing counts remain omitted, never fabricated as zero.

## 11. Priority Strategy Comparison

| Strategy | Strength | Risk | Decision |
| --- | --- | --- | --- |
| Ordered severity tiers | Very transparent and stable | Coarse ordering within a tier | Acceptable but incomplete |
| Numeric weighted score | Flexible and sortable | Can become opaque and silently encode business policy | Rejected for V2.1 |
| Hybrid tier plus deterministic rank tuple | Transparent top-level policy with stable tie-breaking | Requires an explicit ordering contract | Recommended |

## 12. Recommended Priority Strategy

Use priority tiers followed by a deterministic rank tuple, not an opaque aggregate score:

- **Tier 0, blocking:** `invalid_payload`, `unsupported_version`, `registry_error`, or a conflict that makes the current observation unsafe.
- **Tier 1, urgent:** open critical alert, critical KPI, or unavailable expected module.
- **Tier 2, attention:** stale result, degraded module, warning alert/KPI, `no_data`, or partial observation.
- **Tier 3, informational:** info alert and non-blocking unknown state.

Within each tier sort by:

1. severity rank;
2. reliability-risk rank;
3. most recent `detectedAt` first;
4. `moduleId` ascending;
5. `attentionId` ascending.

The dashboard default is at most eight top-attention items. A soft cap of three noncritical items per module prevents one noisy module from hiding others. Critical items are never discarded by the per-module cap; overflow is summarized and remains available in module drill-down.

## 13. Reliability and Trust

- `fresh + valid` may be presented as current.
- `stale + valid` may show last-known-good data only with an explicit stale label and timestamp.
- `unknown` freshness must never be styled as fresh.
- `invalid_payload` and `unsupported_version` current values are suppressed.
- `unavailable` does not erase a previously valid value, but any retained value must be marked last-known-good and stale.
- `no_data` is not zero.
- one failed module must not crash or erase valid results from other modules.
- diagnostics remain visible without exposing raw payload content.

## 14. Alert Promotion

- Open critical alerts become Tier 1 attention items.
- Warning alerts become Tier 2 when current and actionable.
- Info alerts remain module-level unless explicitly designated management-relevant by the normalized contract.
- Closed/resolved alerts are not promoted.
- Duplicate alert identities are collapsed deterministically by module and source reference.
- Stale alerts may remain visible only as stale context; they cannot be presented as newly detected.
- Alert promotion never creates a Core task or decision automatically.

## 15. KPI Promotion

- Critical and warning KPI states may become highlights and attention items.
- Normal KPIs support module summaries but do not occupy top attention by default.
- Missing KPI values remain unknown, not zero.
- Stale critical/warning KPI values may remain visible with a stale reliability marker.
- Invalid or unsupported KPI payloads are suppressed and represented by a data-quality attention item.
- Cross-module comparison is allowed only when metric identity, unit, currency, period, and semantic definition match explicitly.

## 16. Task and Decision Relationship

The Command Center may display references to existing approved Core tasks or decision items through a read-only Core bridge. It must not:

- transform an alert into a task automatically;
- create a decision item from a KPI automatically;
- approve, reject, assign, close, or snooze work;
- import the current Workforce task/decision storage implementation into the integration backbone.

Because Task/Decision runtime work remains frozen and the current Workforce decision surfaces are locally coupled, P04 must omit this bridge. The view-model fields remain optional for a later approved phase.

## 17. Drill-down Boundary

- `detailRouteRef` and `drillDownRef` are opaque identifiers, not arbitrary URLs.
- A Core-owned allowlist resolves references to existing registered routes.
- Module adapters cannot inject navigation paths.
- The Command Center cannot import subproject routes or source modules.
- An unresolved reference renders a disabled details action with an explanation.
- P04 may link only to an existing Core route already present in the route registry; it may not add a route.

## 18. Empty, Partial, and Failure States

| State | Required behavior |
| --- | --- |
| All modules disabled | Show configuration-empty state; no false healthy status |
| Enabled modules, no observations | Show `no_data` attention and last refresh time |
| Some valid, some failed | Render valid modules and mark the view partial |
| All failed | Preserve last successful view model if available and show refresh failure |
| Unsupported schema version | Suppress unsafe values and show blocking compatibility item |
| Stale only | Show stale summary, timestamps, and manual refresh action |
| No attention items | Show a quiet healthy/unknown state based on reliability, not an empty blank panel |

## 19. Refresh Strategy Comparison

| Strategy | Benefit | Risk in P04 |
| --- | --- | --- |
| Page-load only | Smallest surface | Can become visibly stale during a long session |
| Page-load plus manual refresh | Explicit, deterministic, testable | User initiates refresh |
| Fixed interval polling | More current | Lifecycle, concurrency, timer, and false-freshness complexity |
| Event-driven refresh | Best eventual architecture | Requires runtime event or transport infrastructure not approved |

## 20. Recommended Refresh Baseline

P04 should use page-load aggregation plus an explicit manual refresh. Only one refresh may be in flight. The UI retains the last successful view model while refreshing, records `generatedAt` and `lastSuccessfulAt`, and isolates module failures. No polling, events, fetch, backend, database, storage, or subproject connection is authorized.

## 21. Information Architecture

Recommended bounded section order inside the existing dashboard:

1. compact module-health summary;
2. enabled/attention/unavailable/stale counts;
3. top attention list with source, severity, freshness, and confidence;
4. selected KPI highlights;
5. reliability and last-refresh footer;
6. manual refresh command local to mock aggregation;
7. safe existing-route drill-down where available.

The section must remain scan-first, RTL, dark-mode compatible, and subordinate to the current weekly dashboard rather than replacing it.

## 22. Recommended V1 Target Surface

**Recommended target:** the existing `/organization/workforce-dashboard` route.

Reasons:

- it is already the management-facing weekly command room;
- it already contains KPI, alert, cockpit, and decision visual patterns;
- it avoids route creation or navigation churn;
- it gives the mock integration backbone a truthful management context.

Risk control:

- create the derivation and visual component outside `WorkforcePages.tsx`;
- add one import and one bounded mount point only;
- do not refactor surrounding dashboard logic;
- do not modify Maintenance, Data Center, routes, or frozen cockpit prototypes;
- retain an additive rollback path.

MaintenancePage and DataCenterPage remain useful diagnostic drill-down candidates, not the initial Command Center host.

## 23. Expected P04 File Impact

Expected and bounded file set:

- `src/integration/commandCenter/commandCenterViewModel.ts` (new, pure derivation);
- `src/integration/commandCenter/commandCenterPriority.ts` (new, deterministic ranking);
- `src/components/CommandCenterModuleOverview.tsx` (new, presentational component);
- `src/WorkforcePages.tsx` (minimal import and mount only);
- `src/styles.css` (only if existing patterns cannot satisfy containment and RTL);
- `tests/commandCenterViewModel.test.ts` (new);
- minimal test-runner registration if the existing runner requires it;
- one P04 project-control report.

Expected unchanged areas include routes, package files, storage services, domain models, analyzers, prototypes, subprojects, backend, database, and auth.

## 24. P04 Minimum Slice

1. Consume the static P02 mock aggregation only.
2. Derive module summaries, reliability totals, top attention, and KPI highlights.
3. Render one compact section on the existing workforce dashboard.
4. Support page-load and manual refresh without network or storage.
5. Show partial, stale, unavailable, invalid-version, and empty states.
6. Provide only safe existing-route drill-down references.
7. Keep every interaction read-only.

P04 must not implement real adapters, task/decision creation, automated actions, write-back, new routes, broad visual redesign, or module business calculations.

## 25. P04 Test Matrix

| Area | Minimum checks |
| --- | --- |
| View-model purity | Same input gives same output; input objects are not mutated |
| Result coverage | Valid, warning, no-data, unavailable, invalid, unsupported, disabled |
| Priority | Tier ordering, stable tie-break, per-module soft cap, critical preservation |
| Reliability | Stale/unknown labels, last-known-good handling, invalid-value suppression |
| Alerts | Critical/warning promotion, info retention, resolved exclusion, duplicate collapse |
| KPIs | Critical/warning promotion, missing-not-zero, semantic comparison guard |
| Partial failure | One module failure does not erase other module results |
| Empty state | All disabled and no observation cases are explicit |
| Drill-down | Allowlisted reference works; unresolved reference is disabled |
| Refresh | In-flight guard, last-success retention, timestamp update |
| UI | RTL order, keyboard focus, status text plus color, no mobile overflow |
| Regression | Existing route registry, dashboard behavior, full test suite, production build |

## 26. Browser and RTL Requirements

- Verify the existing dashboard at desktop, 390 px, and 320 px widths.
- No horizontal document overflow or clipped attention content.
- Cards and badges wrap without changing fixed control dimensions unexpectedly.
- Persian labels remain correctly encoded and right-to-left.
- Status must use text/icon semantics in addition to color.
- Manual refresh is keyboard reachable and has loading/disabled feedback.
- Route loading and route error boundaries remain intact.
- Browser console has no serious runtime errors.

## 27. Security Boundary

- No raw subproject payload reaches the UI.
- No real Product, Mahak, Finance, Audit, database, auth, API, or backend connection.
- No `fetch`, `localStorage`, `sessionStorage`, dynamic remote import, or external script.
- No adapter-supplied arbitrary URL or executable instruction.
- No command execution, write-back, approval, or automation.
- No sensitive payload content in diagnostics or UI.
- Version mismatch and invalid payload fail closed at the normalized boundary.

## 28. Explicit Non-goals

- real subproject integration;
- AI recommendation or automation;
- action execution or write-back;
- backend, database, auth, API, migration, or storage work;
- new routes;
- task or decision runtime implementation;
- frozen P56 work;
- frozen cockpit prototype integration;
- dashboard redesign;
- broad `WorkforcePages.tsx` extraction or refactor;
- business KPI formula development.

## 29. Rollback

P03 is docs-only and can be rolled back to parent baseline `7ec283150e9e78696ef2b736d8be6ccebb03b957` by reverting its single documentation commit. No runtime artifact, data, route, package, or storage state is affected.

Future P04 must be additive: remove the bounded mount, component, view-model files, tests, and any narrowly added styles to return to the P02 baseline. No migration or data rollback should be necessary.

## 30. Open Questions

1. Does the operator approve the main workforce dashboard as the first host, despite its known monolith risk?
2. Should unavailable modules rank above or below fresh critical business alerts within Tier 1?
3. Is eight the approved top-attention limit and three the approved noncritical per-module soft cap?
4. Which existing Core routes, if any, are approved for first-slice drill-down?
5. Should normal KPI highlights be omitted entirely or shown in a compact healthy summary?
6. When Task/Decision runtime is later resumed, what approved read-model contract will supply pending counts?

## 31. Gate V2-B Decision Package

**Current status:** `PENDING_OPERATOR_DECISION`

The operator must choose one option:

- **Option A — Approve as designed:** authorize P04 exactly within the minimum slice and expected file impact above.
- **Option B — Approve with changes:** record explicit changes to target surface, ordering policy, caps, drill-down allowlist, or refresh behavior before P04.
- **Option C — Hold/redesign:** keep implementation blocked and return the design for revision.

Approval of Option A or B authorizes only:

- a pure Command Center view model;
- deterministic attention logic;
- consumption of P02 mock observations;
- adaptation of one existing management surface;
- focused tests, build verification, and desktop/mobile browser checks.

It does not authorize real subproject integration, AI, automation, command execution, write-back, backend/database/auth work, new routes, broad redesign, P56, or merge/push without separate instruction.

**Recommended action:** Review Report 179 with the operator. Do not create P04 implementation until the operator explicitly chooses GATE V2-B option A or B.
