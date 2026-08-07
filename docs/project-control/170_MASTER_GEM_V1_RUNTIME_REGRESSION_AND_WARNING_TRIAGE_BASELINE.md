# Master Gem V1 Runtime Regression and Warning Triage Baseline

Date: 2026-08-07
Phase: CORE-HARDEN-P04
Scope: runtime observation and docs-only triage. No source, test, package, prototype, storage, route, UI, main, remote, or runtime behavior changed.

## 1. Purpose

Create repeatable V1 runtime evidence, classify all known warning families, and distinguish operational defects from accepted, non-blocking development or external-resource noise.

## 2. Baseline

- Working branch: `hardening/master-gem-v1-runtime-regression-warning-triage-p04` from `a20721c`.
- Local main: `e42b32027cf642a1d1dc369786490a7427d16034`; origin/main: `b16b1a020168516b2f8ad3e0bcd41e1193c8a824`.
- Release state at start: `LOCALLY_VERIFIED`.
- Test: PASS, exit code 0; one development-only Node `--experimental-loader` warning.
- Build: PASS, exit code 0; 1,751 modules transformed; no build warning.
- Browser method: native Chrome 150.0.7871.187, headless CDP, Vite preview, fresh temporary profiles outside the repository. Browser plugin connection was unavailable because of an environment ACL failure; Chrome/CDP ran locally instead.
- Passive storage was not inspected; no interaction or data-changing action was executed.

## 3. Route Matrix

All route navigations resolved to the expected final URL and visible H1. All completed cases had RTL, no runtime crash, no uncaught exception, no visible mojibake, no primary-content clipping, and document/body overflow at or below 0px (reported -15px from the headless scrollbar metric, not horizontal overflow).

| Route | Required viewports | Repeatability viewports | Result |
|---|---|---|---|
| `/organization/workforce-dashboard` | 390x844, 1280x800, 320x800 | 390x844, 1280x800 | PASS |
| `/organization/workforce-dashboard/operational-history` | 390x844, 1280x800, 320x800 | 390x844, 1280x800 | PASS |
| `/organization/workforce-dashboard/employees` | 390x844, 1280x800 | 390x844, 1280x800 | PASS |
| `/organization/workforce-dashboard/analysis` | 390x844, 1280x800 | 390x844, 1280x800 | PASS |
| `/organization/workforce-dashboard/data-center` | 390x844, 1280x800, 320x800 | 390x844, 1280x800 | PASS |
| `/organization/workforce-dashboard/maintenance` | 390x844, 1280x800 | 390x844, 1280x800 | PASS |
| `/organization/workforce-dashboard/history-retention` | 390x844, 1280x800 | 390x844, 1280x800 | PASS |

Formal completed matrix records: 31. No unexpected redirect, blank screen, app-resource 4xx/5xx, unhandled rejection, or application exception was captured.

## 4. Unique Runtime Signal Inventory

| ID | Exact message / source | Routes / total occurrences | Reproducibility | Classification | Severity | Release disposition |
|---|---|---|---|---|---|---|
| RT-01 | Historical React duplicate-key warning for `???? ??????? ???? ???` | historical repeated; 0 in P04 fresh-profile captures | not reproduced in 31 P04 cases | `NON_BLOCKING_APPLICATION_WARNING` | MEDIUM | `FIX_IN_POST_V1_HARDENING` |
| RT-02 | Historical React duplicate-key warning for `?????? ???? ????` | historical repeated; 0 in P04 fresh-profile captures | not reproduced in 31 P04 cases | `NON_BLOCKING_APPLICATION_WARNING` | MEDIUM | `FIX_IN_POST_V1_HARDENING` |
| RT-03 | `Failed to load resource: net::ERR_CONNECTION_TIMED_OUT` or `net::ERR_CONNECTION_REFUSED` for `https://images.unsplash.com/photo-1551288049-bebda4e38f71?...` | Employees, Data Center, Maintenance, History Retention; 8 formal occurrences | recurring with varying network failure text | `EXTERNAL_DEPENDENCY_WARNING` | LOW | `ACCEPT_FOR_V1` |
| RT-04 | `Failed to load resource: the server responded with a status of 404 (Not Found)` for `/favicon.ico` | Dashboard 390x844; 1 formal occurrence | fresh-profile browser request | `BENIGN_BROWSER_NOISE` | INFO | `ACCEPT_FOR_V1` |
| RT-05 | Node `ExperimentalWarning: --experimental-loader may be removed` | `npm.cmd test`; 1 process warning | deterministic test command only | `BENIGN_DEBUG_OUTPUT` | INFO | `FIX_IN_POST_V1_HARDENING` |

