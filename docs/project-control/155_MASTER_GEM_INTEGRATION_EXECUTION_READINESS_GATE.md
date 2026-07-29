# Master Gem Integration Execution Readiness Gate

آخرین به‌روزرسانی: 2026-07-29

## 1. Purpose

این سند تعیین می‌کند repository برای ساخت integration candidate آماده است یا نه.

این سند:

- integration execution نیست.
- merge نیست.
- cherry-pick نیست.
- main update نیست.
- فقط readiness gate و manifest است.

## 2. Canonical Repository Snapshot

| مورد | وضعیت تاییدشده |
|---|---|
| Repository root | `C:/Users/sahel/Documents/komak khalaban` |
| Stable main | `b16b1a020168516b2f8ad3e0bcd41e1193c8a824` |
| CORE-P11 branch | `docs/master-gem-integration-readiness-core-p11` |
| CORE-P11 starting commit | `4515b93e99d2cf2eeb255d8553c22f452d1d6ab3` |
| Working tree at P11 preflight | clean، پس از بازیابی مجاز و hash-verified سند ۱۵۴ |
| Distance from main | ۲۹ commit جلو، صفر commit عقب |
| Remote | `origin` روی `https://github.com/sahandgem/mrgem-main-system.git` |
| Remote branches | `origin/main` و `origin/prototype/cockpit-overview-isolated` |
| Integration execution | انجام نشده |
| Main state | locked و unchanged |

branchهای `docs/master-gem-*`، `docs/product-inventory-preparation-core-p09` و `refactor/workforce-core-stabilization-p54/p55` local-only هستند. branch محلی prototype نیز چهار commit از remote متناظر جلوتر گزارش شده است.

## 3. Main-to-HEAD Commit Manifest

این manifest وضعیت دقیق `main..HEAD` را پیش از تغییرات مستنداتی CORE-P11 ثبت می‌کند: ۲۹ commit جلو و صفر commit عقب.

| Hash | Subject | Type | Track | Include in future candidate? | Reason |
|---|---|---|---|---|---|
| `f5f8b5e` | prototype: add isolated cockpit overview mock | prototype | Cockpit | YES, isolated | مرجع mock-only؛ بدون runtime wiring |
| `b9cf24f` | docs: review isolated cockpit overview prototype | mixed | Cockpit | YES, isolated | docs و review-notes prototype |
| `75155fe` | docs: record cockpit prototype human visual review | mixed | Cockpit | YES, isolated | سابقه review؛ production approval نیست |
| `8f6083c` | prototype: refine cockpit overview mobile sizing | prototype | Cockpit | YES, isolated | تغییر CSS فقط در prototype |
| `f9d6abb` | docs: record cockpit prototype mobile re-review approval | mixed | Cockpit | YES, isolated | سابقه تایید iteration و freeze |
| `755c46c` | docs: design cockpit manager review queue screen | docs | Cockpit | YES | design contract |
| `e25d5fd` | docs: review manager review queue cockpit design | docs | Cockpit | YES | review و hold boundary |
| `e1dd23a` | docs: prepare manager review queue prototype planning | docs | Cockpit | YES | test/rollback/file-scope plan |
| `7209bf1` | docs: approve manager review queue isolated prototype build | docs | Cockpit | YES | approval محدود prototype، نه production |
| `56c6075` | prototype: add isolated manager review queue mock | prototype | Cockpit | YES, isolated | mock-only و بدون runtime wiring |
| `d5be9bb` | docs: review manager review queue isolated prototype | mixed | Cockpit | YES, isolated | docs و review-notes prototype |
| `75a6f64` | docs: add project operating rules and parallel workstream control | docs | Repository Control | YES | قواعد اجرایی و stop rules |
| `b8cbbcc` | P49 record manager review queue human approval | docs | Cockpit | YES | نتیجه human review |
| `b36d338` | P50 freeze manager review queue prototype | docs | Cockpit | YES | freeze رسمی prototype |
| `833632e` | P51 reconcile cockpit target screen readiness | docs | Cockpit | YES | reconciliation مستنداتی |
| `a5d5d6c` | P52 lock master gem aircraft architecture | docs | Project Core | YES | قفل معماری مادر |
| `c0d8655` | P53 add master gem module build priority matrix | docs | Project Core | YES | اولویت ساخت ماژول‌ها |
| `7d8e655` | P54 record workforce core stabilization | docs | Workforce | YES | checkpoint تثبیت Workforce |
| `b59b453` | P55 move operational history page | mixed | Workforce | YES | تنها source/test delta تاییدشده نسبت به main |
| `f291a36` | CORE-P01 lock unified puzzle architecture | docs | Project Core | YES | قرارداد معماری |
| `2da4d89` | CORE-P02 lock central data model contract | docs | Project Core | YES | قرارداد داده مرکزی |
| `aafce53` | CORE-P03 add task decision core contract | docs | Project Core | YES | قرارداد Task/Decision |
| `2e2c4d8` | CORE-P04 add module interaction map | docs | Project Core | YES | نقشه تعامل ماژول‌ها |
| `c3ff3a1` | CORE-P05 add v1 build boundary and freeze rules | docs | Project Core | YES | V1 boundary و freeze |
| `8f78327` | CORE-P06 add module readiness scorecard | docs | Project Core | YES | readiness scorecard |
| `409502a` | CORE-P07 add resume candidate decision | docs | Project Core | YES | تصمیم candidate محدود P55A |
| `7a26b69` | CORE-P08 add post resume lock decision | docs | Project Core | YES | نتیجه P55A و freeze re-entry |
| `d3382d9` | CORE-P09 add product inventory preparation alignment | docs | Project Core | YES | Product/Inventory alignment |
| `4515b93` | CORE-P10 add repository consolidation plan | docs | Repository Control | YES | Source-of-Truth و integration plan |

