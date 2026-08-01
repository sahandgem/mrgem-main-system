# Master Gem Critical Route Browser Smoke Baseline

## 1. Purpose

This report records browser-level V1 route verification without feature, runtime, UI, CSS, route, storage or package changes. CORE-HARDEN-P01 used the available Codex in-app browser as a recorder-only surface because the repository has no installed browser automation framework.

## 2. Baseline

| Item | Verified value |
|---|---|
| Starting branch | `docs/master-gem-v1-operational-hardening-core-p13` |
| Starting commit | `62ed6ac742e005a9cc787b405b9935343ba71165` |
| Hardening branch | `hardening/master-gem-v1-critical-route-browser-smoke-p01` |
| Local `main` | `e42b32027cf642a1d1dc369786490a7427d16034` |
| Observed `origin/main` | `b16b1a020168516b2f8ad3e0bcd41e1193c8a824` |
| Initial test | PASS; exit code 0; existing `--experimental-loader` warning |
| Initial build | PASS; exit code 0; 1,751 modules; no tracked artifact |
| Browser tooling classification | `RECORDER_ONLY_AVAILABLE` |
| Existing browser framework | none in package, lock, scripts or tests |
| Route registry | 28 entries, 28 unique, zero missing component keys |

No Playwright, Cypress, Puppeteer or WebDriver dependency, script or E2E folder exists in the repository. No package was installed and no browser test file was created.

## 3. Route Matrix

Desktop viewport: 1440 x 900. Mobile viewport: 390 x 844. `N/A` means the route was outside the mandatory mobile subset, not that it failed.

| Route | Page identity | Desktop | Mobile | Console/page errors | RTL | Visible encoding | Verdict |
|---|---|---|---|---|---|---|---|
| `/organization/workforce-dashboard` | `اتاق فرمان هفته` | PASS | **FAIL: horizontal overflow, 1112px document width at 390px viewport** | 0 | PASS | 0 suspicious markers | PARTIAL |
| `/organization/workforce-dashboard/operational-history` | `تاریخچه عملیاتی` | PASS | **FAIL: horizontal overflow, 729px document width at 390px viewport** | 0 | PASS | 0 suspicious markers | PARTIAL |
| `/organization/workforce-dashboard/employees` | `مدیریت کارمندان` | PASS | PASS: 375px document width at 390px viewport | 0 | PASS | 0 suspicious markers | PASS |
| `/organization/workforce-dashboard/analysis` | `هشدارها و پیشنهادهای سیستم` | PASS | N/A | 0 | PASS | 0 suspicious markers | PASS |
| `/organization/workforce-dashboard/data-center` | `جعبه سیاه داده‌ها` | PASS | N/A | 0 | PASS | 0 suspicious markers | PASS |
| `/organization/workforce-dashboard/maintenance` | `کنسول نگهداری سیستم` | PASS | N/A | 0 | PASS | 0 suspicious markers | PASS |
| `/organization/workforce-dashboard/history-retention` | `سیاست نگهداری تاریخچه` | PASS | N/A | 0 | PASS | 0 suspicious markers | PASS |

All final URLs matched their requested paths. Every desktop route rendered a nonblank root, its actual code-defined identity heading, `dir=rtl`, `lang=fa`, zero serious console/page errors and zero prototype links. No unexpected redirect or immediate crash occurred.

The mobile navigation remained present with 26 visible navigation links on all three required routes. Employees had no horizontal overflow. Dashboard and Operational History remain usable enough to render identity and navigation, but their primary content extends beyond the viewport, so the mobile gate does not pass.

Focused overflow evidence:

- Dashboard: `.page-stack` reported 1090px scroll width; `.hero-header` and its content inherited approximately 1088/1045px widths. Schedule blocks also extended left of the viewport.
- Operational History: `.page-stack.operational-history-page` reported 707px scroll width; `.page-header`, heading/content column, hero actions and baseline panel retained approximately 662-705px widths.

No fix was attempted because source/UI/CSS changes are forbidden in this phase.

## 4. Tooling And Reproducibility

| Item | Value |
|---|---|
| Framework/recorder | Codex in-app browser recorder; no repository automation framework |
| Test command | `npm.cmd test` |
| Build command | `npm.cmd run build` |
| Preview command | `npm.cmd run preview -- --port 4179` |
| Preview URL | `http://127.0.0.1:4179` |
| Desktop viewport | 1440 x 900 |
| Mobile viewport | 390 x 844 |
| Ready signal | supported `domcontentloaded` plus direct DOM identity assertion |
| Setup | build `dist`, start local Vite preview, open exact direct URLs |
| Teardown | viewport reset, recorder tabs finalized, port 4179 stopped |

