# Master Gem V2 - Mahak Integration Readiness and Adapter Boundary

Phase: `CORE-V2-P06`

Date: `2026-09-11`

Branch: `architecture/master-gem-v2-mahak-integration-readiness-p06`

Parent / rollback: `4561ca121ef6e78fee5a903e2634eb88799ba340`

Scope: readiness, design, and documentation only

## 1. Executive Summary

P06 confirms Product Entry / Mahak as the operator-selected V2.3 pilot candidate and defines a bounded path to a future read-only pilot without coupling Project Core to Mahak SQLite, browser storage, UI, or mutable master files.

The observed operational instance is `C:\Users\danesh\Documents\محک\web-version`. Its `data\mahak.sqlite` passed a read-only `PRAGMA integrity_check`; no WAL or SHM file was created by inspection. The database contains 16 active inventory products. All 16 have distinct `source_product_uid` values, active local ownership, and a versioned identity projection under `mahak-product-identity-v1`.

This proves a safe Mahak **source identity**, but it does not by itself approve a Project Core canonical product identity. The safe lookup identity is the complete governed tuple `sourceId + organizationId + sourceInstanceId + sourceProductUid`; no component, product code, barcode, local row ID, or display value may be used alone. Current local evidence shows the source operation and lineage at `source_committed`, while cross-system finalization and a Core-owned canonical mapping were not proved.

The preferred Core boundary is a small, atomic, versioned JSON **module-observation snapshot** produced by the pinned Mahak instance and consumed from one explicitly configured location. The fallback is a dedicated authenticated read-only HTTP module-observation endpoint following the existing Mahak identity-read service's security pattern. The generic Mahak `/api/*` surface and the identity endpoint itself are not a complete module-summary contract.

Technical recommendation: `MAHAK-GATE OPTION B - APPROVE WITH REQUIRED PREP`. The gate remains pending operator choice. No adapter, runtime code, Mahak file, source data, write-back, AI/automation, merge, or push was introduced in P06.

## 2. Operator Decisions

- `GATE V2-A = APPROVED AS DESIGNED`.
- `V2.1 BASELINE = ACCEPTED`.
- `GATE V2-B = APPROVED AS DESIGNED`.
- `P04 BASELINE = ACCEPTED WITH DOCUMENTED GAPS`.
- `GATE V2-C = PRODUCT ENTRY / MAHAK`.
- `WEEKLY-GATE = OPTION C`.
- The unique Weekly Schedule capability is retained.
- Duplicated Weekly management scope is frozen/retired for later controlled cleanup; P06 does not delete it.
- `P56 = FROZEN`.
- P06 is documentation-only and does not authorize P07.

## 3. Mahak Evidence

### Inspected locations

| Location | Observed role | Evidence status |
|---|---|---|
| `C:\Users\danesh\Documents\محک\web-version` | Operational source/data candidate; live SQLite modified on 2026-09-10 | Strongest operational evidence; must be owner-confirmed and release-pinned before P07 |
| `C:\Users\danesh\Documents\محک` | Local Git repository containing the operational candidate | `main` at `1cb5046`; three large tracked runtime files are dirty |
| `C:\Users\danesh\Documents\mahak-source-identity-activation` | Clean source-identity code/provenance repository | `main` at `3f53662`; snapshot manifest names the operational path above |
| `C:\Users\danesh\Documents\pc-source-identity-activation` | Production Center canonical mapping/BFF evidence | detached at `d4a77fd`; committed P05AO adapter exists; unrelated worktree changes are present |
| `C:\Users\danesh\Documents\web-version` | Older non-Git duplicate | File hashes/sizes differ materially; rejected as authority |

The source snapshot manifest records `C:\Users\danesh\Documents\محک\web-version` as its original operational source. Key operational-source hashes matched the manifest snapshot. The live database is intentionally excluded from that source snapshot and remains operational data, not Git source.

### Runtime and persistence evidence