هیچ commit از این تاریخچه برای حذف پیشنهاد نمی‌شود. prototype commitها در candidate به‌عنوان history و reference حفظ می‌شوند، اما از runtime production جدا می‌مانند. P55A خارج از این range است و در بخش ۶ تصمیم‌گیری شده است.

### Important Commit Verification

| Commit | Exists | Reachable from P11 HEAD | Reachable from main | Changed paths | Role |
|---|---|---|---|---|---|
| `b16b1a0` | YES | YES | YES | `01/02/03/08` و docs `111-114` | stable main baseline |
| `7d8e655` | YES | YES | NO | `01_CURRENT_STATE`، `03_PHASE_LOG`، `08_BACKLOG` | P54 stabilization record |
| `b59b453` | YES | YES | NO | docs control، `WorkforcePages`، OperationalHistory path، routes، test | P55 source checkpoint |
| `a1416bf` | YES | NO | NO | فقط `tests/analysis.test.ts` | P55A verification |
| `f291a36` | YES | YES | NO | control docs و سند `146` | CORE-P01 |
| `2da4d89` | YES | YES | NO | control docs و سند `147` | CORE-P02 |
| `aafce53` | YES | YES | NO | control docs و سند `148` | CORE-P03 |
| `2e2c4d8` | YES | YES | NO | control docs و سند `149` | CORE-P04 |
| `c3ff3a1` | YES | YES | NO | control docs و سند `150` | CORE-P05 |
| `8f78327` | YES | YES | NO | control docs و سند `151` | CORE-P06 |
| `409502a` | YES | YES | NO | control docs و سند `152` | CORE-P07 |
| `7a26b69` | YES | YES | NO | control docs و سند `153` | CORE-P08 |
| `d3382d9` | YES | YES | NO | control docs و Product alignment | CORE-P09 |
| `4515b93` | YES | YES | NO | فقط سند `154` | CORE-P10 |

## 4. Verified Track Map

### Stable Main

- Branch/commit: `main` در `b16b1a0`
- Role: baseline قفل‌شده پیش از ۲۹ commit فعلی
- Integration status: unchanged؛ merge approval ندارد

### Workforce Source

- P54 در `7d8e655` فقط docs است.
- P55 در `b59b453` ancestor خط فعلی و تنها delta source/test نسبت به main است.
- OperationalHistory در P55 از `system` به `operations` منتقل شده و route path تغییر نکرده است.

### Project Core Docs

- CORE-P01 تا CORE-P10 به‌صورت خطی و reachable از branch فعلی‌اند.
- این خط منبع حقیقت معماری و governance است، نه stable production baseline.

### Prototype References

- دو prototype Cockpit در repository حفظ می‌شوند.
- جست‌وجوی source و package هیچ runtime reference به پوشه prototype پیدا نکرد.
- tokenهای storage/API/backend یافت‌شده فقط متن README/checklist بودند، نه استفاده اجرایی.

