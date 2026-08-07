## CORE-V2-P03 Command Center Consumption Gate

- [x] UI contract consumes only normalized `ModuleAggregationResult` / `CoreModuleResult` data.
- [x] Raw adapter payloads and arbitrary adapter routes are excluded from the UI contract.
- [x] View-model derivation is deterministic, pure, and non-mutating by design.
- [x] Disabled, no-data, stale, unavailable, invalid, unsupported, partial, and empty states are specified.
- [x] Priority tiers and tie-break rules are explicit and testable.
- [x] Missing values are not zero; stale values require labels and timestamps.
- [x] No alert or KPI automatically creates a task, decision, or command.
- [x] Drill-down references require a Core-owned allowlist.
- [x] Desktop, 390 px, 320 px, RTL, encoding, keyboard, and overflow checks are required for P04.
- [x] No real adapter, subproject, fetch, storage, backend, database, auth, migration, or write-back is authorized.
- [ ] Gate V2-B requires explicit operator Option A or B approval before P04 begins.

# چک‌لیست ثابت QA پایان هر P
## CORE-V2-P02 Baseline QA

- [x] Gate V2-A approval, P01 branch/commit, clean tree, and Report 177 verified.
- [x] Contract, static registry, adapter interface, one mock adapter, validator, and read-only aggregator implemented.
- [x] Healthy, degraded, unavailable, stale, unknown, duplicate, unsupported, optional, partial, malformed, empty, no-data, cached-stale, and disabled cases covered.
- [x] Failure isolation, determinism, no mutation, no write method, and no auto-discovery verified.
- [x] `npm.cmd test` PASS; known loader warning unchanged.
- [x] `npm.cmd run build` PASS; 1751 modules transformed.
- [x] No user-visible change, so browser verification was not required.
- [x] No route/storage/package/subproject/prototype/database/backend/auth/API/command/write-back change.
- [ ] Do not start V2.2 until Project Core explicitly accepts the V2.1 baseline.
## CORE-V2-P01 Contract Design QA

- [x] P00 branch, commit, roadmap 176, clean tree, and V1 main baseline verified.
- [x] Source inspection was read-only and covered storage, registry, route, service, backup, history, decision, and technical-debt boundaries.
- [x] Identity, observation, health, freshness, KPI, alert, capability, ownership, compatibility, error, registry, and adapter contracts are documented.
- [x] Read-path options A-D are compared; P02 recommendation is in-process mock/static and read-only.
- [x] P02 minimum slice, untouched areas, acceptance matrix, rollback, and security/non-auth boundary are explicit.
- [x] Gate V2-A is pending and was not auto-approved.
- [x] No runtime, test, package, lockfile, prototype, database, backend, auth, API, storage, route, or subproject file changed.
- [ ] P02 may start only after operator explicitly selects Gate V2-A option A or B.
## CORE-V2 Planning and Gate QA

- [x] Stable V1 baseline `7d39d79` verified before roadmap work.
- [x] Roadmap work is docs-only and isolated on a dedicated branch.
- [x] V2.1 through V2.4 sequence, deliverables, acceptance criteria, rollback boundaries, and non-goals are explicit.
- [x] Gates V2-A through V2-D are recorded with a safe default of no action.
- [x] Product/Mahak and Finance/Audit candidates are both analyzed and neither is selected automatically.
- [x] P56 freeze, subproject isolation, rollback references, and premature backend/database/auth/API/storage prohibitions are retained.
- [ ] Before each future implementation phase: verify clean tree, approved gate, exact baseline, bounded file scope, rollback point, test/build/manual evidence plan, and closure report.
- [ ] Before any pilot: verify exactly one selected subproject, synthetic/non-production data, source ownership, compatibility behavior, and adapter disable path.
- [ ] Before any intelligence/automation: verify a closed pilot, confidence evidence, human review boundary, audit trail, and separate approval for every high-impact action.

## CORE-HARDEN-P09 Remote Promotion Closure

- [x] Explicit push authorization was recorded and limited to a normal `main` push.
- [x] Promotion range `b16b1a0..b1623f4` completed without force, tags or other branch pushes.
- [x] Local main and origin/main were verified equal at `b1623f4` with ahead/behind `0 / 0`.
- [x] Test/build/browser/storage release evidence remained current and rollback refs were retained.
- [x] D15 is closed; D1-D14, P56 freeze and subproject isolation remain visible.
- [ ] Push this P09D docs-only closure commit manually, then re-verify `main == origin/main` and `0 / 0`.

