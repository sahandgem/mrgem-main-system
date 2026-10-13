# Master Gem V2 Integration Backbone Discovery and Contract

> CORE-V2-P01 design report. Documentation only; no runtime implementation authority.
## 1. Executive Decision Summary

CORE-V2-P01 recommends a deliberately small, read-only Integration Backbone contract for Gate V2-A:

- Keep source modules authoritative for business truth and calculations.
- Give Core authority only over registry configuration, validation diagnostics, aggregation, and presentation state.
- Separate source health from data freshness; data existence must never imply health.
- Use a static, Core-owned registry for the first implementation. Do not auto-discover modules.
- Use strict contract-major compatibility, tolerant optional-field reading, and explicit invalid/partial semantics.
- Prove the contract in P02 with one in-process mock/static adapter and synthetic data.
- Add no real subproject connection, command execution, backend, database migration, auth/API architecture, storage key, or required UI route.

Gate V2-A remains `PENDING_OPERATOR_DECISION`. This report does not approve P02.

## 2. Current-State Evidence

The discovery was read-only. Evidence was taken from the V1 baseline and the P00 roadmap.

| Evidence | Observed state | V2.1 implication |
|---|---|---|
| `src/registry/workforceStorageKeys.ts` | 24 registered `komak.workforce.*.v1` keys with owner service, domain, criticality, backup, snapshot, and import flags. | Registry metadata and explicit ownership are useful patterns, but storage keys are not an integration transport. |
| `src/services/workforceService.ts` | Five core collections use a service boundary, demo fallback, clone-on-read behavior, and localStorage persistence. | A service boundary exists, but V2.1 must not read those keys directly or treat demo-seed behavior as module health. |
| Workforce services and `WorkforcePages.tsx` | Some services and the decision queue still access localStorage directly. | Shared/localStorage coupling is forbidden for cross-module integration. |
| `src/services/workforceBackupService.ts` | Versioned bundle `1.0.0`, app identity, checksum, coverage registry, validation, validate-only mode, snapshots, and last-known data concepts exist. | Version, validation, coverage, and rollback concepts are reusable design evidence; backup files are not live module observations. |
| `src/routes/workforceRouteManifest.ts` | 28 route-manifest entries separate route metadata from lazy component mapping. | A small declarative registry pattern is proven; integration registry must remain separate from UI routing. |
| `src/routes/workforceRoutes.tsx` | Lazy page mapping consumes the route manifest. | Command Center drill-down can later reference approved routes, but routes must not become module identity or transport. |
| Analysis/service/page layers | Workforce analyzers, settings hooks, state services, history, maintenance, alerts, decisions, and reports are separated to varying degrees. | Future adapters can sit beside services and expose normalized read models without moving business logic into Core. |
| `src/services/operationalHistoryService.ts` and retention/signoff services | Versioned operational history, audit-like events, related paths, checksums, retention, backup, and restore events exist. | Audit reference and last-known-good concepts are established, but existing Workforce event types are module-specific. |
| `src/pages/workforce/WorkforceRouteAdapter.tsx` | Compatibility adapter maps route paths back into `WorkforcePages`. | This is a UI migration adapter, not a data integration adapter, and must not be reused as one. |
| `src/WorkforcePages.tsx` | 4,384 lines; dashboard and several pages compose many services/analyzers directly. | Direct page imports and dashboard-specific service wiring must not become the V2 integration API. |
| Report 171, D1-D14 | D1 monolith; D2 preserved machine constants; D3 localStorage-only; D4 non-transactional restore; D5 limited formal E2E; D10-P56 frozen; D11 cockpit frozen; D12 Task/Decision runtime frozen; D13 subprojects isolated; D14 backend/database/auth/API/storage migration unapproved. | P02 must be additive, mock-only, read-only, test-focused, reversible, and independent from frozen tracks. |

### Current Data and Dashboard Boundary

The current Workforce dashboard obtains state through `useWorkforceStore`, analysis settings, analyzers, and multiple operational services. There is no cross-module observation contract today. Existing localStorage data remains the V1 Workforce storage authority. V2.1 must add an independent normalized read boundary rather than relabel current storage or page composition as a platform API.

