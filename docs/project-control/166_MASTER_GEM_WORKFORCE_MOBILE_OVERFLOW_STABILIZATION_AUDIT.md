# Master Gem Workforce Mobile Overflow Stabilization Audit

## 1. Purpose

Audit-only diagnosis of horizontal overflow on Dashboard and Operational History. This phase measures the failure, traces the DOM/CSS propagation chain and proposes a future minimal repair. It does not change source, UI, CSS, routes, storage, tests or packages.

## 2. Baseline

| Item | Verified value |
|---|---|
| Starting branch | `hardening/master-gem-v1-critical-route-browser-smoke-p01` |
| Starting commit | `b7d89a18fbc88b01f1139a96eb51dc4a581c93e0` |
| Audit branch | `hardening/master-gem-v1-mobile-overflow-audit-p01` |
| Local `main` | `e42b32027cf642a1d1dc369786490a7427d16034` |
| Observed `origin/main` | `b16b1a020168516b2f8ad3e0bcd41e1193c8a824` |
| Working tree at preflight | clean |
| `npm.cmd test` | PASS; exit 0; existing Node `--experimental-loader` warning only |
| `npm.cmd run build` | PASS; exit 0; 1,751 modules; no build warning |
| Browser capability | `RECORDER_ONLY_AVAILABLE`; Codex in-app browser with DOM/computed-style inspection |
| Prior smoke | Dashboard 1112px and Operational History 729px at 390px; Employees passed at 390px |

No push, fetch, pull, merge, rebase or cherry-pick was performed. The local and observed remote baselines stayed unchanged.

## 3. Viewport Matrix

The requested viewport width includes the browser scrollbar. `clientWidth` is therefore 15px smaller on long pages in this recorder. Overflow is reported against `documentElement.clientWidth`, as required by the future acceptance assertion.

| Route | Requested viewport | clientWidth | document scrollWidth | body scrollWidth | Overflow | Horizontal scroll | Load | RTL / `fa` | Mojibake | Console/page errors |
|---|---:|---:|---:|---:|---:|---|---|---|---:|---:|
| Dashboard | 320 | 305 | 1112 | 1112 | 807 | YES | PASS | PASS | 0 | 0 |
| Dashboard | 360 | 345 | 1112 | 1112 | 767 | YES | PASS | PASS | 0 | 0 |
| Dashboard | 390 | 375 | 1112 | 1112 | 737 | YES | PASS | PASS | 0 | 0 |
| Dashboard | 430 | 415 | 1112 | 1112 | 697 | YES | PASS | PASS | 0 | 0 |
| Dashboard | 1280 | 1265 | 1333 | 1333 | 68 | YES | PASS | PASS | 0 | 0 |
| Operational History | 320 | 305 | 729 | 729 | 424 | YES | PASS | PASS | 0 | 0 |
| Operational History | 360 | 345 | 729 | 729 | 384 | YES | PASS | PASS | 0 | 0 |
| Operational History | 390 | 375 | 729 | 729 | 354 | YES | PASS | PASS | 0 | 0 |
| Operational History | 430 | 415 | 729 | 729 | 314 | YES | PASS | PASS | 0 | 0 |
| Operational History | 1280 | 1265 | 1265 | 1265 | 0 | NO | PASS | PASS | 0 | 0 |
| Employees control | 320 | 305 | 320 | 320 | 15 | YES | PASS | PASS | 0 | 0 |
| Employees control | 360 | 345 | 345 | 345 | 0 | NO | PASS | PASS | 0 | 0 |
| Employees control | 390 | 375 | 375 | 375 | 0 | NO | PASS | PASS | 0 | 0 |
| Employees control | 430 | 415 | 415 | 415 | 0 | NO | PASS | PASS | 0 | 0 |
| Employees control | 1280 | 1265 | 1265 | 1265 | 0 | NO | PASS | PASS | 0 | 0 |

An additional 1440px observation still measured a 28px Dashboard overflow (`1453 - 1425`), while Operational History remained contained. The Employees 320px finding is a shared shell edge case caused by the 320px body minimum after the vertical scrollbar reduces the client area to 305px.

## 4. Offending Element Inventory

### Finding A: shared 320px shell minimum