- Runtime is CommonJS Node and built-in `node:sqlite`; package scripts are `start` and `check` using `--experimental-sqlite`.
- The current operational package starts `server.js` directly, binds by default to `0.0.0.0:4121`, and is not the newer source-identity proxy runtime.
- SQLite is the persisted server-side authority for operational tables.
- Browser `localStorage` remains in active use for templates, rows, entry session/workspace/workstation/export owner, settings, barcode cache, display configuration, costing, and related UI state.
- Mutable bootstrap/master inputs include `bootstrap\group-codes.js`, `bootstrap\master-group-codes.xls`, `bootstrap\stone-names.js`, and `bootstrap\master-stones.xls`.
- Operational data-package backup/restore, database backup/restore/import/export, product entry, inventory, sales sync, barcode/group/stone import, and physical-export endpoints exist.
- A client-generated AI-ready export exists with schema `mahak.ai-ready.product-export` version `1.0.0`; it contains row-level/raw/UI-derived material and is not the Core module contract.

Relevant observed endpoint families are evidence of source capability, not approval for Core consumption:

| Concern | Observed endpoint evidence | P06 interpretation |
|---|---|---|
| General/data health | `GET /api/health`, `GET /api/data-package/health` | unversioned; general health returns the DB path and dashboard, so it is too broad for Core |
| Database lifecycle | `GET /api/database/status`, `GET /api/database/export`, POST backup/restore/import/new/clear routes | contains privileged mutation routes; entire family is excluded from the Core adapter |
| Data package | GET health/backups and POST backup/restore/start-new | useful source-owned operational evidence; mutation routes remain unreachable from Core |
| Product/inventory | GET group/stones/barcodes, inventory summary/dashboard/control/detail and product lookup routes | source-internal DTOs are not frozen as a Core contract |
| Reference imports | POST group, stone, and barcode import/sync routes | confirms mutable JS/XLS/SQLite boundaries; all are out of scope |
| Sales import | GET sync runs/documents and POST preview/import | tables are currently empty; all write/import behavior is out of scope |
| Physical export | `POST /api/physical-exports/save` | persists XLS artifacts and is not a read-only Core boundary |
| Governed identity | `POST /internal/source-identity/v1/product-identity/read` in the separate identity runtime | fixed/versioned/authenticated product lookup; strong pattern, but not an aggregate module observation |

### Read-only database observations

| Evidence | Observation |
|---|---|
| SQLite integrity | `ok` |
| Inventory products | 16, all lifecycle `active` |
| Product UID coverage | 16/16 non-null and 16 distinct |
| UID ownership | 16 active and distinct |
| Identity projection | 16 distinct; max revision 1 |
| Identity schema | `mahak-product-identity-v1` |
| Identity timestamp semantic | `identity-projection-baseline-or-visible-change-utc-v1` |
| Lineage / operation | one `source_committed` lineage and one `source_committed` operation |
| Product quality in current 16 | zero missing barcode, template reference, or group code |
| `product_rows`, `barcode_records`, `templates`, `ai_documents` | 0 rows each |
| `group_codes`, `stone_names`, `app_settings` | 251, 5, and 8 rows |
| `app_meta` | 7 metadata keys inspected by name only |
| sales documents/lines/sync runs | 0 rows each |

No source identifiers, credentials, customer rows, or secret values were copied into this report.

## 4. Runtime and Data Architecture

