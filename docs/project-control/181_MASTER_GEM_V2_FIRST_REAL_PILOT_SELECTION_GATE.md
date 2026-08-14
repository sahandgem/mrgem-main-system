# Master Gem V2 First Real Pilot Selection Gate

**Phase:** CORE-V2-P05
**Type:** discovery, comparison, and documentation only
**Starting baseline:** `d096359968f099e17dc362d3f31dbe58f7db195a`
**Review branch:** `review/master-gem-v2-pilot-selection-p05`
**Gate:** `V2-C = PENDING_OPERATOR_DECISION`
**Real integration:** not started

## 1. Executive Summary

P05 compares exactly two candidates for the first real V2.3 pilot:

- Product Entry / Mahak
- Finance / Audit

Both offer strong management value, but neither is authorized for integration by this report. Product Entry / Mahak has the stronger current technical evidence: an active local implementation shape, product-domain contracts, import-safety design, and plausible read-only export boundary. Its exact authoritative instance, freshness policy, Core-ready export contract, and fixture still require a readiness phase.

Finance / Audit has potentially higher direct executive value through liquidity and approval signals, but the local source repository, executable schema, source owner, freshness behavior, test fixtures, and safe read boundary were not verified in P05. Those facts remain `UNKNOWN / NEEDS READINESS CHECK`.

**Technical recommendation:** `PRODUCT ENTRY / MAHAK`
**Operator selection:** `NONE`
**Gate V2-C:** `PENDING_OPERATOR_DECISION`

## 2. Why One Pilot

One pilot is required to prove that the V2.1 Integration Backbone and V2.2 Command Center can consume a real source without special-case Core logic. Running both candidates would double source ownership, transport, compatibility, security, and rollback questions before the first contract is proven.

The first pilot must therefore remain:

- read-only;
- bounded to one source module;
- normalized through the P02 adapter and validation boundary;
- independently disableable;
- free of source write-back;
- reversible without database or business-data repair.

## 3. Selection Criteria

The comparison uses exactly these criteria:

1. management value;
2. data readiness;
3. source-of-truth clarity;
4. integration-boundary clarity;
5. read-only feasibility;
6. freshness/update clarity;
7. KPI usefulness;
8. alert usefulness;
9. operational criticality;
10. source-mutation risk;
11. coupling risk;
12. need for backend/database/auth changes;
13. testability;
14. rollback simplicity;
15. external or unstable dependencies;
16. data-quality uncertainty;
17. documentation maturity;
18. ability to prove the V2 contract with small scope;
19. reusable-pattern value;
20. implementation complexity.

## 4. Rating Method

| Rating | Meaning |
| --- | --- |
| `STRONG` | Existing evidence supports the criterion with a small and bounded remaining gap. |
| `ACCEPTABLE` | Feasible with explicit preparation and ordinary pilot controls. |
| `WEAK` | Material ambiguity, coupling, or risk must be resolved first. |
| `UNKNOWN` | Current evidence cannot support a reliable conclusion. |

Ratings describe evidence, not implementation approval.

## 5. Candidate A - Product Entry / Mahak

### Evidence

- Project-control documents define Product, barcode, group, stone, duplicate detection, import validation, workbench status, export warning, staging, review, and rollback concepts.
- Report 75 rates much of Product Import architecture as ready for design-lab or isolated prototype work, while explicitly denying real implementation authority.
- Read-only inspection found local `mahak-web-version` implementations, including `package.json`, `server.js`, SQLite schema material, a `check` script, and multiple isolated test/release copies.
- Multiple local copies also make the authoritative active source instance unclear. No copy was declared authoritative by P05.

### Plausible authoritative data

Subject to source-owner confirmation, a product pilot could expose normalized read-only summaries of:

- product identity and lifecycle status;
- product code and barcode quality;
- group and stone-reference completeness;
- workbench or operation-queue state;
- duplicate/import warnings;
- media or export-readiness status.