### Current Task, Decision, and History Surfaces

- Decision queue and decision reports are Workforce operations features.
- Operational history, retention, signoff, drift, maintenance, and calendar services provide useful audit/status evidence.
- These surfaces remain module-owned. Their internal models must not be generalized implicitly into Core contracts.
- P01 does not resume the frozen Task/Decision runtime or cockpit runtime.

## 3. Existing Integration Seams

The smallest safe future attachment points are additive and sit outside current business models:

1. A new `src/integration/contracts` namespace for transport-neutral contract types.
2. A new `src/integration/registry` namespace for static Core-owned module configuration.
3. A new `src/integration/adapters` namespace for source-specific readers.
4. A validation/normalization step between raw adapter output and Core aggregation.
5. A read-only aggregation result that a future Command Center can consume.
6. Test fixtures under the existing test runner, using synthetic observations only.

Existing patterns that inform these seams:

- Storage registry: explicit owner and policy metadata.
- Route manifest: declarative registry separated from runtime components.
- Workforce services: domain behavior behind service functions.
- Backup validation: version, checksum, coverage, diagnostics, and validate-only thinking.
- Operational history: timestamps, related references, and audit evidence.

None of these existing files needs modification in P01, and none is automatically selected for modification in P02.

## 4. Anti-Patterns and Forbidden Coupling

The following must not become the V2 integration API:

- DOM or UI scraping.
- Reading another project's localStorage or sessionStorage keys.
- Arbitrary shared `komak.*` storage keys between projects.
- Direct database access across project boundaries.
- Importing subproject implementation files into Core.
- Importing Core pages/components into an adapter.
- Hardcoded per-subproject logic in dashboard cards.
- Using a route path, display label, barcode, or business code as the only module identity.
- Treating backup bundles, Excel files, or UI state as live health signals.
- Inferring `healthy` because any payload or cached data exists.
- Allowing adapters to mutate source business data.
- Allowing payload text to carry executable commands.
- Accepting an unsupported major version as partial success.
- Combining source health, transport health, and data freshness into one ambiguous boolean.
- Silent fallback from invalid current data to last-known-good data.
- Dynamic plugin loading or module auto-discovery in the first slice.
## 5. Proposed Module Identity Contract

| Field | Required | Owner and rule |
|---|---:|---|
| `moduleId` | Yes | Project Core registry authority; stable, immutable, globally unique, lowercase, and matching `^[a-z][a-z0-9.-]{2,63}$`. |
| `displayName` | Yes | Source-proposed human label; mutable and never identity. |
| `moduleType` | Yes | Core taxonomy: `workforce`, `product`, `finance`, `production`, `inventory`, `mobile`, `core`, or `other`. |
| `contractVersion` | Yes | Producer semantic version; major controls compatibility. |
| `producerVersion` | Yes | Source module/build version. |
| `sourceSystem` | Yes | Stable source-system family, not a UI label. |
| `instanceId` | No | Distinguishes registered instances; contains no secrets. |
| `environment` | No | `local`, `test`, `staging`, or `production`; P02 uses `test`. |

Rules:

- `moduleId` is the registry and observation correlation key.
- Display-name changes preserve identity; `moduleId` change is a controlled migration.
- Duplicate enabled `moduleId` values invalidate both entries.
- Product codes, barcodes, route paths, and storage keys cannot identify modules.

```json
{
  "moduleId": "workforce.demo",
  "displayName": "Workforce Demo",
  "moduleType": "workforce",
  "contractVersion": "1.0.0",
  "producerVersion": "v1-synthetic",
  "sourceSystem": "master-gem-workforce",
  "instanceId": "local-demo",
  "environment": "test"
}
```

## 6. Proposed Observation Envelope

The producer supplies business observations. Adapter/Core transport and validation state remain separate.

