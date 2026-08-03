# Master Gem Workforce Mobile Overflow Repair

## 1. Purpose

This report preserves the full P02/P02A/P02B/P02C repair history and closes the verified CSS-only containment repair for Workforce critical routes. No JSX, TypeScript, route, text, storage, package, test, model, service, analyzer or business-logic contract changed.

## 2. Baseline and Scope

| Item | Value |
|---|---|
| Starting branch | `hardening/master-gem-v1-mobile-overflow-repair-p02` |
| Starting commit | `ed698320a25917f3ab85a6ce77c5dcf333870847` |
| Local `main` | `e42b32027cf642a1d1dc369786490a7427d16034` |
| Observed `origin/main` | `b16b1a020168516b2f8ad3e0bcd41e1193c8a824` |
| Source whitelist | `src/styles.css` only |
| Baseline test | PASS; only the existing Node `--experimental-loader` warning |
| Baseline build | PASS; 1,751 modules; no build warning |
| Browser method | Native Chrome 150 headless through CDP, local Vite dev/preview servers, fresh profiles outside the repository |

## 3. Measurement History

Values are page-level horizontal overflow in pixels. `0` means `scrollWidth <= clientWidth + 1`.

| Phase / route | 320 | 360 | 390 | 430 | 1280 | 1440 |
|---|---:|---:|---:|---:|---:|---:|
| P01 original audit - Dashboard | 807 | 767 | 737 | 697 | 68 | 28 |
| P01 original audit - Operational History | 424 | 384 | 354 | 314 | 0 | 0 |
| P01 original audit - Employees | 15 | 0 | 0 | 0 | 0 | 0 |
| P02A failed rerun - Dashboard | 807 | not sampled | 737 | not sampled | 68 | not sampled |
| P02A failed rerun - Operational History | 424 | not sampled | 354 | not sampled | 0 | not sampled |
| P02A failed rerun - Employees | 0 | not sampled | not sampled | not sampled | not sampled | not sampled |
| P02B remaining - Dashboard | 0 | 0 | 0 | 0 | 51 | 19 |
| P02B remaining - Operational History | 0 | 0 | 0 | 0 | 0 | 0 |
| P02B remaining - Data Center | 45 | 5 | 0 | 0 | 0 | not sampled |
| P02C final - Dashboard | 0 | 0 | 0 | 0 | 0 | 0 |
| P02C final - Operational History | 0 | 0 | 0 | 0 | 0 | 0 |
| P02C final - Employees | 0 | 0 | 0 | 0 | 0 | 0 |
| P02C final - Analysis | 0 | 0 | 0 | 0 | 0 | 0 |
| P02C final - Data Center | 0 | 0 | 0 | 0 | 0 | 0 |

## 4. Exact Root Causes

### Dashboard

- `.side-column .panel-list` and `.side-column .panel-row` retained automatic grid min-content sizing; their cards propagated approximately 51px at 1280.
- The RTL `.weekly-grid` is the intentional local scroller. Its off-screen cells leaked into document geometry at desktop widths even though the grid itself remained scrollable.
- Propagation chain: `.panel-row` / `.weekly-grid` -> `.side-column` / `.center-column` -> `.cockpit-grid` -> `.page-stack` -> `main` -> `.app-shell` -> document.

### Data Center

- `.page-stack` used an implicit automatic grid track; `.bottom-grid` inherited the shared `1fr` breakpoint track with an automatic minimum.
- The file input kept intrinsic width and the long snapshot storage-key display text contributed min-content pressure.
- Propagation chain: form/input or bottom panel -> `.bottom-grid` -> `.page-stack` -> `main` -> document.

## 5. Exact CSS Repair

Accumulated P02 repair remains limited to `src/styles.css`. P02C refined four selector groups:

1. `button, input, select, textarea`
   - `max-width: 100%`
2. `.page-stack, .side-column .panel-list, .side-column .panel-row`
   - `grid-template-columns: minmax(0, 1fr)`
   - `min-width: 0`
   - `overflow-wrap: anywhere`
3. `.cockpit-grid`
   - `overflow-x: clip` at the cockpit boundary only
   - the real `.weekly-grid` remains reachable with `overflow-x: auto` and `scrollWidth > clientWidth`
