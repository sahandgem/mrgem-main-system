# Master Gem V2 Roadmap and Phase Definition

## 1. Purpose

This document defines the official planning boundary for Master Gem V2. It converts the closed and stable V1 baseline into a gated sequence for integration, management visibility, one real pilot, and only then intelligence and automation.

This phase is documentation and planning only. It does not authorize runtime implementation, route changes, storage replacement, database migration, backend/auth/API work, prototype integration, subproject merge, or a broad UI redesign.

## 2. Locked Baseline

- Stable V1 reference: `7d39d79c2e6de73581d51f7cdb3c7aebe0f194d4`.
- V1 is closed and remains the rollback and behavioral reference for V2.
- Existing rollback branches must be retained.
- P56 remains frozen.
- Product/Mahak and Finance/Audit remain isolated subprojects by default.
- Every V2 implementation phase must be phase-scoped, reversible, verified, and separately approved.

## 3. Official Strategic Sequence

Master Gem V2 must proceed in this order:

1. **V2.1 Integration Backbone**
2. **V2.2 Command Center**
3. **V2.3 First Real Subproject Integration**
4. **V2.4 Intelligence and Automation Layer**

Skipping a layer requires explicit Project Core approval. Planning a later layer does not authorize implementing it.

## 4. V2.1 Integration Backbone

### Objective

Define a stable, versioned boundary through which Core can understand what a module exposes and its current state without learning how that module performs its internal business logic.

### Contract Concepts

- Module identity and ownership
- Health and operational status
- Last sync and last update timestamps
- KPI summary
- Alerts, issues, and stale conditions
- Supported actions and capabilities
- Contract and version compatibility
- Source-of-truth ownership
- Audit and trace references where relevant

### Architectural Rule

Core knows **what** a module exposes and **what state** it is in. Core must not own or reach into **how** the module implements its business rules.

### Deliverables

- Conceptual `ModuleDescriptor` and `ModuleStatusSnapshot` contracts
- Integration registry rules
- Adapter boundary and ownership matrix
- Compatibility/version policy
- Synthetic fixtures for a read-only proof
- Failure, stale-state, and unsupported-version behavior
- Explicit rollback point

### Acceptance Criteria

- At least one synthetic module can be represented through the contract.
- No subproject source is imported or modified.
- Source-of-truth ownership is explicit.
- Unsupported or mismatched versions fail visibly.
- Health, KPI, alert, capability, and timestamp fields are distinguishable.
- The proof can be removed without data migration or V1 behavior change.

### Rollback Boundary

The Integration Backbone must remain isolated behind its registry/contracts. Rollback removes the new contract/adapter layer and restores the V1 baseline without rewriting module data.

### Non-goals

- Replacing current storage
- Building a large backend
- Database migration
- Auth or API architecture
- Direct Product/Mahak or Finance/Audit integration
- Command Center implementation
- AI or automation execution

## 5. V2.2 Command Center

### Objective

Create a management consumption layer that answers what needs attention now while consuming only the approved V2.1 contract.

### Required Management Views

- Needs attention today
- Module health
- Active alerts and issues
- Pending decisions
- Priority actions
- KPI exceptions
- Stale and overdue signals
- Drill-down boundaries
- Action and decision trace

### Consumption Rule

The Command Center must consume Integration Backbone contracts or read models. It must not directly import subproject internals, query private module storage, or reimplement module business logic.

### Deliverables

- Command Center read model
- Card and signal map
- Attention and decision queue contract
- Module-health presentation contract
- KPI exception and stale-state policy
- Drill-down boundary
- Action/decision trace contract
- Synthetic-data visual verification plan

### Acceptance Criteria

- Every displayed signal has a source module and timestamp.
- Alerts, decisions, actions, and informational KPIs are visually and semantically distinct.
- Drill-down stops at the approved module boundary.
- No direct dependency on Product/Mahak or Finance/Audit internals exists.
- V1 visual and behavioral baseline remains available.
- Rollback is possible without data migration.

### Rollback Boundary

Command Center screens/read models must be isolated so they can be reverted independently while the V2.1 contract remains intact.

### Non-goals

- Full module redesign
- Prototype merge without approval
- Real write actions
- New auth/database/backend
- Cross-module automation
- Replacing existing Workforce pages

## 6. V2.3 First Real Subproject Integration

### Gate Principle

Exactly one pilot may be selected only at Gate V2-C. This roadmap analyzes both candidates but selects neither.

### Candidate A: Product Entry / Mahak

| Dimension | Assessment |
|---|---|
| Management value | High visibility into product intake quality, export readiness, duplicate risk, media/workbench status, and inventory readiness. |
| Likely Core data | Normalized product snapshot, import batch status, duplicate/validation warnings, export readiness, media/workbench summaries, source references. |
| Source of truth | Master Gem Core Product contract is authoritative; Mahak is an export/integration connector, not the mother model. |
| Main risks | Duplicate products, barcode/product-code confusion, legacy format coupling, weight/wage/group/stone quality, export compatibility. |
| Complexity | Medium to high because extensive contracts exist, but legacy normalization and connector safety remain significant. |
| Why it may be a good first pilot | Prior Product contracts, staging, validation, duplicate, dry-run, and review boundaries provide substantial preparation. |
| Why it may be a poor first pilot | Legacy data quality and Mahak format constraints can turn a small pilot into an import/migration project. |

### Candidate B: Finance / Audit