### P55A Verification

- Branch: `refactor/workforce-core-stabilization-p55`
- Commit: `a1416bf`
- Merge-base با خط فعلی: `b59b453`
- فقط ۱۸ خط assertion به `tests/analysis.test.ts` اضافه می‌کند.
- هیچ source commit اضافی همراه آن نیست.

## 5. Source Delta From Main

`git diff main..HEAD -- src tests` فقط چهار file entry و چهار insertion در برابر سه deletion نشان داد:

| Path | Change | Owner |
|---|---|---|
| `src/WorkforcePages.tsx` | import path یک‌خطی | P55 / Workforce |
| `src/pages/workforce/system/OperationalHistoryPage.tsx` | rename کامل از این مسیر | P55 / Workforce |
| `src/pages/workforce/operations/OperationalHistoryPage.tsx` | مقصد rename | P55 / Workforce |
| `src/routes/workforceRoutes.tsx` | lazy import path یک‌خطی | P55 / Workforce |
| `tests/analysis.test.ts` | path assertion به‌روزشده | P55 / Workforce |

خلاصه Git rename را `R100` گزارش می‌کند. هیچ source change غیر Workforce، feature جدید، subproject source یا package delta در `main..HEAD` وجود ندارد. source delta محدود، قابل توضیح و مناسب candidate است.

## 6. P55A Readiness Decision

تصمیم:

`future_cherry_pick_recommended`

شواهد:

- `a1416bf` دقیقاً یک commit روی merge-base برابر `b59b453` است.
- فقط `tests/analysis.test.ts` را تغییر می‌دهد.
- پس از P55، همان بخش test در خط docs فعلی تغییر نکرده است؛ `git diff b59b453..HEAD -- tests/analysis.test.ts` خالی بود.
- patch پنج assertion اصلی را اضافه می‌کند: نبود function/export قدیمی، یک dispatcher reference، import مستقل route و componentKey صحیح.
- آوردن commit اصلی attribution و تاریخچه verification را بهتر از بازسازی دستی حفظ می‌کند.

در CORE-P11 cherry-pick انجام نمی‌شود. این تصمیم فقط برای CORE-INTEGRATE-P01 معتبر است و آن مرحله باید پس از cherry-pick، test/build واقعی اجرا کند.

## 7. Candidate Base Decision

Base منتخب:

`docs/master-gem-integration-readiness-core-p11`

commit دقیق base، commit نهایی همین CORE-P11 با پیام `CORE-P11 add integration readiness gate` خواهد بود.

دلایل انتخاب:

- تمام ۲۹ commit تاییدشده `main..4515b93` را با تاریخچه کامل حفظ می‌کند.
- Canonical Current Snapshot و readiness manifest را نیز دارد.
- P55 source delta از قبل در ancestry آن است.
- استفاده از `main` نیازمند بازسازی انتخابی ۲۹ commit و افزایش خطر جاافتادن governance history است.
- P55A تنها کمبود شناخته‌شده و test-only است و باید بعداً مشخصاً روی candidate اعمال شود.
- prototypeها در ancestry حفظ می‌شوند، ولی پوشه‌های isolated باقی می‌مانند و runtime wiring ندارند.

## 8. Future Integration Candidate Manifest

### Base

- Branch: `docs/master-gem-integration-readiness-core-p11`
- Commit: commit نهایی CORE-P11

### Included Existing History

- Stable ancestor: `b16b1a0`
- Existing range: `f5f8b5e..4515b93`
- Source: فقط P55 Workforce delta
- Tests: P55 path assertion
- Docs: operating rules، cockpit review/freeze و CORE-P01 تا CORE-P11
- Prototypes: حفظ‌شده فقط به‌عنوان mock/reference isolated

### Additional Required Commit

- `a1416bf P55A verify operational history extraction cleanup`
- روش آینده: cherry-pick مشخص روی integration candidate

### Explicit Exclusions

- direct Product/Mahak merge
- Finance/Audit
- Production Center
- Cockpit runtime implementation یا route wiring
- encoding repair
- P56
- backend/database/auth/API
- package change غیرمرتبط
- هر migration یا storage redesign

### Required Candidate Verification