The recorder backend did not support `networkidle`; the first attempt produced only a tooling limitation, not route failures. The reproducible protocol therefore used `domcontentloaded` followed by direct heading/root/path assertions and a second complete rerun. Lazy Operational History readiness was confirmed through the final DOM identity rather than a fixed delay.

Automation limitation: this is repeatable as a documented recorder protocol but is not a repository-owned automated test. There is no CI artifact, executable browser spec or machine-consumable screenshot bundle.

## 5. OperationalHistory And Data Center Checks

### Operational History

- Standalone source contract: PASS; the page remains outside `WorkforcePages` and has no `WorkforceRouteAdapter` dependency.
- Direct desktop and mobile load: PASS.
- `روند امتیاز Drift` heading: rendered.
- Visible trend label: `پایدار` rendered in Persian.
- Machine values shown as mojibake: NO.
- Mobile layout: FAIL due horizontal overflow; no runtime or encoding failure.

### Data Center

- Direct desktop load and page identity `جعبه سیاه داده‌ها`: PASS.
- Corrected restore template contract remains `Snapshot «${restored.title}» بازیابی شد.` in source.
- Rendered page encoding scan: PASS with zero suspicious markers.
- The mutating restore action was intentionally not executed; this phase did not alter browser storage.

## 6. Test And Build

| Gate | Before browser smoke | After browser evidence |
|---|---|---|
| `npm.cmd test` | PASS, exit 0 | PASS, exit 0 |
| Test warning | existing Node `--experimental-loader` warning | same existing warning |
| `npm.cmd run build` | PASS, exit 0 | PASS, exit 0 |
| Module count | 1,751 | 1,751 |
| Tracked artifacts | none | none |
| Browser rerun | not applicable before first pass | reproduced all desktop PASS results and both mobile overflow findings |

## 7. Scope Verification

- No `src`, UI, CSS, route, storage, prototype, package or lock file changed.
- No browser/e2e test file was created or changed.
- P56 remains frozen.
- Cockpit and Task/Decision runtimes remain frozen.
- Prototypes and subprojects remain isolated; page scans found zero prototype links.
- Local `main` remains `e42b320`.
- `origin/main` remains observed at `b16b1a0`.
- No push, fetch, pull, merge, rebase or cherry-pick occurred.

## 8. Evidence Gaps

1. Dashboard mobile overflow is unresolved at 390px; the first visible width is 1112px.
2. Operational History mobile overflow is unresolved at 390px; the first fully loaded width is 729px.
3. Root cause is narrowed to retained wide header/content containers, but no CSS/source fix is authorized or proven.
4. The recorder protocol is not a committed automated browser spec and cannot run in CI.
5. Only three mandatory mobile routes were measured; the remaining 25 routes have no mobile smoke result in this phase.
6. Data Center restore-template execution was not triggered because it would mutate storage; only source contract and nonmutating render surfaces were verified.
7. Accessibility, keyboard navigation and visual screenshot-diff evidence remain outside this baseline.

## 9. Verdict

`BROWSER_SMOKE_BASELINE_PARTIAL`

Desktop baseline is verified for seven critical routes, and mobile Employees passes. Mobile overflow on Dashboard and Operational History prevents a full manual browser baseline verdict. This phase stops without runtime correction.

## 10. Recommended Next Phase

`CORE-HARDEN-ROUTE-P01 — Workforce Critical Routes Mobile Overflow Stabilization Audit`

Purpose: perform a separately authorized, audit-first diagnosis and minimal-fix decision for Dashboard and Operational History overflow at the 390px viewport, without redesign, route/storage change or unrelated refactor.

`CORE-HARDEN-P02 — Storage Backup and Restore Verification Baseline` remains deferred until the critical mobile route gate is resolved or explicitly accepted by Project Core.

## 11. Final Lock

- No local `main` change.
- No push or remote update.
- No feature work, refactor or P56.
- No source/UI/CSS correction was attempted.
- The partial verdict and exact overflow evidence are retained as baseline.
- A separate Project Core approval is required for the recommended route stabilization audit.
