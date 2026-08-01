# Master Gem Repository Source of Truth and Integration Plan

آخرین به‌روزرسانی: 2026-07-29

## 1. Purpose

این سند منبع حقیقت رسمی Git و برنامه integration آینده Master Gem Core را تعیین می‌کند.

این سند:

- merge نیست.
- integration execution نیست.
- main update نیست.
- source change نیست.
- فقط برنامه و تصمیم معماری repository است.

## 2. Verified Repository State

وضعیت زیر در preflight واقعی CORE-P10 از Git استخراج شد:

| مورد | وضعیت تاییدشده |
|---|---|
| Repository root | `C:/Users/sahel/Documents/komak khalaban` |
| Starting docs branch | `docs/product-inventory-preparation-core-p09` |
| Starting docs commit | `d3382d98d94acbccd4b1124016b4ac70950caf2d` |
| CORE-P10 working branch | `docs/master-gem-repository-consolidation-core-p10` |
| Main branch commit | `b16b1a0 docs: approve cockpit isolated prototype build decision` |
| فاصله starting commit تا main | صفر commit عقب، ۲۸ commit جلو |
| Working tree at preflight | clean |
| Remote | `origin` با fetch/push روی `https://github.com/sahandgem/mrgem-main-system.git` |
| Remote branches visible | `origin/main` و `origin/prototype/cockpit-overview-isolated` |

branchهای CORE-P01 تا CORE-P09، branchهای P54/P55 و branch فعلی CORE-P10 local-only هستند و remote tracking branch ندارند. branch محلی `prototype/cockpit-overview-isolated` نیز از remote متناظر جلوتر گزارش شده است.

در نسبت با starting branch:

- `main`، خط prototype، P54 و branchهای CORE-P01 تا CORE-P09 merged ancestors هستند.
- branch `refactor/workforce-core-stabilization-p55` به‌دلیل commit مستقل P55A unmerged است.
- unmerged بودن P55 branch به معنی گم‌شدن P55 نیست؛ commit `b59b453` در خط docs وجود دارد، اما commit `a1416bf` در آن وجود ندارد.

## 3. Current Source-of-Truth Layers

### A. Stable Main Baseline

`main` روی commit `b16b1a0` قرار دارد.

نقش آن baseline قفل‌شده و پایدار قدیمی است. این branch نباید بدون integration gate، verification و دستور مستقل Project Core تغییر کند.

### B. Project Core Documentation Line

زنجیره CORE-P01 تا CORE-P09 روی `docs/product-inventory-preparation-core-p09` قرار دارد.

این خط کامل‌ترین منبع حقیقت فعلی برای معماری، قوانین اجرا، freeze، قراردادهای مرکزی و مرز Product/Inventory است. وجود source/prototype commitهای قدیمی‌تر در ancestry آن، این branch را به production baseline تبدیل نمی‌کند.

### C. Workforce Source Line

این خط شامل branchهای P54/P55 و commit P55A است:

- P54: `7d8e655`
- P55: `b59b453`
- P55A: `a1416bf`

نقش آن نگهداری تغییرات و verification محدود Workforce refactor است. این خط نباید بدون تصمیم integration وارد main یا به‌صورت ضمنی وارد خط اسناد شود.

### D. Prototype Lines

پوشه‌های `prototypes/cockpit-overview` و `prototypes/cockpit-manager-review-queue` و تاریخچه branch prototype فقط مرجع طراحی mock-only هستند.

prototypeها source production، implementation واقعی یا source of truth داده عملیاتی نیستند و نباید خودکار وارد integration source شوند.

## 4. Official Current Source of Truth Decision

تا پیش از اجرای integration واقعی:

- Source of truth معماری و قوانین: `docs/product-inventory-preparation-core-p09` در `d3382d9`
- Source of truth stable production baseline: `main` در `b16b1a0`
- Source of truth آخرین Workforce verification: `refactor/workforce-core-stabilization-p55` در `a1416bf`

این سه منبع نباید با هم اشتباه گرفته شوند. هیچ‌کدام به‌تنهایی وضعیت کامل آینده پروژه نیستند:

- main جدیدترین تصمیم‌های معماری یا verification را ندارد.
- docs line baseline production رسمی نیست.
- Workforce line قراردادهای CORE-P01 تا CORE-P10 را ندارد.

## 5. Branch And Commit Map