```text
Mahak browser/UI state
  |-- localStorage (mode-dependent UI/session/draft/cache state)
  |-- client-built XLS and AI-ready JSON exports
  `-- HTTP /api/*
          |
Mahak server.js (current operational launch path)
  |-- SQLite data/mahak.sqlite
  |-- bootstrap JS/XLS import sources
  |-- images and physical exports
  `-- data-package/database backup and restore

Separate governed identity implementation
  |-- source-identity proxy/writer runtime (code repository)
  |-- versioned product identity read endpoint
  `-- Production Center canonical registry + server-only adapter
```

The live SQLite already contains the identity schema/projection, but the current operational package does not contain or launch the newer identity read runtime. Database activation therefore does not prove endpoint activation, credentials, listener state, or cross-repository finalization.

Core must consume a source-owned projection or service, never this internal topology.

## 5. Source-of-Truth Matrix

| Subject | Candidate source(s) | Authoritative? | Duplicate/mutable/persisted | Safe Core read-only path | Freshness/conflict | Confidence |
|---|---|---|---|---|---|---|
| Product inventory | live `inventory_products` | Yes for registered products in the observed instance, pending owner pin | SQLite persisted and mutable; UI/exports repeat fields | Producer-created summary only | legacy `updated_at` timezone meaning is not trusted | High locally |
| Product identity | governed tuple plus UID ownership/projection | Yes for Mahak source identity | persisted; UID governed; PC registry duplicates mapping responsibility intentionally | versioned identity service or aggregate-only snapshot | local source is committed; cross-system finalization unproved | High local / Medium end-to-end |
| Product code | `inventory_products.product_code` | Source-owned reference only | mutable; schema does not establish it as canonical; repeated in exports/UI | display/quality field only | must not be identity fallback | High |
| Barcode | `inventory_products.barcode` | Source-owned attribute | unique in current schema; mutable/reuse policy not proved; barcode cache/export duplicates | count/quality only in first pilot | no safe canonical meaning | High technical / Medium policy |
| Template | inventory `template_id`, empty `templates`, UI/built-in/localStorage definitions | Unclear | duplicated and mode-dependent; persisted references but current table empty | aggregate completeness only after producer rule is frozen | authority conflict unresolved | Medium |
| Group code | `group_codes` plus bootstrap JS/XLS | SQLite is current runtime read model; master/import ownership needs confirmation | 251 persisted rows; mutable duplicated master inputs | producer aggregate only | app metadata records import events, not a Core freshness contract | Medium |
| Stone/reference data | `stone_names` plus bootstrap JS/XLS | SQLite is current runtime read model; master/import ownership needs confirmation | 5 persisted rows; mutable duplicated master inputs | producer aggregate only | same dual-source concern as groups | Medium |
| Product row/draft | empty `product_rows`, entry sessions, `mahak-admin-rows-v4-asli` localStorage | No single authority proved | browser and server modes differ; mutable | exclude from P07 | mode and session freshness ambiguous | Low |
| Export status | physical XLS files, client AI-ready JSON, export save endpoint | No Core-ready authority | filesystem/client-produced and mutable | new atomic manifest-backed snapshot required | producer/cadence/atomicity absent | High gap confidence |
| Database status | live SQLite plus `/api/database/status`, `/api/health`, data-package health | SQLite is operational authority | persisted and mutable | health fields projected by producer; no direct DB access | inspection-time integrity only | High |
| Backup status | `backups` and `data\backups` | Backup sets are evidence, not business truth | persisted; latest inspected artifact is dated 2026-07-25 while DB changed 2026-09-10 | expose only bounded backup-age alert if owner approves | current retention/restore proof unknown | Medium |
| Sales/import status | sales tables and preview/import endpoints | Source-owned if populated | persisted, currently zero rows; import is a write boundary | `no-data` only; exclude sales KPI from P07 | no successful sync evidence | High current / Low future semantics |

SQLite/localStorage/JS/XLS duplication is tolerated only behind Mahak. It must not be reproduced in Core, and Core must never decide which duplicate wins.

## 6. Identity Analysis

| Candidate | Unique? | Stable/immutable? | Reuse risk | Portable/durable? | Verdict |
|---|---|---|---|---|---|
| Browser row index / `rowId` | Not guaranteed | No; session/export-derived | High | No | Reject |
| SQLite `inventory_products.id` / “Mahak ID” | Unique inside one DB | Not proved across restore/replacement | Medium/High | Local only | Reject as cross-system identity |
| `productCode` | Not schema-proven unique | Mutable business reference | Medium | Readable but not durable identity | Reject as canonical |
| Barcode | Unique in current table | Lifecycle/reuse/mutation policy unproved | Medium | Externally readable, not identity-safe | Reject as canonical |
| Template-derived identifier | No | Changes with template/config | High | No | Reject |
| `identity_key` | Unique locally | Derivation/migration stability not proved | Medium | Source-internal | Reject |
| `source_product_uid` alone | Unique locally and projected | Intended immutable | Low locally | Missing source/tenant context | Insufficient alone |
| Governed source tuple | 16/16 distinct under active ownership in inspected DB | Designed immutable and fenced | Low when full tuple and lineage checks are used | Yes as Mahak source identity | Accept for governed server-side source lookup |
| Production Center opaque `pcProductId` mapping | Architecture and committed adapter exist | Designed stable | Depends on finalized mapping | Separate authority | Not proved active for this Core pilot |

Display name, product code, barcode, row/session/batch/event identifier, and name similarity are never fallback identities.

## 7. Durable Identity Verdict

`EXISTING_DURABLE_MAHAK_SOURCE_IDENTITY_PROVEN; CORE_CANONICAL_PRODUCT_MAPPING_NOT YET PROVEN`

The earlier P05 possibility `NO_EXISTING_SAFE_DURABLE_PRODUCT_KEY` is superseded by current local evidence for the governed tuple. This does not create a Core canonical product ID and does not authorize per-product integration. The minimum P07 slice should remain aggregate-only so it does not depend on an unresolved Core canonical mapping.

Before any future per-product drill-down, Project Core must approve an opaque Core/PC product identity and a one-to-one mapping lifecycle, and the source-committed operation must be reconciled/finalized end-to-end.

## 8. Adapter Options

| Option | Coupling/versioning | Testability/freshness | Portability/rollback/security | P06 verdict |
|---|---|---|---|---|
| A. Existing generic read-only local HTTP API | High coupling to broad unversioned `/api/*`; `/api/health` exposes DB path/dashboard | easy to call but contract stability and auth not proved | LAN assumptions; broad attack/data surface | Reject as Core boundary |
| B. Versioned JSON module-observation export | Low when source-owned, atomic, bounded, checksummed, and schema-pinned | deterministic fixtures; explicit producer time; easy malformed/stale tests | portable; disable/delete consumer; no live DB/network dependency | **Preferred** |
| C. Existing AI-ready export | schema version exists but is row-level, client/UI-derived, broad, and not Core-shaped | testable as a file but source authority/atomic publication not proved | risks raw values, semantic overreach, and local mode drift | Reject for first pilot |
| D. SQLite read-only adapter | Maximum schema/path/file-lock coupling | can query, but freshness and migration compatibility leak into Core | poor portability; backup/restore/replacement risk | Reject |
| E. Direct JS/XLS/filesystem read | arbitrary mutable-file coupling and duplicate truth | weak validation/atomicity | path, encoding, tamper, and discovery risks | Reject |
| F. Documented source-identity service | strong versioned authenticated identity boundary | tested for one governed product lookup | good server-only pattern; operational listener not proved; no module aggregate | Accept as identity foundation/pattern, not complete P07 observation |

UI scraping, localStorage sharing, direct database sharing, unversioned arbitrary file reads, and all write-back are prohibited.

## 9. Preferred Boundary

Use one Mahak-owned atomic JSON snapshot with a frozen source schema such as `mahak-core-product-observation` major version 1. It must:

- be generated from the pinned live SQLite authority, not reconstructed from browser localStorage;
- contain aggregate observations only for P07, with no raw product row, durable source tuple, local ID, DB path, credential, or free-form AI text;
- include `contractVersion`, `sourceSchemaVersion`, `observationId`, `module`, `generatedAt`, optional trustworthy `sourceDataUpdatedAt`, health, KPIs, alerts, read-only capabilities, ownership, and partial-section metadata;
- be written to a temporary sibling, flushed, checksummed, and atomically renamed by the Mahak-owned producer;
- have one configured exact path, maximum byte size, checksum/manifest, and documented cadence;
- preserve the previous complete snapshot until the new snapshot is complete.

Core owns registry enablement, expected major version, configured path, stale policy, validation diagnostics, received time, last successful observation time, last-known-good handling, aggregation, and presentation. Mahak owns business counts, alert lifecycle, and source health evidence.

## 10. Fallback

If an atomic file cannot be operated safely, use a dedicated authenticated read-only HTTP endpoint returning the same versioned module-observation payload. It must follow the source-identity read service pattern: server-only token, loopback by default, fixed allowlisted origin/path, POST or GET semantics frozen by contract, JSON only, no redirects/CORS, bounded request/response, timeout, `no-store`, sanitized errors, and no generic route discovery.

The existing `/internal/source-identity/v1/product-identity/read` remains useful for future governed identity detail, but it cannot supply the aggregate P07 module observation and must not be called repeatedly as an improvised inventory-list API.

## 11. Core-Facing Contract

Minimum normalized V2 identity:

```json
{
  "moduleId": "product.mahak",
  "displayName": "Mahak Product Entry",
  "moduleType": "product",
  "contractVersion": "1.0",
  "environment": "local-operational"
}
```

The producer emits a P02-compatible observation; the Mahak adapter validates and normalizes it before the existing registry/aggregator can see it. Only `health.read`, `kpi.read`, and `alert.read` are in the first slice. `detail.link` is omitted until a Core-owned allowlist and canonical mapping are approved. No `command.*` capability is emitted or executable.

## 12. KPI Proposal

Source-owned, aggregate-only first set:

| Key | Definition | Current evidence basis |
|---|---|---|
| `registered_product_count` | count of registered inventory products in the pinned authority | 16 observed |
| `active_product_count` | count with source lifecycle `active` | 16 observed |
| `durable_identity_coverage_percent` | products with active governed UID ownership and projection / registered products x 100 | 16/16 observed |
| `required_metadata_complete_count` | products meeting the producer-frozen barcode + template-reference + group-code completeness rule | 16 observed under the candidate rule |

Counts must be non-negative safe integers. Percentage must be finite in `[0,100]`, with numerator/denominator or an explicit zero-denominator `no-data` semantic. These formulas are proposed for MAHAK-GATE review; current observed values are inspection evidence, not hard-coded fixtures or approved business targets.

Sales, pricing, cost, stock valuation, draft rows, AI scores, and financial/productivity claims are out of P07.

## 13. Alert Proposal

Small source-owned first set:

- `mahak.identity_coverage_gap`: at least one registered product lacks valid active source UID ownership/projection.
- `mahak.required_metadata_gap`: at least one registered product fails the approved barcode/template/group completeness rule.
- `mahak.source_contract_mismatch`: source identity or module-observation schema/lineage/duplicate invariant fails.
- `mahak.backup_age_unknown_or_stale`: latest approved complete backup exceeds the source-owner policy or no trustworthy backup time exists.

Transport unavailable, missing export, checksum failure, unsupported version, and staleness are Core diagnostics/effective states, not fabricated Mahak business alerts. Alert text is display-only and carries no executable action or arbitrary URL.

## 14. Health

Mahak source health may be `healthy`, `degraded`, `unavailable`, or `unknown` and must include an offset-aware `observedAt` plus bounded reason code. The producer may base it on successful database open, required-table/contract checks, and snapshot completeness. An expensive integrity check cadence remains a Mahak operational decision.

Transport/file availability and Core validation are separate from source health. A present file never proves a healthy source. Core computes effective state with P02 precedence and never rewrites source health.

## 15. Freshness

- `generatedAt`: required offset-aware timestamp when the complete snapshot was produced; this is Core's freshness clock.
- `sourceDataUpdatedAt`: optional, source-owned maximum of only trustworthy domain projection timestamps. The identity projection timestamp is valid for identity-visible fields only and must not be presented as all-product/inventory freshness.
- `receivedAt`: Core adapter/aggregator receipt time.
- `lastSuccessfulObservationAt`: Core runtime state updated only after full compatibility and validation success.
- Stale threshold: owned by the Core registry entry and selected after the operator approves producer cadence; P06 does not invent a duration.
- Stale: valid snapshot older than policy. Unavailable: boundary cannot return a current candidate. Both may coexist with a labeled last-known-good.
- Last-known-good: existing P02 in-memory behavior only for P07 unless separately approved; never silently shown as current.
- No data: a valid zero-count observation is `no-data`; no successful observation ever is `NO_DATA/unknown`, not stale and not healthy.

## 16. Validation and Normalization

The adapter must fail closed or degrade per P02 rules:

- require supported contract major and allowlisted Mahak source schema major;
- require exact configured `moduleId`, valid stable `observationId`, and offset-aware timestamps within clock-skew policy;
- enforce maximum file/response size, UTF-8 decoding, JSON object root, checksum/manifest, and no trailing/partial publication;
- validate health enums/reason codes, KPI keys/types/units/statuses, alert IDs/fingerprints/severity/status/timestamps, capability mode `read`, and ownership;
- reject duplicate KPI keys, duplicate alert IDs/fingerprints that conflict, duplicate product-identity counts, negative/non-finite counts, percentage outside range, impossible numerator/denominator relations, and generated times earlier than required source times;
- drop malformed optional KPI/alert items with diagnostics only when the remainder satisfies the promised capability; otherwise mark the observation invalid;
- reject unsupported major, wrong module/source identity, arbitrary URL/action/markup/command fields, raw product rows, source identifiers, DB paths, and unknown privileged capabilities;
- treat valid stale snapshots as stale, not invalid; retain invalid-current and labeled last-known-good separately.

Only the normalized V2 contract reaches the registry aggregator and Command Center.

## 17. Security and Trust

- Core is read-only; no Mahak business write, import, migration, restore, command, or transaction is reachable.
- The preferred adapter opens one exact allowlisted snapshot path read-only and does not discover directories, follow payload paths, or accept user-selected locations.
- No localStorage, raw SQLite file, source code module, Excel/JS master, image directory, DB path, credential, token, or environment secret crosses the contract.
- Snapshot fields are data, never instructions; markup/scripts and executable actions are rejected.
- HTTP fallback credentials remain server-side, separate from writer credentials, and are never copied into Core source or browser state.
- Future authentication/authorization, deployment, secret rotation, and per-product drill-down are separate approvals.
- P07 must include no-mutation evidence for both Core and Mahak business state.

## 18. Failure States

| Condition | Required behavior |
|---|---|
| Boundary unavailable | `unavailable`; show labeled LKG if any and last success time |
| Valid snapshot stale | `stale`; retain values with age/threshold label, never current |
| Missing export | `unavailable` with `MISSING_EXPORT`; no directory fallback |
| Invalid JSON/checksum/partial export | invalid current observation; preserve separate LKG |
| DB unreadable/source producer reports failure | source `unavailable` or `degraded` per contract; no Core DB retry |
| Unsupported source/contract major | reject current as `UNSUPPORTED_VERSION` |
| Duplicate/conflicting identity evidence | fail identity section closed; source contract alert/diagnostic; no guessing |
| No safe canonical identity | aggregate observation may continue if it exports no product identity; all detail/drill-down remains blocked |
| Partial KPI/alert | accept valid items only when capability promises are still met; mark degraded with item diagnostics |
| Invalid barcode | count under approved metadata rule; never repair, infer, or use as identity |
| Backup stale/unknown | bounded source alert after policy exists; does not make live product counts fresh |
| No source data ever | explicit `NO_DATA/unknown`; no zero fabrication and no LKG |

## 19. Command Center Mapping

- Module summary: Mahak availability, product coverage, and whether the observation is current, stale, degraded, or unavailable.
- KPI highlights: registered, active, durable-identity coverage, and required-metadata completeness.
- Needs attention: only active source alerts and Core transport/validation/freshness diagnostics, deterministically ranked by existing P04 rules.
- Trust display: source-generated time, Core last success, stale/LKG labels, schema compatibility, and partial sections.
- Drill-down: none in the minimum slice. Existing Mahak/PC URLs and durable identifiers do not enter the browser.
- Refresh: existing page-load/manual refresh only; no new polling, background job, command, task, or decision creation.

## 20. P07 Minimum Slice

```text
MAHAK READ-ONLY SOURCE
  -> MAHAK SNAPSHOT ADAPTER
  -> NORMALIZED V2 CONTRACT
  -> EXISTING STATIC REGISTRY / AGGREGATOR
  -> EXISTING COMMAND CENTER
```

### In scope

- one exact versioned JSON boundary and one Mahak adapter;
- aggregate health/freshness, four proposed KPIs, four bounded alerts;
- one disabled-by-default static registry entry;
- deterministic sanitized fixtures and adapter/aggregation tests;
- bounded Command Center visibility using existing generic UI;
- no mutation and rollback proof.

### Out of scope

- generic Mahak APIs, direct SQLite/localStorage/JS/XLS reads, API discovery, raw rows, per-product drill-down, stock/cost/sales/AI data, image/media transfer;
- Mahak business writes, imports, backup/restore, identity enrollment/reconciliation, schema migration, write-back, command capability;
- new route, broad dashboard redesign, polling, backend/auth/database/storage migration, AI/automation, P56, Weekly cleanup, or subproject merge.

### File impact

Expected Core impact only after gate approval: a Mahak adapter/config entry under `src/integration`, sanitized fixtures/tests under the existing test boundary, the existing Command Center generic consumer only if no source special case is required, and project-control evidence. Exact filenames must be proposed from the P07 baseline before editing. The Mahak snapshot producer/location is required prep owned by Mahak and is not modified or invented by P06.

## 21. Acceptance

P07 can pass only when:

1. MAHAK-GATE is explicitly approved and required prep is evidenced.
2. One operational source instance, owner, code release/hash, and database authority are pinned.
3. A source-owner-approved atomic versioned snapshot and sanitized fixture exist.
4. Producer cadence and Core stale policy are approved; current, stale, unavailable, invalid, partial, and no-data fixtures are deterministic.
5. Aggregate formulas and alert lifecycle are frozen; no raw product identity crosses the boundary.
6. Adapter enforces exact path, size, checksum, versions, module identity, timestamps, item shape, duplication, and no-action rules.
7. P02/P04 regressions, focused adapter tests, full test/build, and browser plan pass.
8. No source business-state mutation occurs before, during, or after reads.
9. Registry disable returns Command Center to the accepted mock baseline without data migration.
10. Mahak, Core, and Production Center worktrees remain independently governed; no subproject merge occurs.

## 22. Test Plan

- unit fixtures: valid current, valid zero/no-data, stale, future time, missing, malformed JSON, checksum mismatch, truncated write, oversize, unsupported major, wrong module/source, duplicate KPI/alert, invalid count/percent, partial sections, invalid barcode count, identity coverage mismatch, unsafe field/action/URL;
- adapter: exact allowlisted path, read-only open, no discovery/symlink escape, deterministic normalization, no input mutation, stable diagnostics, and disabled-entry behavior;
- resilience: boundary unavailable with and without LKG, invalid current plus LKG, recovery to valid current, repeated observation deduplication;
- contract: proposed KPI formulas/alerts and aggregate-only privacy invariant;
- regression: existing P02 integration backbone and P04 Command Center suites, then full project test and build;
- source assurance: before/after DB hash or source-owned read-only counters sufficient to prove the Core read did not write; no direct Core DB access is added.

## 23. Browser Plan

After P07 implementation, verify the existing Command Center at desktop 1280 px, mobile 390 px, and narrow 320 px in RTL:

- fresh, stale, unavailable, invalid-current/LKG, partial, and no-data states;
- module/KPI/alert ordering and explicit generated/last-success/stale labels;
- manual refresh and recovery without polling;
- no Mahak action, raw identifier, path, credential, or arbitrary link;
- keyboard reachability, focus visibility, no clipping/overflow/mojibake, and no new console/page errors.

No browser work is required or authorized in docs-only P06.

## 24. Rollback

P06 rollback is commit `4561ca121ef6e78fee5a903e2634eb88799ba340`.

Future P07 rollback must be additive and data-free: disable/remove the `product.mahak` Core registry entry and adapter, remove only the approved snapshot scheduling/configuration under Mahak owner control, preserve Mahak business data and identity history, and return to the accepted P02/P04 mock path. No DB restore, identity deletion, migration reversal, or source repair may be required.

## 25. Readiness Blockers

### BLOCKER before real P07 activation

- `MAHAK-GATE` has no operator selection yet.
- No approved atomic Core-facing module-observation export/endpoint exists.
- The operational Mahak repository is dirty and its current package starts the legacy server directly; the clean identity runtime release is not proved deployed at the operational path.
- The observed identity operation is `source_committed`, not proved finalized/reconciled with the independent registry; this blocks per-product identity/drill-down.

### NEEDS SMALL PREP

- confirm source owner and pin path, release/hash, database file, and launch procedure;
- freeze schema, aggregate formulas, producer cadence, snapshot atomicity/checksum, maximum size, and exact configured location;
- create sanitized deterministic fixtures and no-mutation evidence;
- approve Core freshness threshold and clock-skew policy;
- produce a current complete backup and restore verification or document an approved alternative policy;
- freeze UTF-8/Unicode normalization and Persian text test cases;
- confirm aggregate-only P07 so unresolved Core canonical mapping cannot leak into scope.

### ACCEPTABLE DEBT if isolated

- legacy localStorage and JS/XLS duplication may remain inside Mahak when the producer is the only authority presented to Core;
- empty product draft, AI document, barcode staging, template, and sales-sync tables remain outside the first pilot;
- legacy `inventory_products.updated_at` meaning remains unknown because P07 freshness uses snapshot generation and explicit projection timestamps only.

### UNKNOWN / NEEDS EVIDENCE

- named operational owner, approved backup retention/restore objective, and monitoring cadence;
- whether a current source-identity listener/token is configured and reachable in production;
- independent-registry finalization and Core/PC canonical mapping status;
- authoritative template definition while the current `templates` table is empty;
- restore/import behavior for committed UID lineage in the actual operational runbook;
- approved future drill-down surface and authorization model.

P07 remains blocked until gate selection and all `BLOCKER` items relevant to the aggregate-only slice are closed. Per-product drill-down remains separately blocked even if aggregate P07 proceeds.

## 26. Open Questions

1. Who is the named owner authorized to declare the observed Mahak path and database operationally authoritative?
2. Which exact Git release/hash and startup command must match the active instance?
3. Will Mahak publish the preferred atomic JSON snapshot, or must the fallback HTTP module endpoint be authorized?
4. What publication cadence and Core `staleAfterSeconds`/clock skew are operationally correct?
5. Are the four proposed KPI formulas and four alert categories the intended management scope?
6. What is the approved complete-backup cadence and latest restore-test evidence?
7. Has the `source_committed` enrollment been finalized in the independent registry, and is the 16-product mapping reconciled?
8. Is P07 explicitly aggregate-only, with per-product drill-down deferred?
9. Which source defines templates when the SQLite `templates` table is empty?
10. What source-owned timestamp, if any, is trustworthy for non-identity product/business changes?

## 27. MAHAK-GATE Package

### A. APPROVE P07 READ-ONLY PILOT

Approve only if Project Core accepts the preferred boundary and determines the identified prep already has sufficient external evidence. This authorizes a separately scoped aggregate-only P07 implementation; it does not authorize write-back, per-product drill-down, AI/automation, P56, or Mahak business mutation.

### B. APPROVE WITH REQUIRED PREP - TECHNICAL RECOMMENDATION

Approve the aggregate-only direction conditionally. Before P07 code begins, require: authoritative source/release pin, clean deploy provenance, atomic versioned snapshot plus fixture, formulas/alerts, cadence/stale policy, current backup/restore evidence, and explicit deferral of per-product drill-down until registry finalization/canonical mapping is proved.

### C. HOLD / BLOCK UNTIL READINESS GAPS RESOLVED

Keep P02/P04 mock-only and perform no real adapter work. Choose this if source ownership, release state, snapshot producer, backup posture, or identity reconciliation cannot be evidenced safely.

`MAHAK-GATE = PENDING_OPERATOR_DECISION`

`TECHNICAL_RECOMMENDATION = OPTION B`

`REAL_ADAPTER_AUTHORIZED = NO`

`MAHAK_WRITE_BACK_AUTHORIZED = NO`

`AI_AUTOMATION_AUTHORIZED = NO`

`P56 = FROZEN`