```ts
interface ModuleObservationV1 {
  contractVersion: string;
  observationId: string;
  module: ModuleIdentity;
  generatedAt: string;
  sourceDataUpdatedAt?: string;
  summary: ModuleSummary;
  health: SourceHealth;
  kpis?: ModuleKpi[];
  alerts?: ModuleAlert[];
  capabilities?: ModuleCapability[];
  ownership: SourceOwnership;
  partial?: { isPartial: boolean; missingSections?: string[]; sourceErrors?: DiagnosticRef[] };
}

interface CoreModuleObservation {
  registryModuleId: string;
  receivedAt: string;
  lastSuccessfulSyncAt?: string;
  validation: "valid" | "valid_with_warnings" | "invalid";
  sourceObservation?: ModuleObservationV1;
  sourceHealth: "healthy" | "degraded" | "unavailable" | "unknown";
  freshness: "fresh" | "stale" | "unknown";
  effectiveState: "healthy" | "degraded" | "unavailable" | "stale" | "unknown";
  diagnostics: ModuleDiagnostic[];
  lastKnownGood?: ModuleObservationV1;
}
```

Timestamp authority:

- `generatedAt`: required producer timestamp for snapshot freshness.
- `sourceDataUpdatedAt`: optional latest business-data change; it does not prove transport freshness.
- `receivedAt`: Core receipt time.
- `lastSuccessfulSyncAt`: Core runtime state for the last valid observation.
- All timestamps use ISO 8601 with timezone.

```json
{
  "contractVersion": "1.0.0",
  "observationId": "obs-workforce-demo-001",
  "module": {
    "moduleId": "workforce.demo",
    "displayName": "Workforce Demo",
    "moduleType": "workforce",
    "contractVersion": "1.0.0",
    "producerVersion": "v1-synthetic",
    "sourceSystem": "master-gem-workforce",
    "environment": "test"
  },
  "generatedAt": "2026-08-07T09:00:00+03:30",
  "summary": { "status": "operational", "text": "Synthetic observation available." },
  "health": { "state": "healthy", "observedAt": "2026-08-07T09:00:00+03:30", "reasonCode": "checks_passed" },
  "kpis": [
    {
      "key": "active_alert_count",
      "label": "Active alerts",
      "value": 2,
      "valueType": "count",
      "status": "warning",
      "measuredAt": "2026-08-07T08:58:00+03:30",
      "drillDownRef": "workforce.alerts"
    }
  ],
  "alerts": [],
  "capabilities": [
    { "key": "kpi.read", "version": "1.0", "mode": "read", "status": "available" }
  ],
  "ownership": { "businessTruthOwner": "workforce.demo", "isDerived": false }
}
```

## 7. Health Model

Source health and freshness are orthogonal:

- Source health: `healthy | degraded | unavailable | unknown`
- Freshness: `fresh | stale | unknown`
- Effective state: `healthy | degraded | unavailable | stale | unknown`

| State | Trigger and meaning | Core display | Action/fallback |
|---|---|---|---|
| `healthy` | Valid, fresh payload and source healthy. | Show current data. | P02 remains read-only. |
| `degraded` | Source reduced or non-blocking validation warnings. | Show accepted data with reason. | Block sensitive actions. |
| `unavailable` | Transport failure or source says unavailable. | Show labeled last-known-good or no live data. | Block source actions; show last success. |
| `stale` | Valid observation exceeds registry freshness policy. | Show only as stale with age. | Block current-data-dependent actions. |
| `unknown` | No trustworthy conclusion or no data ever. | Show identity and diagnostics only. | Block actions; never infer healthy. |

Invalid payload is a diagnostic state, not health. If no current valid payload exists, Core reports `INVALID_PAYLOAD` and may show last-known-good only with an explicit stale label. Effective precedence is `unavailable > stale > degraded > unknown > healthy`.

## 8. Freshness Model

- Each registry entry owns `staleAfterSeconds` and optional `criticalAfterSeconds`.
- `generatedAt` is the freshness clock; there is no global threshold.
- Producer cadence is informational and cannot silently weaken Core policy.
- Missing/invalid `generatedAt` makes the payload invalid.
- Future time beyond allowed clock skew produces a policy-based diagnostic.
- Successful receipt does not make old business data fresh.
- Stale data displays generated time, age, threshold, and last successful sync.
- No data ever received is `NO_DATA`, not stale.
- Unavailable plus stale last-known-good must show both conditions.
## 9. KPI Contract