## CORE-HARDEN-P08 Remote Readiness Check

- [x] P07 topology, post-integration rollback and local/remote divergence are recorded.
- [x] Evidence is current: no source/test/package change followed P07 verification.
- [x] All technical/policy readiness gates pass except explicit push authorization, which is intentionally NOT_AUTHORIZED.
- [x] D15 is documented as a process gate rather than a technical defect.
- [ ] P09 may begin only with explicit Project Core authorization; it must re-run remote-safety preflight and never force-push.

## CORE-HARDEN-P07 Local Integration Check

- [x] Rollback branch was created before local main changed and resolves to `e42b320`.
- [x] One no-ff merge used reviewed tip `fd722ce` with first parent `e42b320`; no conflict occurred.
- [x] Post-merge delta remains limited to verified CSS/test hardening and control documentation.
- [x] Post-merge test/build PASS; build transformed 1,751 modules with no build warning.
- [x] Fresh Chrome 150/CDP matrix PASS for 17 required route/viewport records; accepted Unsplash network signal only.
- [x] No push, remote update, tag, P56 or subproject integration occurred.
- [ ] P08 must lock the post-integration baseline and assess remote-promotion readiness without pushing.

## CORE-HARDEN-P06 Integration Readiness Check

- [x] Ancestry is linear from local `main` `e42b320`; all intended hardening commits are present.
- [x] Non-doc delta is bounded to verified `src/styles.css` and `tests/analysis.test.ts` changes.
- [x] Package/lock, prototypes, subprojects, route/storage-registry, backend/database/auth/API contracts are unchanged.
- [x] `npm.cmd test` and `npm.cmd run build` PASS; browser evidence is current after the final source repair.
- [x] D15 is identified as remote-promotion-only debt; it does not block local integration.
- [ ] P07 must recreate preflight, create the defined rollback branch, merge locally with `--no-ff`, and rerun verification without push.

## CORE-HARDEN-P05 Closure Check

- [x] H1-H4 evidence is referenced from reports 165-170 without changing historical verdicts.
- [x] D1-D15 have a category, severity, owner, impact, status and reopen trigger.
- [x] No CRITICAL open debt, `BLOCKS_RELEASE` debt or unknown runtime signal is recorded.
- [x] Local main/origin references and no-push status are documented.
- [x] P56 and all frozen runtime/subproject scopes remain outside the closure.
- [ ] `CORE-HARDEN-P06` must review hardening ancestry and integration options before any merge or remote-promotion decision.

## Runtime Warning Triage Gate

- [ ] Capture console, exceptions, failed requests, 4xx/5xx, route identity, RTL, mojibake, overflow, clipping, and redirect state across required desktop/mobile routes.
- [ ] Repeat the primary route matrix with a fresh browser profile; classify every unique signal and retain occurrence counts.
- [ ] Do not promote remotely while an unclassified serious application error, crash, data-integrity risk, or unstable warning category exists.

## Release and Rollback Gate

- [ ] Before remote promotion, verify local/remote ancestry, clean tree, current test/build/browser/mobile evidence, rollback reference, accepted debt, and explicit Project Core push authorization.
- [ ] A storage restore failure stops writes and preserves the pre-operation snapshot; no automatic transactional rollback may be claimed without separately approved failure-injection evidence.

## 1. محدوده و رفتار

- [ ] فقط محدوده همان P تغییر کرده است.
- [ ] feature ممنوع یا refactor خارج از درخواست وارد نشده است.
- [ ] رفتارهای قبلی ناخواسته تغییر نکرده‌اند.
- [ ] داده demo از داده واقعی تفکیک شده است.

## 2. Route و Navigation

- [ ] pathهای قبلی حفظ شده‌اند.
- [ ] route جدید، در صورت مجاز بودن، در manifest و dispatcher ثبت شده است.
- [ ] duplicate path وجود ندارد.
- [ ] direct URL پاسخ 200 می‌دهد.
- [ ] active navigation درست است.
- [ ] lazy route بدون route error بارگذاری می‌شود.

## 3. UI

- [ ] فارسی و RTL حفظ شده است.
- [ ] Dark Mode سازگار است.
- [ ] desktop و mobile overflow ندارند.
- [ ] متن و کنترل‌ها overlap ندارند.
- [ ] loading، empty، error و disabled state بررسی شده‌اند.
- [ ] browser console خطای جدی ندارد.