| Field | Evidence |
|---|---|
| Selector | `body` |
| Route/scope | all three audited routes at requested width 320; `SHARED_BETWEEN_BOTH_ROUTES` and reproduced by control |
| Rect | left `-15`, right `305`, width `320` |
| Computed layout | `display:block`; `min-width:320px`; `overflow-x:visible`; no transform |
| Source | `src/styles.css:14-17` |
| Classification | `FIXED_OR_MIN_WIDTH` |
| Propagation | `body` -> `#root` -> `.app-shell` -> document; the 15px vertical scrollbar leaves a 305px client area |
| User-visible purpose | global minimum application width |

### Finding B: Dashboard weekly grid

| Field | Evidence at requested 390px |
|---|---|
| First expanding element | `.weekly-grid` |
| Stable DOM path | `.page-stack > .cockpit-grid > .center-column > .weekly-grid-shell > .weekly-grid` |
| Rect | left `-736.4`, right `351.6`, width `1088` |
| Computed layout | grid; `min-width:1088px`; columns `73.6px + 7 x about 144.9px`; `overflow-x:visible`; normal white-space; no transform |
| Intended local scroller | `.weekly-grid-shell`; `overflow-x:auto`, but its grid ancestry expands to `1090px` on mobile |
| Parent propagation | `.weekly-grid` -> `.weekly-grid-shell` -> `.center-column` (`min-width:auto`) -> `.cockpit-grid` (`1fr` mobile track with automatic minimum) -> `.page-stack` auto track (`1090px`) -> `main` -> document |
| Source | `src/components/WeeklyGrid.tsx:53-54`; Dashboard use in `src/WorkforcePages.tsx:1152-1168`; CSS in `src/styles.css:235-245`, `296-310`, `1762-1783` |
| Classification | `GRID_MIN_CONTENT_EXPANSION` |
| Scope | `DASHBOARD_ONLY` in this audit |
| User-visible purpose | seven-day weekly schedule grid |

At 1280px the main area is about 948px after the sidebar, while the cockpit column minimums require about 989px. The weekly grid remains 1088px inside the local scroller and extends into negative RTL coordinates. This explains the smaller 68px document overflow at the desktop reference and the remaining 28px at 1440px.

### Finding C: Operational History manager-note placeholder

| Field | Evidence at requested 390px |
|---|---|
| First expanding content | `.history-print .report-section:last-child p` |
| Stable DOM path | `.operational-history-page > .history-print > .report-section:last-child > p` |
| Rect | left `-341.2`, right `339.6`, width `680.8` |
| Computed layout | block; `white-space:normal`; `overflow-x:visible`; no `overflow-wrap:anywhere`; no transform |
| Child causing expansion | one uninterrupted 96-dot placeholder used for the printed manager note |
| Parent propagation | unbreakable text -> `.report-section` (`706.8px`) -> `.history-print` (`706.8px`) -> `.page-stack` auto track (`706.8px`) -> `main` -> document |
| Source | `src/pages/workforce/operations/OperationalHistoryPage.tsx:130-138`; CSS in `src/styles.css:662-695`, `845-849`, `1271-1285` |
| Classification | `NOWRAP_TEXT_OR_BADGE` |
| Scope | `OPERATIONAL_HISTORY_ONLY` |
| User-visible purpose | printable blank line for a manager note |

The `.page-header .hero-actions` measured about 662px after the parent grid track expanded. Its computed `flex-wrap` is `wrap`; it is a propagated width, not the first root cause. Individual actions fit a narrow column once the route track is allowed to shrink.

## 5. Dashboard Root Cause

The fixed 68rem weekly grid is intentional, but the containment chain is incomplete. At mobile widths, `.cockpit-grid` becomes `grid-template-columns:1fr`; the `1fr` track keeps an automatic min-content minimum. `.center-column` also retains `min-width:auto`. The 1088px grid therefore sizes the cockpit/page auto track instead of remaining only inside the existing horizontal scroller.

The exact root classification is `GRID_MIN_CONTENT_EXPANSION`, triggered by the fixed minimum width of `.weekly-grid`. This is route-local; the global shell only adds the separate 15px edge case at requested width 320.

## 6. Operational History Root Cause

The printed report is visible in the normal page flow. Its final manager-note paragraph contains a single unbreakable 96-character token. Because `.report-section p` has normal wrapping but no anywhere-break rule, that token defines a min-content width of about 681px. The parent grid auto track then stretches every route section to about 707px.