```ts
interface ModuleKpi {
  key: string;
  label: string;
  value: number | string | boolean | null;
  valueType: "number" | "count" | "currency" | "percentage" | "duration" | "text" | "boolean";
  unit?: string;
  status: "normal" | "info" | "warning" | "critical" | "unknown";
  measuredAt: string;
  comparison?: {
    baselineValue?: number | string;
    delta?: number;
    direction?: "up" | "down" | "flat" | "unknown";
    label?: string;
  };
  drillDownRef?: string;
}
```

Rules:

- `key` is stable and unique within a module.
- The source owns calculation and business meaning.
- Core renders metadata; a derived KPI requires an explicit derivation id/version and source references.
- `measuredAt` is required and can differ from observation time.
- `drillDownRef` is opaque and non-executable, resolved through approved Core mapping.
- Unknown valid KPI keys are tolerated.
- An invalid KPI is omitted with a diagnostic without invalidating unrelated KPIs.

## 10. Alert Contract

```ts
interface ModuleAlert {
  alertId: string;
  fingerprint?: string;
  category: string;
  severity: "info" | "warning" | "critical";
  title: string;
  summary: string;
  detectedAt: string;
  updatedAt?: string;
  status: "open" | "acknowledged" | "resolved";
  sourceReference?: string;
  recommendedNextAction?: string;
  drillDownRef?: string;
}
```

Rules:

- `alertId` is stable for one lifecycle.
- Optional `fingerprint` supports deduplication across observations.
- Repeated observations update the same alert instead of creating unbounded duplicates.
- Resolved alerts are not counted as active.
- Recommended action is display-only text, never executable.
- Raw markup, scripts, command payloads, and privileged action tokens are rejected.
- A malformed alert is dropped with a diagnostic while valid sections remain usable.

## 11. Capability Model

```ts
interface ModuleCapability {
  key: string;
  version: string;
  mode: "read" | "link" | "command_advertised";
  status: "available" | "degraded" | "unavailable";
  detailRef?: string;
}
```

Initial examples are `health.read`, `kpi.read`, `alert.read`, and `detail.link`. Future `command.*` capabilities may be advertised but are non-executable in P01/P02.

Rules:

- A versioned capability list avoids expanding hardcoded booleans.
- Unknown capabilities are safely ignored and may produce diagnostics.
- Registry policy may disable an advertised capability.
- Advertisement is not authorization.
- No Core command interface, remote write, or privileged action is designed here.

## 12. Source-of-Truth Rules

| Concern | Authority |
|---|---|
| Business entities, calculations, KPI values, alert lifecycle | Source module |
| Registration, enable/disable, expected contract major, freshness policy, adapter selection | Project Core registry |
| Validation diagnostics, receipt time, last successful sync, effective display state | Core Integration Backbone |
| Aggregated/derived KPI | Core only when labeled with derivation/version/source references |
| Command authorization and source mutation | Out of scope; future independent decision |

Conflict behavior:

- Duplicate enabled `moduleId`: registry invalid; neither entry becomes active.
- Two sources claim the same truth: show `SOURCE_CONFLICT`; never choose silently.
- Unavailable source: preserve ownership and show unavailable/last-known-good state.
- Stale source: never overwrite it with Core-generated business values.
- Renamed module: update `displayName`, preserve `moduleId`.
- Contract mismatch: reject unsupported major and preserve last-known-good separately.
- Core-derived state is visibly labeled and never written back as source truth.
## 13. Version Compatibility Rules

- Versions follow Semantic Versioning.
- Registry config declares `expectedContractMajor`.
- Same major: Core accepts supported required structure and tolerates unknown optional fields.
- New optional fields and new enum values with documented unknown fallback are minor-compatible.
- Removing/renaming required fields, changing field meaning/type, or changing identity semantics requires a new major.
- Missing required fields makes the payload invalid.
- Unsupported major makes the payload `UNSUPPORTED_CONTRACT_VERSION`; no partial acceptance.
- Unknown optional object fields are ignored by P02 readers, not executed, and may be retained only in raw diagnostics if safe.
- Producer patch/minor version is recorded for evidence but does not override Core validation.
- Core must never silently coerce an incompatible major into the expected shape.
- Last-known-good from a supported version remains separately displayable as stale when the current payload is incompatible.