| Dimension | Assessment |
|---|---|
| Management value | Very high visibility into liquidity, cash-in/cash-out, approvals, receipts, bank matching, installments, and financial pressure. |
| Likely Core data | Financial event summaries, receipt/bank match status, approval queue, liquidity signals, risk/confidence, and audit references. |
| Source of truth | Future Core Financial Event contract is authoritative; audit-app remains an isolated subproject and evidence source. |
| Main risks | Sensitive financial data, approval correctness, role/RLS boundaries, auditability, duplicate transactions, bank format variation. |
| Complexity | High because security, authorization, financial correctness, and rollback requirements are strict. |
| Why it may be a good first pilot | It offers immediate management value and a strong Command Center signal set. |
| Why it may be a poor first pilot | Its security and financial correctness consequences make it less forgiving as the first integration proof. |

### Selection Inputs Required at V2-C

- Verified V2.1 contract and registry
- Approved V2.2 consumption boundary
- Named source-of-truth owner
- Synthetic pilot dataset
- Read-only or tightly bounded first capability
- Risk and rollback assessment
- Explicit Project Core choice of Product/Mahak, Finance/Audit, or defer

### Deliverables

- One approved pilot charter
- One adapter boundary
- One source ownership map
- Synthetic and non-production validation
- Compatibility and failure tests
- Read-only Command Center projection
- Verification report and closure decision

### Acceptance Criteria

- Only one pilot is active.
- The subproject remains independently operable and isolated.
- Core receives only the approved contract.
- No unresolved source-of-truth ambiguity exists.
- Failure and rollback do not corrupt either side.
- Audit evidence demonstrates what entered Core and why.

### Rollback Boundary

Disable/remove the pilot adapter and its registry entry, preserve source data, and return the Command Center to unavailable/stale status without destructive migration.

### Non-goals

- Full subproject merge
- Broad data migration
- Two simultaneous pilots
- Replacing subproject storage/auth
- Cross-module auto actions

## 7. V2.4 Intelligence and Automation Layer

### Objective

Add decision support only after one pilot is verified and its data contract, confidence behavior, ownership, and audit trail are proven.

### Future Capabilities

- Anomaly detection
- Priority scoring
- Suggested actions
- Task proposals
- Management summaries
- Cross-module correlations
- Event and schedule triggers
- n8n or equivalent orchestration boundary
- Decision support and explainable recommendations

### Safety Rules

- No V2.4 implementation before Gate V2-D.
- High-impact actions remain approval-gated.
- AI output must include source, confidence, reason, risk flags, and audit reference.
- Conflict, low-confidence, sensitive financial, destructive, migration, auth, and source-of-truth changes are never automatic.
- Automation must be reversible and rule/version traceable.

### Deliverables

- Intelligence discovery report
- Confidence and action-safety mapping for the verified pilot
- Read-only suggestion pipeline
- Human review boundary
- Audit and rollback design

### Acceptance Criteria

- Inputs come only from verified contracts.
- Suggestions are explainable and traceable.
- Auto-action scope, if any, is separately approved and low risk.
- Human review is mandatory for sensitive or uncertain cases.

### Non-goals

- General autonomous control
- Unbounded cross-module writes
- AI-generated source-of-truth changes
- Premature n8n production automation

## 8. Decision Gates

| Gate | Decision | Required evidence | Default without approval |
|---|---|---|---|
| V2-A | Approve Integration Backbone contract | V1 baseline, ownership, contract, compatibility, synthetic proof and rollback design | Stop before implementation |
| V2-B | Approve Command Center scope | V2.1 accepted, read model, drill-down boundary, synthetic UI verification and rollback | No Command Center implementation |
| V2-C | Select exactly one pilot | Candidate comparison, source ownership, risk, adapter charter, synthetic data and rollback | Defer; no pilot |
| V2-D | Approve intelligence/automation | One verified pilot, confidence evidence, audit trail, human boundary and action-safety matrix | Suggestions/automation remain unimplemented |

## 9. Future Phase Map

1. `CORE-V2-P01 - Integration Backbone Discovery & Contract Design`
2. `CORE-V2-P02 - Integration Registry / Adapter Baseline`
3. `CORE-V2-P03 - Command Center Data Consumption Design`
4. `CORE-V2-P04 - Command Center Implementation`
5. `CORE-V2-P05 - Pilot Subproject Selection Gate`
6. `CORE-V2-P06 - First Real Subproject Adapter / Integration`
7. `CORE-V2-P07 - First Integration Verification & Closure`
8. `CORE-V2-P08 - Intelligence Layer Discovery`
9. `CORE-V2-P09+ - only after explicit approval`

Each implementation-bearing phase must include discovery/readiness, bounded implementation, verification, closure, an explicit rollback point, and a Project Core report.

## 10. Governance and Protection Rules

- V1 baseline `7d39d79` remains the stable reference.
- Rollback branches are retained until a separate retirement decision.
- V2 changes are small, phase-scoped, reversible, and approval-gated.
- Subprojects remain isolated by default.
- No direct subproject merge is authorized.
- No storage replacement, large backend, database migration, auth/API architecture, P56 resume, prototype merge, or full redesign is authorized.
- Module contracts expose state and capability, not internal implementation.
- Every signal must have source, time, ownership, confidence/risk when applicable, and an audit reference where a decision/action is involved.
- Project Core owns gate decisions and pilot selection.

## 11. Current V2 State

- V1: closed and stable.
- V2 planning: started by this roadmap phase.
- Active phase: `CORE-V2-PLAN-P00`.
- Runtime implementation: not started.
- Pilot selection: not made.
- P56: frozen.
- Product/Mahak and Finance/Audit: isolated.
- Next permitted action: review this roadmap and decide Gate V2-A.

## 12. Final Decision Boundary

This document defines sequence and constraints. It does not approve V2.1 implementation. The next Project Core decision is whether to authorize `CORE-V2-P01` as a contract-discovery phase under Gate V2-A.