| Track | Branch | Important commit | Contains | Does not contain | Current role | Integration status |
|---|---|---|---|---|---|---|
| Main | `main` | `b16b1a0` | baseline پایدار پیش از ۲۸ commit فعلی | CORE-P01 تا P10، P55 و P55A | stable locked baseline | locked |
| Cockpit prototype | `prototype/cockpit-overview-isolated` | local `c0d8655`؛ remote `b8cbbcc` | prototypeهای mock و اسناد review تا P53 محلی | production integration | design reference | isolated |
| Workforce P54 | `refactor/workforce-core-stabilization-p54` | `7d8e655` | stabilization record | P55A | refactor checkpoint | ancestor of docs line |
| Workforce P55 | `refactor/workforce-core-stabilization-p55` | `b59b453` | انتقال مسیر صفحه و route/test محدود | CORE-P01 تا P10 | Workforce source checkpoint | commit در docs line موجود |
| P55A | همان Workforce P55 | `a1416bf` | فقط تست verification تقویت‌شده | docs CORE-P01 تا P10 | latest Workforce verification | retained, not integrated |
| CORE-P01 | `docs/master-gem-unified-puzzle-core-p01` | `f291a36` | Unified Puzzle Architecture | مراحل بعدی CORE | architecture lock | ancestor of P10 |
| CORE-P02 | `docs/master-gem-central-data-model-core-p02` | `2da4d89` | Central Data Model Contract | مراحل بعدی CORE | data contract | ancestor of P10 |
| CORE-P03 | `docs/master-gem-task-decision-core-p03` | `aafce53` | Task + Decision Contract | implementation | operational contract | ancestor of P10 |
| CORE-P04 | `docs/master-gem-module-interaction-core-p04` | `2e2c4d8` | Module Interaction Map | implementation | interaction contract | ancestor of P10 |
| CORE-P05 | `docs/master-gem-v1-boundary-freeze-core-p05` | `c3ff3a1` | V1 boundary و freeze | resume permission | governance lock | ancestor of P10 |
| CORE-P06 | `docs/master-gem-module-readiness-core-p06` | `8f78327` | readiness scorecard | execution approval | readiness reference | ancestor of P10 |
| CORE-P07 | `docs/master-gem-resume-candidate-core-p07` | `409502a` | P55A candidate decision | resume execution | candidate decision | ancestor of P10 |
| CORE-P08 | `docs/master-gem-post-resume-lock-core-p08` | `7a26b69` | P55A result و freeze re-entry | P55A commit itself | post-resume governance | ancestor of P10 |
| CORE-P09 | `docs/product-inventory-preparation-core-p09` | `d3382d9` | Product/Inventory alignment | product implementation | current architecture source | base of P10 |
| CORE-P10 | `docs/master-gem-repository-consolidation-core-p10` | commit پس از تایید سند | repository plan | integration execution | consolidation plan | docs-only |

## 6. P55A Decision

تصمیم CORE-P10:

`retain_on_workforce_branch_until_integration`

دلایل:

- P55A source را تغییر نداده و فقط تست verification را تقویت کرده است.
- نتیجه گزارش‌شده `npm test` و `npm run build` برای P55A برابر PASS است.
- commit `a1416bf` در repository و روی branch Workforce موجود است، اما در ancestry خط docs فعلی نیست.
- cherry-pick یا merge آن در CORE-P10 ممنوع است.
- حذف آن توصیه نمی‌شود، چون assertionهای آن استقلال OperationalHistory و نبود بدنه قدیمی را دقیق‌تر اثبات می‌کنند.

در integration phase آینده باید به‌صورت صریح تصمیم گرفته شود که خود commit وارد candidate شود یا assertionهای آن روی integration branch بازسازی شوند. تا آن زمان commit روی branch Workforce حفظ شود.

## 7. Main Update Gate

main فقط زمانی می‌تواند تغییر کند که:

- integration plan تصویب شده باشد.
- integration branch مستقل ساخته شود.
- docs line و source line دقیق انتخاب شوند.
- test و build موفق اجرا شوند.
- encoding risk بررسی و نتیجه ثبت شود.
- prototypeها وارد source candidate نشوند.
- subprojectها وارد candidate نشوند.
- rollback commit و مسیر بازگشت مشخص باشد.
- Project Core دستور مستقل و صریح صادر کند.

CORE-P10 هیچ مجوزی برای تغییر main ایجاد نمی‌کند.

## 8. Proposed Future Integration Branch

branch مفهومی آینده:

`integration/master-gem-core-v1-candidate`

این branch در CORE-P10 ساخته نمی‌شود.

هدف آینده آن:

- جمع‌کردن زنجیره تاییدشده اسناد
- اعمال انتخابی source commitهای تاییدشده
- حفظ prototypeها به‌صورت isolated
- اجرای test/build
- بررسی مستقل encoding
- آماده‌سازی candidate برای review
- جلوگیری از merge مستقیم و بدون gate به main

## 9. Integration Order

ترتیب پیشنهادی آینده:

1. Freeze current branch map
2. Create integration branch from approved baseline
3. Bring Project Core docs line
4. Reconcile Workforce source commits
5. Include or recreate P55A verification test
6. Verify route manifest
7. Run tests/build
8. Audit Persian encoding
9. Audit localStorage registry
10. Verify prototypes remain isolated
11. Produce integration report
12. Project Core review
13. Main merge decision در مرحله جدا

هیچ‌یک از این مراحل در CORE-P10 اجرا نمی‌شوند.

## 10. Remote And Backup Strategy

local-only بودن بیشتر branchهای فعلی ریسک از دست‌رفتن یا ابهام Source of Truth ایجاد می‌کند.

مرحله readiness آینده باید مشخص کند:

- branchهای CORE و Workforce کدام‌یک باید قبل از integration به remote محافظتی push شوند.
- کدام branchها فقط local/archive باقی بمانند.
- naming convention نهایی برای `docs/`، `refactor/`، `prototype/` و `integration/` چیست.
- آیا برای `b16b1a0`، `d3382d9` و `a1416bf` tag یا backup reference لازم است.
- چگونه commitهای مهم پیش از integration با hash، remote reference و rollback note محافظت شوند.
- آیا branch prototype محلی که از remote جلوتر است باید جداگانه sync یا archive شود.

در CORE-P10 هیچ push انجام نمی‌شود.

## 11. Current State Document Repair Plan

`01_CURRENT_STATE.md` append-heavy است و خلاصه ابتدای آن با وضعیت‌های جدید یکدست نیست.

برنامه آینده:

- افزودن یک canonical snapshot کوتاه و جدید در ابتدای فایل
- تفکیک واضح بخش‌های Current و Historical
- حفظ تاریخچه قبلی بدون حذف بی‌دلیل
- اشاره روشن به CORE-P01 تا CORE-P10
- نمایش تفاوت main، docs line و Workforce line
- حذف نکردن ادعاهای تاریخی؛ فقط علامت‌گذاری superseded بودن آن‌ها

CORE-P10 فقط این plan را ثبت می‌کند و Current State را بازنویسی نمی‌کند.

## 12. Encoding Remediation Track

ممیزی، mojibake یا خرابی متن فارسی را در `WorkforcePages.tsx` و چند صفحه استخراج‌شده گزارش کرده است.

این مشکل:

- جدا از P56 است.
- جدا از integration execution است.
- نباید با refactor معماری ترکیب شود.

فاز آینده پیشنهادی:

`CORE-RESUME-ENCODING-P01 — Persian UI Encoding Audit and Repair`

این فاز فقط بعد از integration readiness و با file whitelist، backup، exact string diff، no logic change، test/build و visual verification مجاز است. CORE-P10 هیچ encodingی را اصلاح نمی‌کند.

## 13. Workforce Monolith Track

`WorkforcePages.tsx` در ممیزی با روش `ReadAllLines` برابر ۴۳۸۴ خط گزارش شد.

P56:

- شروع نشده است.
- approved نیست.
- نباید پیش از integration clarity اجرا شود.

فاز احتمالی آینده `CORE-RESUME-P56` است، اما فقط پس از repository consolidation decision، integration track decision، انتخاب target page، file whitelist، ممنوعیت feature/behavior change و gate اجباری test/build.

## 14. Prototype Isolation Rule

`cockpit-overview` و `cockpit-manager-review-queue` mock-only و frozen هستند.

- prototype commitها نباید خودکار وارد integration source شوند.
- فقط design/reference docs تاییدشده می‌توانند در برنامه معماری استفاده شوند.
- prototype approval مجوز production implementation یا main merge نیست.
- هر implementation به approval مستقل نیاز دارد.

## 15. Subproject Isolation Rule

موارد زیر در CORE-P10 وارد integration نمی‌شوند:

- Product/Mahak
- Finance/Audit
- Production Center
- Mobile
- Automation

ورود آینده فقط از طریق contract، adapter، migration plan، connector و review مستقل مجاز است. direct merge ممنوع باقی می‌ماند.

## 16. Decision Register

| Decision | Status | Reason | Execution allowed now? | Required future instruction |
|---|---|---|---|---|
| main stays locked | active | baseline پایدار است | NO | Main Integration Approval |
| docs line remains architecture source | active | کامل‌ترین زنجیره CORE است | YES, docs reference only | CORE-P11 |
| P55A retained on Workforce branch | active | تست verification ارزشمند و source-neutral است | NO integration now | Integration Execution phase |
| no P56 | active | integration clarity کامل نیست | NO | `CORE-RESUME-P56` |
| no Cockpit implementation | active | prototype فقط mock/frozen است | NO | Cockpit Implementation Approval |
| no subproject merge | active | contract/adapter boundary لازم است | NO | independent module integration approval |
| no remote push | active for CORE-P10 | دستور push صادر نشده | NO | Remote Protection instruction |
| integration branch not created yet | active | CORE-P10 planning-only است | NO | CORE integration execution instruction |
| encoding repair deferred | active | باید scope مستقل داشته باشد | NO | `CORE-RESUME-ENCODING-P01` |
| Current State cleanup planned | planned | خلاصه فعلی append-heavy است | NO in CORE-P10 | canonical snapshot docs phase |

## 17. Recommended Next Phase

پیشنهاد اصلی:

`CORE-P11 — Integration Execution Readiness Gate`

این انتخاب با شواهد repository سازگار است، زیرا پیش از هر integration باید baseline، commit selection، remote protection، rollback، encoding gate و تست‌های candidate دقیق شوند.

CORE-P11 نیز باید docs-only باشد و هنوز integration branch، merge، cherry-pick، source change یا main update انجام ندهد.

## 18. Final Lock Statement

CORE-P10 defines repository source of truth and integration planning only.

No merge was authorized.
No main update was authorized.
No source change was authorized.
P56 remains paused.
Encoding repair remains deferred.
Cockpit remains frozen.
Subprojects remain isolated.
The next action requires a separate Project Core instruction.