Compatibility result vocabulary:

- `compatible`
- `compatible_with_unknown_optional_fields`
- `incompatible_major`
- `invalid_required_structure`

## 14. Error and Partial-Data Semantics

Core must keep these states distinct:

| Condition | Meaning | Current data | Last-known-good | Effective behavior |
|---|---|---|---|---|
| `NO_DATA` | Registered module has never produced a valid observation. | None | None | `unknown`; show identity and retry diagnostic. |
| `STALE_DATA` | Last valid observation exceeds registry threshold. | Valid but old | Same observation | `stale`; show age and block current-data actions. |
| `UNAVAILABLE_MODULE` | Adapter cannot read source or source reports unavailable. | None or unavailable envelope | Optional | `unavailable`; show last success and clearly labeled cache. |
| `INVALID_PAYLOAD` | Current raw payload fails required validation. | Rejected | Optional | Show validation error; never silently present rejected payload. |
| `UNSUPPORTED_CONTRACT_VERSION` | Major version is not accepted. | Rejected | Optional supported version | Show incompatibility and expected/received major. |
| `PARTIAL_DATA` | Envelope is valid but declared sections/items are missing or individually invalid. | Accepted sections only | Optional | `degraded`; show diagnostics and missing-section list. |
| `REGISTRY_DISABLED` | Operator disabled the module. | Not read | Retained only if policy allows | Exclude from active aggregation; show disabled in diagnostics. |
| `SOURCE_CONFLICT` | Duplicate identity or competing authorities. | Not trusted | Optional | Block selection until registry/operator resolution. |

Detailed rules:

- Partial KPI set: accept valid KPIs, report item diagnostics, and mark degraded if expected data is missing.
- Malformed alert: omit that alert and report its index/id; do not discard valid KPIs.
- Missing optional section: use an empty section without error unless a capability promised it.
- Empty KPI list: valid when `kpi.read` is absent or the source explicitly reports no metrics; otherwise warning.
- Adapter exception: produce transport diagnostic, never fabricate an observation.
- Invalid current plus valid cached: expose both `INVALID_PAYLOAD` and cached age.
- Diagnostics use stable codes, severity, safe message, field path, and source module; no secrets or raw executable content.

## 15. Module Registry Design

### Static P02 Registry Entry

```ts
interface ModuleRegistryEntry {
  moduleId: string;
  displayName: string;
  moduleType: ModuleType;
  enabled: boolean;
  expectedContractMajor: number;
  freshnessPolicy: {
    staleAfterSeconds: number;
    criticalAfterSeconds?: number;
    allowedFutureSkewSeconds?: number;
  };
  adapterKey: string;
  detailRouteRef?: string;
}
```

Runtime observation state is separate:

```ts
interface ModuleRegistryRuntimeState {
  moduleId: string;
  lastSeenAt?: string;
  lastSuccessfulObservationAt?: string;
  effectiveState: ModuleEffectiveState;
  diagnostics: ModuleDiagnostic[];
}
```

### Registry Decisions

- P02 registry configuration is static, compile-time, and Core-owned.
- Auto-discovery: **NO** for P02 and the first real pilot unless separately approved.
- `adapterKey` resolves through a closed adapter factory map; it is not a dynamic import path from payload data.
- Disabled entries are not polled/read and are visible only in diagnostics.
- Registry validates duplicate identity and policy values before aggregation.
- `detailRouteRef` may point only to an approved Core mapping; it is optional and creates no route.
- Last seen and last successful observation belong to runtime state, not static config.

### Registry Must Not Duplicate

- Producer version
- Current health or KPI values
- Alerts
- Source business records
- Internal storage/database location
- Secrets or credentials
- Calculation rules
- Full route definitions
- Source-owned display details beyond minimal fallback metadata

The source observation remains authoritative for current producer metadata. Registry metadata is the operator?s expected identity and policy.