## 4. Type و منطق

- [ ] TypeScript typeها دقیق‌اند.
- [ ] analyzer/service ورودی را mutate نمی‌کند.
- [ ] boundary و invalid input تست شده است.
- [ ] defaultها از config/service می‌آیند، نه منطق پراکنده.

## 5. Persistence

- [ ] storage key موجود تغییر نکرده است، مگر با migration مصوب.
- [ ] هر localStorage key جدید باید در storage registry و backup coverage بررسی شود.
- [ ] JSON خراب یا storage خالی رفتار امن دارد.
- [ ] reset فقط محدوده موردنظر را reset می‌کند.
- [ ] داده حیاتی در backup/restore policy تعیین تکلیف شده است.
- [ ] عملیات destructive confirmation و snapshot مناسب دارد.

## 6. Baseline و Audit

- [ ] اثر تغییر روی checksum و drift بررسی شده است.
- [ ] اگر backup coverage یا baseline تغییر کرده، legacy baseline و comparable checksum بررسی شده‌اند.
- [ ] warningهای legacy baseline نباید به عنوان data corruption یا خرابی داده نمایش داده شوند.
- [ ] signoff/resignoff در صورت نیاز ثبت می‌شود.
- [ ] event عملیاتی لازم در history ثبت می‌شود.
- [ ] retention/archive با تغییر ناسازگار نشده است.

## 7. Test و Build

- [ ] تست جدید متناسب با ریسک اضافه شده است.
- [ ] `npm test` موفق است.
- [ ] `npm run build` موفق است.
- [ ] warningها ثبت و طبقه‌بندی شده‌اند.
- [ ] dependency سنگین بدون تصمیم اضافه نشده است.
- [ ] bundle size در تغییرات frontend مقایسه شده است.

## 8. مستندات

- [ ] گزارش پایان P کامل است.
- [ ] phase log به‌روزرسانی شده است.
- [ ] current state با کد هم‌خوان است.
- [ ] تصمیم معماری جدید ثبت شده است.
- [ ] parking lot به‌روز شده است.

## قالب گزارش پایان هر P

1. هدف فاز و نتیجه نهایی
2. فایل‌های ساخته یا تغییر داده‌شده
3. routeهای اضافه/تغییرکرده
4. مدل‌ها و storage keyهای اضافه/تغییرکرده
5. service/analyzerهای اضافه/تغییرکرده
6. رفتارهای اصلی پیاده‌سازی‌شده
7. داده‌ها یا integrationهای هنوز mock/ساده
8. تست‌های اضافه‌شده
9. نتیجه `npm test`
10. نتیجه `npm run build` و اندازه bundle
11. warningها و ریسک‌های باقی‌مانده
12. تأیید عدم تغییر موارد ممنوع
13. پیشنهاد P بعدی

## الحاق P28 به QA

- [ ] در صورت اجرای WF-P29، entryهای منتقل‌شده route path صریح دارند و re-export خام از compat layer مرکزی نمی‌کنند.
- [ ] در صورت اجرای WF-P29، route manifest بدون duplicate باقی مانده و مسیرهای مستقیم مهم build می‌شوند.
- [ ] بعد از استخراج component مشترک، مصرف‌کننده‌ها همان رفتار قبلی را حفظ می‌کنند و localStorage/analyzer/service تغییر نمی‌کند.

## چک پیشنهادی برای WF-P29

- [ ] page body منتقل‌شده دیگر `WorkforceRouteAdapter` یا `WorkforcePages` را برای بدنه import نمی‌کند.
- [ ] فایل منتقل‌شده default component واقعی export می‌کند، نه re-export compat.
- [ ] route registry برای page منتقل‌شده همان URL قبلی را نگه می‌دارد.
- [ ] بعد از استخراج، `WorkforcePages.tsx` هم build می‌شود و fallback/compat pageهای باقی‌مانده سالم‌اند.
- [ ] اگر helper مشترک ساخته شد، service/analyzer/model را معکوس import نمی‌کند.

## V1 Operational Hardening Gate