4. The existing `@media (max-width: 1180px)` one-column grid group
   - `grid-template-columns: minmax(0, 1fr)` instead of `1fr`

Earlier accumulated P02/P02B declarations also retain client-width-safe `body` sizing, zero-min cockpit/column tracks, bounded WeeklyGrid containment, and route-local Operational History chart/report containment.

No global `html/body overflow-x:hidden`, generic universal min-width reset, content removal, column removal, arbitrary fixed width or global LTR override was used. Primary content is not hidden; only the measured cockpit paint leak is contained while its local scroller stays usable.

## 6. Full Browser Matrix

- Routes: Dashboard, Operational History, Employees, Analysis, Data Center.
- Viewports: `320x800`, `360x800`, `390x844`, `430x932`, `1280x800`, `1440x900`.
- Cases: 30.
- Maximum document overflow: 0px.
- Maximum body overflow: 0px.
- Page-level horizontal scrollbars: 0.
- Primary-content clipping findings: 0.
- RTL failures: 0.
- Navigation usability failures: 0.
- Visible mojibake findings: 0.
- Runtime crashes/exceptions: 0.
- WeeklyGrid remained reachable through its local RTL `overflow-x:auto` scroller.
- Operational History chart remained contained, locally scrollable when needed, and labels remained readable.

## 7. Dashboard Console Classification

| Event | Occurrence | Classification | Runtime failure | Decision |
|---|---|---|---|---|
| React duplicate-key warning for `پوشش فروشگاه خالی است` | initial dev load; repeated | `NON_BLOCKING_WARNING` | NO | Pre-existing application warning; outside CSS-only scope; no suppression or source edit |
| React duplicate-key warning for `افزودن شیفت فروش` | initial dev load; repeated | `NON_BLOCKING_WARNING` | NO | Pre-existing application warning; outside CSS-only scope; no suppression or source edit |
| Unsplash image `net::ERR_CONNECTION_REFUSED` | initial load; intermittent/repeated | `BENIGN_BROWSER_NOISE` | NO | External network/resource noise; no application-origin exception |
| Vite connection messages / React DevTools message | initial dev load | `BENIGN_DEBUG_OUTPUT` | NO | Expected development output |

Serious application console errors: 0. Unknown application-origin console errors: 0. No console output was hidden or changed.

## 8. Repeatability

After the first full PASS, all task-started browser/server processes were stopped. A production preview and Chrome 150 were restarted with a fresh temporary profile. Thirteen required cases were rerun:

- Dashboard: 320, 390, 1280, 1440.
- Operational History: 320, 390, 1280.
- Employees: 320.
- Data Center: 320, 360, 390, 1280.
- Analysis: 390.

Result: PASS. Maximum document/body overflow remained 0px; clipping, route, navigation, RTL, mojibake and runtime-exception checks all passed. Two intermittent Unsplash failures were classified as `BENIGN_BROWSER_NOISE`.

## 9. Test, Build and Static Gates

- Final `npm.cmd test`: PASS, exit code 0; only the existing Node `--experimental-loader` warning.
- Final `npm.cmd run build`: PASS, exit code 0.
- Build module count: 1,751.
- Build warning: none.
- `git diff --check`: PASS; only Git line-ending notices, no whitespace error.
- No tracked build artifact appeared.

## 10. Scope Verification

- Source files changed: only `src/styles.css`.
- Test/package/lock files changed: NO.
- JSX/TS/TSX changed: NO.
- Route/text/storage/model/service/analyzer/business logic changed: NO.
- Prototype/subproject/backend/database/auth/API changed: NO.
- Local `main` changed: NO.
- Remote changed or push performed: NO.

## 11. Verdict

`MOBILE_OVERFLOW_REPAIR_VERIFIED`

The full 30-case browser matrix, final test/build and fresh-profile 13-case repeatability run passed. The accumulated repair is eligible for the authorized repair-branch commit.

## 12. Recommended Next Phase

`CORE-HARDEN-P02 — Storage Backup and Restore Verification Baseline`

No merge or push is authorized by this phase.