## 16. Adapter Boundary

The direction is fixed:

```text
SOURCE-SPECIFIC ADAPTER
  -> RAW READ RESULT
  -> VALIDATION / NORMALIZATION
  -> NORMALIZED CONTRACT
  -> CORE REGISTRY / AGGREGATION
  -> FUTURE COMMAND CENTER
```

Conceptual minimum interface:

```ts
interface ModuleReadAdapter {
  readonly adapterKey: string;
  read(signal?: AbortSignal): Promise<AdapterReadResult>;
}

type AdapterReadResult =
  | { ok: true; receivedAt: string; raw: unknown }
  | { ok: false; receivedAt: string; error: ModuleTransportError };

interface ModuleContractProcessor {
  validateAndNormalize(
    raw: unknown,
    entry: ModuleRegistryEntry,
    now: string
  ): ContractProcessingResult;
}
```

Responsibilities:

- Adapter reads/fetches source data and reports transport/source errors.
- Source-specific adapter may map a source format into candidate contract fields.
- Contract processor validates required shape, compatibility, identity, timestamps, items, and safe text.
- Aggregator combines normalized Core records, never raw source payloads.
- Adapter contains no dashboard card, CSS, route, KPI-calculation, or manager-decision logic.
- Adapter never mutates source business data.
- Core never imports source internal services/pages through the adapter interface.
- Abort/timeout behavior is surfaced as diagnostics.
- P02 uses a deterministic in-process mock adapter only.

## 17. Read-Path Options Comparison

| Option | Coupling | Operational complexity | Portability | Testability | Future subproject compatibility | Security exposure | Offline behavior | Rollback |
|---|---|---|---|---|---|---|---|---|
| A. In-process mock/static adapter | Low when isolated behind interface | Very low | High for contract proof | Excellent and deterministic | Proves contract, not transport | Minimal; synthetic only | Excellent | Remove additive integration files |
| B. Versioned local file/JSON boundary | Medium-low | Low/medium due file lifecycle and atomicity | Good | Good with fixtures | Useful for staged exports | File validation/path risks | Good | Disable file adapter and remove staged files |
| C. Local HTTP/HTTPS read endpoint | Low business coupling, higher transport surface | Medium/high: process, ports, timeouts, security | High | Good with server fixtures | Strong future candidate | Endpoint/auth/CORS/network exposure | Depends on service availability | Disable endpoint adapter |
| D. Direct shared database/storage access | Very high | Apparently low, actually high ownership/migration cost | Poor | Brittle | Poor; leaks internals | High privilege and corruption risk | Storage-dependent | Difficult and potentially destructive |

### Recommendation

Choose **A. In-process mock/static adapter** for P02.

Rationale:

- It proves contract, registry, validation, diagnostics, aggregation, and compatibility without choosing a real transport.
- It requires no backend, endpoint, database, storage migration, auth, localStorage key, or subproject change.
- It is deterministic under the existing test runner.
- It gives the cleanest rollback.
- Option B may be evaluated for a later staged pilot.
- Option C belongs to a future connector/security decision.
- Option D is rejected for cross-project integration.
## 18. Recommended V2.1 Implementation Baseline

If Gate V2-A is approved, P02 should implement a **read-only, in-process contract proof**:

- One static registry entry: `workforce.demo`.
- One deterministic mock adapter with synthetic observations.
- Contract types and runtime guards/normalization.
- Registry validation.
- Freshness/effective-state evaluation.
- Read-only aggregation and diagnostics.
- Tests for the matrix in section 20.
- No production dashboard dependency is required to prove success.

This baseline validates architecture rather than product behavior. It intentionally avoids a real module, real Workforce storage, local files, HTTP, shared database, and UI integration.

## 19. Minimum P02 Implementation Slice

### Exact In-Scope

1. Contract types for identity, observation, health, freshness, KPI, alert, capability, ownership, diagnostics, and compatibility.
2. Static module-registry configuration and duplicate/policy validation.
3. Adapter interface and one mock/static adapter.
4. Validation and normalization from `unknown` to the V1 normalized contract.
5. Effective-state calculation with registry freshness policy.
6. Read-only aggregation of enabled modules.
7. In-memory last-known-good behavior within one aggregator lifecycle only.
8. Diagnostics for invalid, stale, unavailable, duplicate, disabled, and unsupported-version cases.
9. Unit tests using synthetic fixtures.
10. A short P02 closure report and rollback evidence.