These are candidate outputs, not a claim that an approved Core-facing export already exists.

### Core-facing KPI and alert candidates

- registered product count and status distribution;
- pending workbench items;
- products blocked by validation or duplicate risk;
- missing barcode/group/stone/media indicators;
- Mahak export-ready versus blocked counts;
- stale export, schema mismatch, or source-unavailable alerts.

No KPI formula is approved by P05.

### Boundary and risk assessment

- Source-of-truth owner: the selected Mahak/Product source module, once its authoritative instance is explicitly pinned.
- Core authority: registry policy, validation diagnostics, freshness assessment, aggregation, and presentation only.
- Smallest plausible read path: a versioned, atomic, read-only JSON export or snapshot produced by the authoritative source and consumed through a source-specific adapter.
- Direct SQLite/database reads, source-internal imports, shared localStorage, UI scraping, arbitrary filesystem discovery, and write-back are rejected.
- The active-copy ambiguity, schema/file coupling, source freshness, and stable record identity are current blockers.
- Existing check/release evidence improves testability, but no sanitized Core-ready fixture was verified.
- Safe rollback is strong if the pilot is additive: disable the registry entry and adapter, retain source data untouched, and return to the mock baseline.

### Readiness

`NEEDS SMALL PREP`

Required preparation is precise but mandatory: pin one authoritative source, freeze a versioned export contract, define timestamps and freshness ownership, create sanitized fixtures, map stable identities, and prove no source mutation.

## 6. Candidate B - Finance / Audit

### Evidence

- Project-control documents define a conceptual Financial Event model, receipt/bank mapping, payment and approval states, liquidity signals, review roles, validation, and audit boundaries.
- The source integration map retains `audit-app` as an isolated subproject and forbids direct merge, auth/database reuse, and RLS import.
- No local `audit-app` directory, executable source contract, fixture, or authoritative financial snapshot was located in the reviewed Documents evidence. This does not prove absence; it means source readiness is unverified in P05.

### Plausible authoritative data

Only after source verification, a finance pilot could expose normalized read-only summaries of:

- cash-in and cash-out;
- overdue and upcoming obligations;
- expected receipts and unpaid expenses;
- pending manager approvals;
- receipt/bank mismatches;
- liquidity pressure and source reliability.

These are documented concepts, not verified executable outputs.

### Boundary and risk assessment

- Source-of-truth owner: `UNKNOWN`; must be named and evidenced before a pilot.
- Smallest plausible future path: a versioned, sanitized, read-only financial snapshot with explicit currency, time range, aggregation version, approval state, and audit reference.
- Incorrect aggregation, currency/time-window mismatch, duplicate bank transactions, incomplete approvals, and sensitive-data exposure can produce materially misleading management signals.
- Reusing audit-app authentication, RLS, database tables, or internal services is prohibited.
- Read-only feasibility, freshness, fixtures, and rollback are conceptually possible but not demonstrated against a verified source.
- No financial automation, installment confirmation, approval action, or write-back is authorized.

### Readiness

`UNKNOWN`

The exact evidence needed is: repository/source location, source owner, current schema/export shape, currencies and aggregation rules, timestamp/freshness contract, redaction policy, read-only transport, sanitized fixtures, test command, and disable/rollback proof.

## 7. Side-by-Side Comparison