The exact root classification is `NOWRAP_TEXT_OR_BADGE`. The title, filters, KPI cards and actions inherit the enlarged track; they are not independent root causes in the measured fixture.

## 7. Shared Layout Assessment

The two large failures do not share one route-content cause:

- Dashboard: fixed weekly-grid min-content escapes its intended scroller.
- Operational History: unbreakable print placeholder establishes a 707px route track.
- Shared shell: `body { min-width:320px }` creates a separate 15px overflow only at the requested 320px viewport when the vertical scrollbar is present.

Conclusion: there is one shared edge-case fix plus two route-local containment fixes. Employees is a valid control at 360/390/430/1280 and exposes only the shared 320px minimum.

## 8. Repair Options

| Scope | Exact file/selector | Proposed future change | Expected result | Desktop risk | Regression risk | Routes affected | Required preview | Reversible |
|---|---|---|---|---|---|---|---|---|
| Shared 320px shell | `src/styles.css`, `body` | remove the fixed 320px minimum or replace it with a client-width-safe minimum (`min-width:0`) | remove the 15px control overflow at requested 320px | very low | very low; check extremely narrow rendering | all routes | all three mobile routes at 320 | YES |
| Dashboard | `src/styles.css`, `.cockpit-grid`, `.center-column`, `.weekly-grid-shell` | use zero-min grid tracks (`minmax(0, 1fr)`), set relevant grid children to `min-width:0`, and keep the weekly table inside its intentional local scroller; verify RTL containment at 1280/1440 | document width fits viewport while weekly schedule remains locally horizontally scrollable | low to medium | side cards could become too narrow; verify cockpit cards and RTL scroll direction | Dashboard and any page reusing `.cockpit-grid` | 320/360/390/430/1280/1440 Dashboard plus Employees | YES |
| Operational History CSS-only | `src/styles.css`, `.operational-history-page .report-section p` | add `overflow-wrap:anywhere` for print-report paragraphs | 96-dot placeholder can break and route track shrinks | low | printed note line wraps visually | Operational History | mobile plus print preview | YES |
| Operational History semantic alternative | `src/pages/workforce/operations/OperationalHistoryPage.tsx:138` plus route-local CSS | replace repeated dots with a styled empty note line | removes intrinsic token and preserves print intent | low | print appearance requires review | Operational History | mobile and print preview | YES |

Preferred file budget for the next phase is one file (`src/styles.css`) if the CSS-only Operational History option is accepted. The semantic alternative raises the maximum to two source files. No route, storage or business-logic change is required.

## 9. Recommended Repair Scope

`SHARED_PLUS_ROUTE_LOCAL_FIX`

Reason: one global 320px minimum-edge fix is needed for the required control assertion, while Dashboard and Operational History have different, high-confidence route-content causes. UI redesign is not required. Expected changed source files: one, or at most two if the manager-note placeholder is made semantic in JSX.

## 10. Future Verification Matrix

Desktop direct routes:

- Dashboard
- Operational History
- Employees
- Analysis
- Data Center

Mobile widths `320`, `360`, `390`, `430`:

- Dashboard
- Operational History
- Employees control

Required assertions:

- `documentElement.scrollWidth <= documentElement.clientWidth + 1`.
- No page-level horizontal scrollbar.
- No content clipping.
- Weekly tables remain horizontally usable only inside the intentional local scroller.
- Navigation remains usable and RTL remains correct.
- Visible mojibake remains zero.
- Serious console/page errors remain zero.
- Operational History print preview remains usable.
- `npm.cmd test` passes.
- `npm.cmd run build` passes with the same module baseline unless explained.

## 11. Audit Verdict

`MOBILE_OVERFLOW_ROOT_CAUSE_CONFIRMED`

All three measured causes are reproducible, traceable to exact source rules/nodes and repairable without route, storage, business-logic or UI redesign work.

## 12. Exact Next Phase

`CORE-HARDEN-ROUTE-P02 - Workforce Critical Routes Mobile Overflow Repair`

The future phase may proceed only with separate Project Core approval and the one-to-two-file boundary documented above.

## 13. Final Lock

- No source, UI or CSS change was made.
- No test or package file changed.
- No route or storage contract changed.
- Local `main` remains `e42b320`.
- Observed `origin/main` remains `b16b1a0`.
- No push or remote update was performed.
- P56 and all feature work remain frozen.