### Likely Additive File Areas

Names are guidance for P02 and may be refined without changing boundaries:

- `src/integration/contracts/moduleContract.ts`
- `src/integration/registry/moduleRegistry.ts`
- `src/integration/adapters/moduleAdapter.ts`
- `src/integration/adapters/mockModuleAdapter.ts`
- `src/integration/validation/moduleObservationValidator.ts`
- `src/integration/aggregation/moduleObservationAggregator.ts`
- `tests/integrationBackbone.test.ts`
- P02 control documentation under `docs/project-control/`

### Must Remain Untouched in P02

- Existing Workforce business models and analyzers
- Existing `workforceService` storage authority
- `workforceStorageKeys.ts` and all current localStorage keys
- Backup/import/restore formats and versions
- Route manifest, application navigation, and production pages
- `WorkforcePages.tsx` and P56 scope
- Cockpit prototypes and runtime
- Product/Mahak and Finance/Audit subprojects
- Package/lock files unless a separate approval is granted; no new dependency is expected
- Database, backend, auth, runtime API, commands, and real network transport

### Explicit Out-of-Scope

- Real subproject adapter
- Command execution or write capability
- Dynamic discovery/plugin loading
- Persistent registry editor
- New localStorage key
- Last-known-good persistence
- Backend/database/API/auth
- New route or Command Center UI
- Product, finance, production, inventory, or mobile integration
- Migration of existing Workforce data
- Resuming P56, cockpit, or Task/Decision runtime

### P02 Acceptance Criteria

- All section 20 cases have deterministic automated coverage.
- No raw payload reaches aggregation without validation.
- Unsupported major and duplicate identity fail closed.
- Freshness is registry-policy driven and distinct from health.
- Unknown optional fields are tolerated.
- Mock adapter cannot write source state.
- No existing route, storage key, model, or user-visible V1 behavior changes.
- Test and build pass.
- Removing the additive integration files returns the exact V1 runtime behavior.
- Gate V2-B is not implied by P02 completion.

## 20. Acceptance Test Matrix

| Case | Input/setup | Expected normalized state | Expected diagnostics/display |
|---|---|---|---|
| Valid healthy module | Compatible full observation, fresh timestamp, healthy source | `healthy` | No blocking diagnostic; KPIs/alerts available. |
| Degraded module | Valid fresh observation, source degraded | `degraded` | Reason shown; valid data retained. |
| Unavailable module | Adapter transport failure or explicit unavailable source | `unavailable` | Transport/source code and last success; actions blocked. |
| Stale snapshot | Valid observation older than registry threshold | `stale` | Age, threshold, generated time, last sync. |
| Unknown module | Observation `moduleId` absent from registry | Rejected from aggregation | `UNKNOWN_MODULE`; no auto-registration. |
| Duplicate `moduleId` | Two enabled registry entries share identity | Neither active | `DUPLICATE_MODULE_ID`; fail closed. |
| Unsupported contract major | Registry expects 1, payload sends 2 | Current payload rejected | `UNSUPPORTED_CONTRACT_VERSION`; expected/received major. |
| Unknown optional fields | Compatible required structure plus extra optional fields | Valid | Optional-field warning/info at most; no failure. |
| Partial KPI data | Some valid KPIs, one malformed, declared partial | `degraded` | Valid KPIs shown; invalid item path reported. |
| Malformed alert | One invalid alert, remaining sections valid | `degraded` or valid-with-warnings | Bad alert omitted; stable diagnostic emitted. |
| Empty KPI list | Valid empty list | Valid or warning according to advertised capability | No fabricated KPI. |
| No data ever received | Enabled registry entry, adapter has no observation | `unknown` / `NO_DATA` | Identity, no-data reason, retry status. |
| Last-known-good stale data | Current read unavailable/invalid; previous valid is old | `unavailable` or invalid plus stale cache | Both current failure and cache age visible. |
| Registry-disabled module | Valid configured module with `enabled=false` | Excluded from active aggregation | `REGISTRY_DISABLED`; adapter not called. |