No serious application-origin console error, runtime crash, data-integrity signal, unknown signal, or unhandled rejection remained after source tracing.

## 5. React Duplicate-Key Analysis

Two historically recorded warning messages are traceable to title-based keys, not to a new P04 runtime crash:

- `src/components/InfoPanel.tsx:24` renders rows with `key={item.title}`.
- `src/WorkforcePages.tsx:1005` maps analysis findings into `urgentAlerts` using `title: item.title`; duplicate finding titles can therefore collide in `InfoPanel`.
- `src/WorkforcePages.tsx:1013` maps scenarios into `smartSuggestions` using `title: item.title`; repeated manual sales scenarios can therefore collide in `InfoPanel`.
- The two historical messages originate in `src/analysis/workforceAnalyzer.ts:242` and `src/analysis/workforceRecommendationEngine.ts:251`/`:258`.

Distinct root causes: 2 title-identity collisions through one shared rendering pattern. P04 observed no visible reconciliation failure and no duplicate-key console warning in 31 fresh-profile route cases. The risk is limited to repeated title data; it remains a medium-severity post-V1 hardening debt. No source fix was made.

## 6. Unsplash Dependency Analysis

Source trace: `src/styles.css:143`, a background image on `.hero-header, .page-header`. The URL is decorative. A dark gradient remains even when the image fails, and every route retained its page identity, readable header, and operational controls in offline/failure conditions. The failure is an external privacy/dependency concern but does not block dashboard operation. No replacement or suppression was made.

## 7. Loader Warning Analysis

The warning is emitted only by `npm.cmd test`, whose script uses `node --loader ./scripts/ts-extension-loader.mjs`. Node version was 24.16.0. It does not appear in the production build or browser runtime. Classify it as development-only tooling debt; future cleanup must be a separately approved test-tooling change.

## 8. Favicon 404 Analysis

The browser requested `/favicon.ico` on a fresh profile and the preview returned 404. It is a browser chrome resource, not an application JS/CSS/data dependency; all routes still loaded. It is accepted as low-priority browser noise. No asset was added.

## 9. Runtime Regression Checklist

- [x] Route resolves and page identity is visible.
- [x] No blank screen, crash, uncaught application exception, or unhandled rejection.
- [x] Known signals are classified without suppression.
- [x] Application resources load; external image failures are identified as non-operational.
- [x] RTL, visible mojibake = 0, no page-level horizontal overflow, and no primary clipping.
- [ ] Passive storage mutation and registry-pollution inspection was not performed; no route interaction was executed.

## 10. Repeatability Results

The first complete matrix covered all seven routes at 390x844 and 1280x800 plus the three required 320x800 routes. Browser and preview processes were stopped. A fresh profile and fresh preview then reran all seven routes at 390x844 and 1280x800.

The unique signal categories remained stable: decorative Unsplash failure and favicon 404 only. External-image occurrence and error text varied between timeout/refused as expected for a network dependency. No new warning category, crash, exception, redirect, mojibake, clipping, or overflow appeared.

## 11. Release Impact

Accepted warnings: RT-03 Unsplash external background failure and RT-04 favicon 404. Post-V1 debt: RT-01/RT-02 duplicate title-key collisions and RT-05 test-loader warning. Pre-remote fix required: none from this baseline, while the independent remote promotion checklist remains mandatory. Release blockers: none.

## 12. Test and Build

`npm.cmd test` PASS with exit code 0; warning count 1 (`--experimental-loader`). `npm.cmd run build` PASS with exit code 0; 1,751 modules transformed and no build warning. No tracked file was changed by either command.

## 13. Scope Verification

P04 is docs-only. No source, test, prototype, package, lock, UI, route, CSS, storage, main, or origin change was made. No push, fetch, pull, merge, rebase, cherry-pick, or P56 work occurred. P56 remains frozen.

## 14. Verdict

`RUNTIME_BASELINE_VERIFIED_WITH_ACCEPTED_WARNINGS`

All required routes and viewports passed, the warning set was stable, and no release blocker was found. Accepted warnings and post-V1 debt remain explicitly visible.

## 15. Recommended Next Phase

`CORE-HARDEN-P05 - V1 Technical Debt Register and Hardening Closure Baseline`

## 16. Final Lock

No runtime fix, main change, remote promotion, or push occurred. Any source fix, remote promotion, or warning-remediation phase requires separate approval.