| # | Criterion | Product Entry / Mahak | Finance / Audit | Evidence-based note |
| ---: | --- | --- | --- | --- |
| 1 | Management value | `STRONG` | `STRONG` | Product supports operational flow; Finance supports direct liquidity oversight. |
| 2 | Data readiness | `ACCEPTABLE` | `UNKNOWN` | Mahak runtime shape exists; Finance source was not verified. |
| 3 | Source-of-truth clarity | `WEAK` | `UNKNOWN` | Mahak has multiple local copies; Finance owner/source is unverified. |
| 4 | Integration-boundary clarity | `ACCEPTABLE` | `WEAK` | Product export boundary is documented; Finance remains conceptual. |
| 5 | Read-only feasibility | `ACCEPTABLE` | `UNKNOWN` | Product can plausibly use versioned export; Finance transport is unverified. |
| 6 | Freshness/update clarity | `WEAK` | `UNKNOWN` | Neither has an approved Core-facing freshness contract. |
| 7 | KPI usefulness | `STRONG` | `STRONG` | Both can supply useful management summaries after formula approval. |
| 8 | Alert usefulness | `STRONG` | `STRONG` | Product quality and liquidity alerts both fit Command Center attention. |
| 9 | Operational criticality | `STRONG` | `STRONG` | Both matter operationally; Finance has higher consequence of error. |
| 10 | Source-mutation risk | `ACCEPTABLE` | `WEAK` | Export-only Product path can isolate writes; Finance data is sensitive. |
| 11 | Coupling risk | `WEAK` | `WEAK` | Mahak file/SQLite and Finance auth/RLS/database internals must remain hidden. |
| 12 | Backend/database/auth change need | `ACCEPTABLE` | `WEAK` | Product file boundary may avoid changes; Finance evidence cannot prove this. |
| 13 | Testability | `ACCEPTABLE` | `UNKNOWN` | Mahak has check/test-copy evidence but lacks a Core fixture; Finance fixture unknown. |
| 14 | Rollback simplicity | `STRONG` | `ACCEPTABLE` | Both could be additive, but only Product has a concrete plausible path. |
| 15 | External/unstable dependencies | `ACCEPTABLE` | `UNKNOWN` | Mahak is local but copy/file stability needs control; Finance dependencies unknown. |
| 16 | Data-quality uncertainty | `WEAK` | `UNKNOWN` | Product duplicate/identity issues are known; Finance data quality is not evidenced. |
| 17 | Documentation maturity | `STRONG` | `ACCEPTABLE` | Product import governance is more extensive; Finance contracts are conceptual. |
| 18 | Small-scope V2 proof | `STRONG` | `ACCEPTABLE` | Product status/export snapshot can prove the generic contract with fewer trust claims. |
| 19 | Reusable-pattern value | `STRONG` | `STRONG` | Either can validate future source adapters, freshness, KPI, and alert contracts. |
| 20 | Implementation complexity | `ACCEPTABLE` | `WEAK` | Finance needs stronger security, aggregation, and audit preparation. |

## 8. Command Center Fit

| Surface | Product Entry / Mahak | Finance / Audit |
| --- | --- | --- |
| Module Summary | Product source availability, lifecycle, and export readiness | Financial source availability, coverage window, and approval state |
| Needs Attention | Duplicate, validation, missing metadata, export blocked | Liquidity pressure, overdue, mismatch, pending approval |
| KPI Highlights | Counts and ratios with explicit product scope | Cash values with currency, period, and aggregation version |
| Health/Freshness | Export timestamp and source check | Snapshot period, ledger cutoff, and source health |
| Alerts | Product-quality and process warnings | Financial-risk and data-integrity warnings |
| Drill-down | Approved Product/Mahak detail reference later | Approved Finance/Audit detail reference later |
| Reliability/Trust | Identity, completeness, source-copy authority | Reconciliation, approval, currency, period, and redaction trust |

Both can fit the generic P02/P04 surfaces without special-case Core logic only if they produce the normalized module contract. Product/Mahak currently has the stronger evidence for doing so with a small first slice.

## 9. Integration-Boundary Comparison

### Product Entry / Mahak

Preferred future shape:

```text
AUTHORITATIVE MAHAK/PRODUCT INSTANCE
  -> VERSIONED ATOMIC READ-ONLY EXPORT
  -> PRODUCT SOURCE ADAPTER
  -> P02 VALIDATION/NORMALIZATION
  -> COMMAND CENTER
```

### Finance / Audit