1. clean status
2. `npm test`
3. `npm run build`
4. route manifest duplicate/path check
5. OperationalHistory standalone and no-old-body check
6. prototype isolation check
7. audit کامل registry بیست‌وچهار کلید localStorage
8. encoding audit بدون اصلاح در initial integration
9. backup/restore test coverage
10. visual preview در صورت امکان
11. integration report و rollback reference

## 9. Readiness Gates

### Repository Gate

- working tree پیش از candidate باید clean باشد.
- همه ۲۹ commit و P55A باید reachable باشند.
- commit ناشناخته یا mixed بدون classification مجاز نیست.
- local-only branch protection باید در execution report ثبت شود.

### Source Gate

- source delta فعلی فهمیده و محدود به P55 است.
- feature نامرتبط یا subproject source مجاز نیست.
- هر delta جدید execution را متوقف می‌کند.

### Test Gate

- P55A باید با commit اصلی وارد candidate شود.
- `npm test` در execution phase الزامی است.
- `npm run build` در execution phase الزامی است.
- failure مانع ادامه candidate review است.

### Prototype Gate

- prototypeها mock-only باقی بمانند.
- هیچ runtime import، route، storage یا production wiring مجاز نیست.

### Encoding Gate

- mojibake در `WorkforcePages.tsx` و چند صفحه استخراج‌شده شناسایی شده است.
- encoding fix نباید با initial integration ترکیب شود.
- main merge تا ثبت encoding risk review و visual impact مسدود می‌ماند.

### Storage Gate

- registry شامل ۲۴ کلید localStorage است.
- initial integration نباید backend migration یا storage redesign بسازد.
- backup/restore و coverage tests باید در candidate اجرا شوند.

### Main Gate

- Project Core approval مستقل
- rollback reference
- integration report
- test/build PASS
- encoding risk disposition
- no direct merge

## 10. Blocking Findings

| Finding | Status | Effect |
|---|---|---|
| P55A هنوز در line فعلی نیست | `blocking_main_merge` | در CORE-INTEGRATE-P01 باید cherry-pick و verify شود |
| test/build روی candidate آینده هنوز اجرا نشده | `blocking_main_merge` | execution phase باید PASS ثبت کند |
| encoding/mojibake review نهایی نشده | `blocking_main_merge` | اصلاح جداست، اما risk disposition قبل از main لازم است |
| integration report و rollback reference وجود ندارد | `blocking_main_merge` | باید توسط candidate execution تولید شود |
| بیشتر branchهای مهم local-only هستند | `non_blocking_follow_up` | قبل از main decision به remote protection plan نیاز دارند |
| prototype branch محلی از remote جلوتر است | `informational` | runtime candidate را تغییر نمی‌دهد؛ باید isolated بماند |
| Current State قبلی append-heavy بود | `non_blocking_follow_up` | Canonical Snapshot در CORE-P11 اضافه شد؛ cleanup تاریخی بعداً |
| P56 و subproject integration مجوز ندارند | `informational` | خارج از candidate manifest باقی می‌مانند |

مانع `blocking_candidate_creation` یافت نشد. موانع موجود ساخت candidate را متوقف نمی‌کنند، اما merge آن به main را مسدود می‌کنند.

## 11. Readiness Verdict

`READY_WITH_CONDITIONS`

- آمادگی ساخت integration candidate: `READY`
- آمادگی merge candidate به main: `NOT_READY`

repository برای ساخت candidate مستقل آماده است، زیرا history، source delta، base و P55A patch مشخص‌اند. candidate تا اجرای test/build، ورود P55A، encoding risk review، storage verification و Project Core approval نباید به main merge شود.

## 12. Exact Next Instruction

`CORE-INTEGRATE-P01 — Create Master Gem Core V1 Integration Candidate`

این phase باید دستور مستقل با branch دقیق، cherry-pick مجاز P55A، verification، rollback و ممنوعیت main merge داشته باشد. CORE-P11 آن را اجرا نمی‌کند.

## 13. What Remains Frozen

- P56
- encoding repair
- Cockpit implementation
- Task/Decision runtime
- Product/Mahak، Finance/Audit، Production، Mobile و Automation integration
- backend/database/auth/API
- main merge
- remote push

## 14. Final Lock Statement

CORE-P11 evaluates integration readiness only.

No integration branch was created.
No commit was cherry-picked.
No source or test was changed.
main remains locked.
Code Main remains paused.
A separate Project Core instruction is required for execution.