Additional assertions:

- Unknown capability is ignored safely.
- Future timestamp beyond tolerance produces a diagnostic.
- Identity mismatch between registry and payload is rejected.
- Source conflict is not resolved by array order.
- Input fixtures are not mutated.
- No localStorage/sessionStorage/network calls occur in P02 proof tests.

## 21. Rollback Boundary

P02 rollback is file-level and non-migratory:

1. Revert/remove only the new `src/integration/**` files, their dedicated tests, and P02 docs.
2. Restore the P02 parent commit or use a dedicated rollback branch created before any later integration.
3. No data conversion or storage restoration is required because P02 writes no persistent state.
4. Existing Workforce routes, models, services, localStorage, backups, and UI remain unchanged.
5. A failed P02 must not be partially connected to the dashboard.
6. P02 closure must record the exact parent, changed files, test/build evidence, and rollback command/reference.

Rollback success means V1 behavior is byte-for-byte unaffected outside removed additive files and the working tree is clean.

## 22. Security and Non-Auth Boundary

This is not an authentication or authorization design.

Required boundary:

- Treat every adapter result as untrusted `unknown` until validated.
- Enforce payload size/depth/item-count limits in any future external transport.
- Reject executable content, raw HTML/script, command tokens, and unsafe links.
- Diagnostics and snapshots must not expose secrets, credentials, personal data, or internal filesystem paths.
- Contract data never authorizes a privileged action.
- Capability advertisement never grants permission.
- Command execution and source mutation are out of scope.
- External endpoints, certificates, CORS, identity, roles, RLS, and secret management require a separate architecture/security approval.
- P02 uses synthetic data and no network.
- Future real adapters require threat review, transport authentication decision, timeout/retry policy, and data-classification approval.

## 23. Open Questions

These questions require operator confirmation or a later approved phase:

1. Approve the orthogonal source-health and Core-freshness model?
2. Approve static Core-owned registry and no auto-discovery for P02?
3. Approve `generatedAt` as freshness authority with per-entry threshold?
4. Approve strict major compatibility and tolerant unknown optional fields?
5. Approve in-process mock/static adapter as the sole P02 proof?
6. Should P02 keep last-known-good only in memory, as recommended, or omit cache behavior entirely?
7. Should `moduleType` be the initial controlled vocabulary listed here or a namespaced string?
8. Should drill-down references be disabled entirely in P02 tests or tested only as opaque values?
9. What maximum synthetic payload size/item limits should P02 guards demonstrate?
10. After P02 verification, should Gate V2-B begin as docs-only Command Center consumption design?
11. Which transport should be evaluated later for a real pilot: staged JSON/file or local read endpoint?
12. No choice between Product/Mahak and Finance/Audit is requested or authorized at V2-A.

## 24. GATE V2-A Operator Decision

### GATE V2-A - APPROVE INTEGRATION BACKBONE CONTRACT?

Operator choices:

- **A. APPROVE AS DESIGNED**
- **B. APPROVE WITH CHANGES** - list exact changes to contract, registry, proof strategy, or scope.
- **C. HOLD / REDESIGN**

The operator is deciding whether to approve:

- Module identity shape and stability rules
- Observation envelope and timestamp ownership
- Orthogonal health/freshness vocabulary
- Generic KPI, alert, and capability contracts
- Source-of-truth and conflict behavior
- Strict major-version compatibility
- Explicit no-data/stale/unavailable/invalid/partial semantics
- Static Core-owned registry with no auto-discovery
- Source-specific adapter to normalized contract boundary
- In-process mock/static P02 proof strategy
- Read-only aggregation and diagnostics
- No real subproject integration yet
- No command execution
- No new backend, database, auth, API, storage key, route, or migration

### Current Gate Status

`GATE V2-A = PENDING_OPERATOR_DECISION`

P01 does not mark this gate approved. P02 implementation must not be created until the operator explicitly chooses option A or B.