Possible future shape after readiness evidence:

```text
AUTHORITATIVE FINANCIAL SOURCE
  -> VERSIONED SANITIZED READ-ONLY SNAPSHOT
  -> FINANCE SOURCE ADAPTER
  -> P02 VALIDATION/NORMALIZATION
  -> COMMAND CENTER
```

Rejected for both: direct database sharing, shared subproject localStorage, importing source internals, UI scraping, unversioned arbitrary file reads, and write-back.

## 10. Source-of-Truth Comparison

- Product/Mahak has observable local implementations, but the authoritative active copy and stable export owner are not pinned. Status: `WEAK`.
- Finance/Audit has conceptual ownership rules but no verified executable source location or owner in P05 evidence. Status: `UNKNOWN`.
- Core remains authoritative only for registry, validation, freshness policy, aggregation, and display state. It must not become the source of product or financial business truth.

## 11. Read-Only Feasibility

Product/Mahak can plausibly begin with a bounded versioned export artifact and no source mutation. This remains a design conclusion until P06 proves the producer, path, atomicity, schema, checksum, fixture, and failure behavior.

Finance/Audit read-only feasibility cannot be confirmed until source access, security/redaction, aggregation semantics, and snapshot behavior are evidenced.

## 12. Data Readiness

| Candidate | Classification | Required evidence |
| --- | --- | --- |
| Product Entry / Mahak | `NEEDS SMALL PREP` | Canonical source instance, export schema/version, identity mapping, generatedAt/business timestamp, fixture, freshness thresholds, source owner |
| Finance / Audit | `UNKNOWN` | Repository/source, schema/export, source owner, currency/period rules, approval semantics, redaction, transport, fixture, test and rollback evidence |

No production data was opened or copied during P05.

## 13. Risk Comparison

### Product/Mahak largest risks

- selecting the wrong local copy as authority;
- coupling Core to SQLite, server internals, or arbitrary paths;
- unstable product identity or duplicate mapping;
- stale or partially written export;
- mixing product identity with inventory truth;
- treating design-only import policies as executable guarantees.

### Finance/Audit largest risks

- materially incorrect aggregation or currency/time-window interpretation;
- exposing sensitive financial information;
- coupling to auth/RLS/database internals;
- stale or incomplete approval state;
- duplicate or unmatched bank/receipt records;
- presenting unverified liquidity as trusted management truth.

## 14. Testing and Rollback

Any selected pilot must provide:

- sanitized deterministic fixtures;
- valid, stale, unavailable, malformed, unsupported-version, partial, and source-conflict cases;
- identity and timestamp validation;
- no-mutation assertions;
- adapter disable behavior;
- P02 and P04 regression tests;
- full test/build and bounded browser verification;
- source-unavailable behavior with explicit last-known-good labeling;
- rollback by removing or disabling the additive registry/adapter path.

No data migration or source repair may be required for rollback.

## 15. Readiness Gaps

### Product/Mahak

- Which local instance/release is authoritative?
- Who owns and publishes the Core-facing export?
- What stable product identity is safe across exports?
- What exact fields and compatibility version are frozen?
- Which timestamp represents business freshness?
- Is export generation atomic and idempotent?
- What sanitized fixture proves the contract?
- Which existing detail surface, if any, is approved for drill-down?

### Finance/Audit

- Where is the current source repository/runtime?
- Who owns financial truth and approval truth?
- What is the executable schema or export contract?
- How are currency, period, cash basis, and aggregation version represented?
- How are sensitive fields redacted and access bounded?
- What test fixture and reconciliation evidence exist?
- Can the source publish a read-only snapshot without auth/database redesign?
- What disables the adapter and proves rollback?

## 16. Technical Recommendation - Not Selection

`TECHNICAL_RECOMMENDATION = PRODUCT ENTRY / MAHAK`

Reasons:

- stronger executable local evidence;
- more mature product/import governance documentation;
- a smaller plausible read-only export slice;
- lower consequence of an initially narrow status/count pilot than financial aggregation;
- stronger fixture and rollback potential;
- high value as a reusable pattern for later Finance integration.

This recommendation does not select the pilot and does not authorize P06.

## 17. Why Finance / Audit Should Wait

Finance/Audit should wait because its source location, ownership, runtime shape, aggregation semantics, redaction, freshness, and fixture evidence are not verified. Its management value is strong, but incorrect financial summaries have a higher decision cost. Advancing it now would either invent facts or force premature backend/auth/database choices.

## 18. What Could Change the Recommendation

The recommendation should be revisited if:

- Product/Mahak cannot identify one authoritative source or safe versioned export;
- Product identity cannot be made stable without source mutation;
- Finance/Audit provides a versioned sanitized snapshot, named owner, deterministic fixtures, approved aggregation rules, and a demonstrably read-only boundary;
- either candidate cannot meet P02 compatibility, freshness, failure-isolation, and rollback rules;
- the operator determines that both require significant preparation and selects defer.

## 19. P06 Boundary If Mahak Is Selected

P06 must first be **Mahak integration-readiness and adapter-boundary discovery**, not implementation, because open questions remain. It should pin the authoritative source, define a versioned read-only export contract, select stable identity and timestamps, create sanitized fixtures, specify freshness and failure behavior, define adapter disable/rollback, and produce an implementation gate.

P06 must not read the database directly, modify Mahak, add write-back, change Core UI/routes, or activate real data.

## 20. P06 Boundary If Finance Is Selected

P06 must first be **Finance/Audit integration-readiness and adapter-boundary discovery**, not implementation. It should locate and verify the source, name owners, freeze currency/period/aggregation semantics, define a sanitized read-only snapshot, establish authorization/redaction boundaries, create reconciliation fixtures, and produce an implementation gate.

No financial automation, approval action, write-back, auth/RLS reuse, or database sharing is allowed.

## 21. Defer Behavior

If Gate V2-C selects defer:

- no real adapter is created;
- P02/P04 remain mock-only baselines;
- both subprojects remain isolated;
- no P06 integration phase begins;
- the operator may commission a separate readiness-evidence phase without implementation authority.

## 22. Non-Goals

P05 does not:

- select a pilot automatically;
- integrate or modify either subproject;
- add an adapter, network call, backend, database, auth, API, storage key, route, or UI;
- add AI, automation, command execution, approval action, or write-back;
- start P06;
- resume P56;
- change Core runtime or the accepted P04 gaps;
- merge or push any branch.

## 23. GATE V2-C Package

### GATE V2-C - SELECT FIRST REAL V2.3 PILOT

#### A. SELECT PRODUCT ENTRY / MAHAK

- Management value: strong operational visibility into product-entry quality and readiness.
- Risk: source-copy ambiguity, identity quality, file/SQLite coupling, and freshness.
- Preparation: small but mandatory readiness/adapter-boundary phase.
- Next safe phase: Mahak readiness and versioned read-only export contract; no implementation yet.

#### B. SELECT FINANCE / AUDIT

- Management value: strong liquidity, obligation, approval, and reconciliation visibility.
- Risk: sensitive data, incorrect aggregation, unknown source/runtime, and auth/RLS coupling.
- Preparation: significant evidence and governance work; current readiness is unknown.
- Next safe phase: Finance/Audit source and adapter-boundary readiness; no implementation yet.

#### C. DEFER REAL INTEGRATION

- Management value: preserves current verified mock baseline while evidence is improved.
- Risk: delays proof with operational data but avoids premature coupling.
- Preparation: obtain missing source, ownership, fixture, freshness, and rollback evidence.
- Next safe phase: a docs/discovery readiness package only.

`GATE V2-C = PENDING_OPERATOR_DECISION`

The operator must explicitly choose A, B, or C. P05 does not choose on the operator's behalf.