- [ ] commit و branch baseline دقیق و working tree تمیز ثبت شده‌اند.
- [ ] critical route inventory نسخه‌دار است و direct URL هر route بررسی شده است.
- [ ] lazy-load completion، `dir=rtl`، `lang=fa` و critical Persian labels ثبت شده‌اند.
- [ ] console error/warning برای هر route و viewport ثبت شده است.
- [ ] desktop و mobile viewport matrix دارای نتیجه و evidence است.
- [ ] `OperationalHistoryPage` همچنان مستقل از `WorkforcePages` و adapter است.
- [ ] prototype و subproject isolation scan پاس شده است.
- [ ] storage registry برابر ۲۴، backup set برابر ۲۳ و excluded snapshot container برابر یک است.
- [ ] backup/import/restore فقط روی fixture مصنوعی و محیط disposable اجرا شده است.
- [ ] malformed JSON، missing critical key، checksum mismatch و unknown key رفتار ثبت‌شده دارند.
- [ ] rollback reference، dry-run procedure، actor و approval boundary ثبت شده‌اند.
- [ ] test، build، smoke، storage، secret scan و rollback evidence به یک release pack متصل‌اند.
- [ ] local/remote hash و وضعیت push صریح ثبت شده است.
- [ ] P56، runtimeهای frozen، migrationها و feature work ناخواسته شروع نشده‌اند.
- [ ] هر failure از hardening stop rule عبور نکرده و به‌صورت blocker گزارش شده است.

### CORE-HARDEN-P01 Baseline Result

- [x] test و build قبل و بعد PASS؛ ۱۷۵۱ module و فقط warning قدیمی loader.
- [x] هفت route بحرانی desktop مستقیم load شدند؛ console error، redirect و visible mojibake نداشتند.
- [x] `OperationalHistoryPage` مستقل و trend label فارسی `پایدار` ثبت شد.
- [x] mobile Employees در viewport 390 x 844 بدون overflow پاس شد.
- [ ] mobile Dashboard: overflow فعال؛ document width برابر 1112px.
- [ ] mobile Operational History: overflow فعال؛ document width برابر 729px.
- [x] stop rule رعایت شد و هیچ source/UI/CSS fix داخل smoke phase انجام نشد.

### CORE-HARDEN-ROUTE-P01 Mobile Overflow Audit Result

- [x] Dashboard، Operational History و Employees در viewportهای 320/360/390/430 و مرجع desktop برابر 1280 اندازه‌گیری شدند.
- [x] Dashboard: `.weekly-grid` با `min-width:68rem` و زنجیره grid min-content به عنوان علت اصلی trace شد.
- [x] Operational History: placeholder چاپی 96 نقطه‌ای با min-content حدود 681px به عنوان علت اصلی trace شد.
- [x] Employees control: overflow مشترک 15px در عرض 320 به `body { min-width:320px }` و scrollbar trace شد؛ عرض‌های 360/390/430/1280 PASS هستند.
- [x] classification، source trace، propagation chain و repair option برای هر finding ثبت شد.
- [x] regression matrix آینده شامل Dashboard، Operational History، Employees، Analysis و Data Center ثبت شد.
- [x] test و build PASS؛ ۱۷۵۱ module و فقط warning قدیمی test loader.
- [x] verdict برابر `MOBILE_OVERFLOW_ROOT_CAUSE_CONFIRMED` و repair scope برابر `SHARED_PLUS_ROUTE_LOCAL_FIX` است.
- [x] هیچ source، UI، CSS، test، package، route یا storage contract تغییر نکرد.

### CORE-HARDEN-ROUTE-P02 Verified Repair Result

- [x] CSS repair remained limited to `src/styles.css`; no JSX, route, storage, logic, test, package or lock change.
- [x] Full native Chrome/CDP matrix covered 5 routes x 6 viewports (30 cases).
- [x] Document and body overflow are 0px in every case; no unintended page-level horizontal scrollbar remains.
- [x] Dashboard WeeklyGrid and Operational History chart remain contained and locally reachable/readable.
- [x] Data Center passes at 320/360/390/430/1280 without primary-content clipping.
- [x] RTL, navigation, final URL, TemplateHead/visible Persian text, and runtime-crash gates pass.
- [x] Dashboard console events were classified: duplicate React keys as `NON_BLOCKING_WARNING`; Unsplash network failure as `BENIGN_BROWSER_NOISE`; no serious/unknown application error.
- [x] Final test/build PASS with 1,751 modules and only the existing Node loader warning.
- [x] Fresh-profile repeatability rerun covered 13 required cases and PASSed.
- [x] Verdict is `MOBILE_OVERFLOW_REPAIR_VERIFIED`; next gate is storage backup/restore verification under separate authorization.