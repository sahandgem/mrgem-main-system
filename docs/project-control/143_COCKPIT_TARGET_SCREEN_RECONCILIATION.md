# Cockpit Target Screen Reconciliation and Implementation Readiness Review

تاریخ ثبت: `2026-06-30`

## 1. مشخصات تصمیم

| مورد | نتیجه |
|---|---|
| Phase | `P51` |
| نوع فعالیت | review و design reconciliation؛ بدون implementation |
| Branch | `prototype/cockpit-overview-isolated` |
| Main baseline | `b16b1a0`، قفل |
| Prototype changed | `NO` |
| Main changed | `NO` |
| Merge happened | `NO` |
| Implementation approved | `NO` |

این ارزیابی، هدف مستندشده کابین مرکزی را با prototypeها، اسناد معماری و قابلیت‌های موجود Workforce تطبیق می‌دهد. هیچ تصویر هدف تازه‌ای در ورودی P51 ضمیمه نشده بود؛ بنابراین مرجع تطبیق، screen specها و نقشه کارت‌های تاییدشده پروژه است.

## 2. Current Cockpit Assets

| دارایی | محل | وضعیت | آخرین تصمیم |
|---|---|---|---|
| Cockpit Overview Prototype | `prototypes/cockpit-overview/` | mock-only و frozen | بازبینی mobile تایید شده؛ merge و implementation تایید نشده است |
| Manager Review Queue Prototype | `prototypes/cockpit-manager-review-queue/` | mock-only و `FROZEN_AFTER_APPROVED_ITERATION` | P48=`PASS`، P49=`approved_for_iteration`، P50=freeze |
| Cockpit design contracts | `docs/project-control/46_*`، `48_*`، `93_*` تا `99_*` | docs-only | مبنای مفهومی overview، کارت‌ها و drill-downها |
| Manager Review Queue contracts | `docs/project-control/120_*` تا `142_*` | docs/prototype reviewed | تغییر بعدی فقط با approval مستقل |

هیچ‌یک از prototypeها route، اتصال به `src`، API، backend، database، auth یا داده واقعی ندارند.

## 3. Target Cockpit Map

نقشه هدف از یک نمای خلاصه مدیریتی به drill-downهای قابل ردیابی تشکیل می‌شود:

1. **Executive Summary:** وضعیت کل، امتیاز کنترل، بحران‌ها، کارهای منتظر تصمیم و تازگی داده.
2. **Workforce:** برنامه هفتگی، فشار کاری، یافته‌ها، سلامت ماهانه و ریسک عملیاتی.
3. **Manager Review Queue:** صف تصمیم، اولویت، evidence، confidence، پیشنهاد و audit.
4. **Financial Pressure:** جریان ورودی/خروجی، نقدینگی، اقساط و موارد تایید مدیر.
5. **Product:** کالا، barcode، کیفیت import، موجودی و خروجی محک.
6. **Production:** وضعیت تولید، فرمول، نیاز مواد، هزینه و anomaly.
7. **Inventory:** موجودی، گردش، mismatch و کمبود.
8. **Sales:** فروش، پوشش پاسخ مشتری و سیگنال‌های عملکرد.
9. **Alerts:** هشدارهای چندماژولی با شدت، دلیل و مالک پیگیری.
10. **AI Suggestions:** پیشنهاد همراه reason، confidence، risk flag و approval boundary.
11. **Audit:** تاریخچه تصمیم، actor، rule/version، before/after و rollback reference.
12. **Drill-down Panels:** جزئیات هر signal بدون پنهان‌کردن منبع یا قطعیت داده.

## 4. Coverage Status

| بخش هدف | status | current source | data readiness | implementation readiness | جمع‌بندی |
|---|---|---|---|---|---|
| Executive Summary | `prototype_exists` | Cockpit prototype + Workforce | `mock_only` در prototype؛ خلاصه Workforce در main واقعی است | `ready_for_plan` | shell تصویری موجود است، اتصال واقعی هنوز انجام نشده |
| Workforce | `partially_designed` | Workforce | `real_available` | `ready_for_plan` | داده و تحلیل داخلی موجود است؛ قرارداد read-only cockpit لازم است |
| Manager Review Queue | `prototype_exists` | Manager Review Queue prototype + Workforce | prototype=`mock_only`؛ queue داخلی=`real_available` | `ready_for_plan` | تطبیق schema و boundary اقدام قبل از اجرا لازم است |
| Financial Pressure | `docs_only` | Finance subproject | `external_subproject` | `blocked_by_policy` | فقط data contract آینده؛ merge مستقیم ممنوع |
| Product | `docs_only` | Product subproject | `external_subproject` | `blocked_by_policy` | مدل/adapter باید مستقل تایید شود |
| Production | `docs_only` | None | `missing` | `needs_data_contract` | فقط concept موجود است |
| Inventory | `docs_only` | None | `missing` | `needs_data_contract` | مدل مرکزی و producer معتبر ندارد |
| Sales | `missing` | None | `missing` | `needs_design` | target تعریف کلی دارد، screen/data contract ندارد |
| Alerts | `partially_designed` | Workforce + Cockpit prototype | Workforce=`real_available`؛ cross-module=`missing` | `ready_for_plan` برای Workforce-only | هشدار چندماژولی هنوز قابل ساخت نیست |
| AI Suggestions | `partially_designed` | Workforce + Cockpit prototype | Workforce recommendations=`real_available`؛ AI cross-module=`mock_only` | `ready_for_plan` برای suggestion-only | نباید به‌عنوان تصمیم خودکار نمایش داده شود |
| Audit | `partially_designed` | Workforce | `real_available` | `ready_for_plan` | operational history و decision reports قابل خواندن‌اند |
| Drill-down Panels | `prototype_exists` | دو Cockpit prototype | `mock_only` | `needs_design` | drill-down واقعی به قرارداد navigation و داده نیاز دارد |

## 5. Workforce Connection Readiness

موارد زیر در main فعلی producer یا مدل واقعی دارند و می‌توانند در یک برنامه implementation آینده، فقط به شکل read-only به cockpit عرضه شوند:

| قابلیت | منبع موجود | آمادگی اتصال |
|---|---|---|
| `controlScore` و `findings` | `workforceAnalyzer` و مدل `AnalysisFinding` | بالا؛ نیازمند snapshot/read adapter پایدار |
| `recommendations` | `workforceRecommendationEngine` | بالا؛ باید suggestion-only باقی بماند |
| decision queue | `workforceDecisionQueue` و `DecisionQueueItem` | متوسط؛ semantics اقدام و audit باید با prototype تطبیق یابد |
| reports | `decisionReportService` و صفحات گزارش/آرشیو/مقایسه | بالا برای summary خواندنی |
| monthly health | `monthlyHealthAnalyzer` | بالا برای KPI و trend summary |
| preventive alerts | `preventiveAlertAnalyzer` و state service | بالا؛ تغییر status از cockpit فعلاً خارج از scope |
| backup / maintenance / readiness | سرویس backup و maintenance و `operationalReadinessAnalyzer` | بالا برای status-only |
| operations calendar | `operationsCalendarAnalyzer` و service | متوسط؛ فقط due/overdue summary در slice اول |
| baseline drift / history | `baselineDriftAnalyzer` و `operationalHistoryService` | بالا برای trend/audit summary |

این آمادگی به معنی اجازه اتصال نیست. P51 هیچ adapter، component، route یا import واقعی ایجاد نمی‌کند.

## 6. External Subprojects Readiness

- پروژه کالا/محک (`mahak-web-version`) یک subproject مرجع است؛ merge مستقیم آن ممنوع است.
- پروژه مالی (`audit-app`) یک subproject مرجع است؛ merge مستقیم آن ممنوع است.
- در آینده فقط data contract، schema/model منتخب و snapshot تاییدشده می‌تواند پس از staging و validation به cockpit داده بدهد.
- تا پیش از approval مستقل، کارت‌های Finance، Product، Production و Inventory باید mock/placeholder یا غیرفعال بمانند و نباید ظاهری شبیه داده زنده داشته باشند.

## 7. مقایسه First Safe Implementation Candidates

| گزینه | benefit | risk | required files در فاز آینده | forbidden files/areas | rollback | approval needed |
|---|---|---|---|---|---|---|
| Real Cockpit Overview Shell using Workforce summary only | ارزش سریع با داده موجود، سطح خواندنی و blast radius محدود | coupling به ساختار بزرگ WorkforcePages و برداشت اشتباه از تازگی داده | plan مستقل، read adapter، componentهای ایزوله، تست contract و route decision تاییدشده | تغییر analyzer/service business logic، storage key، prototype frozen، finance/product | حذف route/component/adapter همان slice و بازگشت به dashboard فعلی | implementation approval + route approval + merge approval |
| Manager Review Queue from existing Workforce decision queue | نزدیک‌ترین تطبیق با prototype دوم و جریان تصمیم موجود | action semantics، persistence و audit ممکن است یکسان نباشد | queue adapter خواندنی، mapping contract، تست empty/error states | اقدام واقعی approve/reject، تغییر decision engine یا storage بدون approval | حذف adapter/screen و حفظ queue فعلی | data mapping approval + action boundary approval + implementation approval |
| Financial Pressure mock card only | حفظ شکل هدف cockpit بدون اتصال حساس | ممکن است mock با داده واقعی اشتباه شود و ارزش عملی محدود دارد | fixture مشخص، watermark نمایشی و contract docs | audit-app، database، auth، API، داده بانکی واقعی | حذف کارت/fixture | design approval؛ برای main همچنان implementation approval |
| Product/Inventory placeholder only | نمایش roadmap بدون ادغام زیرپروژه | ایجاد انتظار کاذب و شلوغی UI | empty-state تاییدشده و status label روشن | mahak merge، import واقعی، migration، موجودی واقعی | حذف placeholder | design و implementation approval |

### پیشنهاد نهایی

**اولین نامزد امن آینده:** `Real Cockpit Overview Shell using Workforce summary only`.

دلایل انتخاب:

- تنها دامنه‌ای است که producerهای واقعی و تست‌شده در main دارد.
- می‌تواند کاملاً read-only و بدون action حساس تعریف شود.
- Finance/Product/Production/Inventory را وارد main نمی‌کند.
- rollback آن در صورت ایزوله‌بودن فایل‌ها روشن و محدود است.

این فقط پیشنهاد readiness است و اجرای آن در P51 مجاز نیست.

## 8. پیش‌نیازهای Implementation واقعی

1. P52 باید contract دقیق Workforce summary، freshness، loading، empty و error state را فقط روی کاغذ تعیین کند.
2. مالکیت فایل‌ها و isolation boundary باید قبل از build تصویب شود.
3. تصمیم route و navigation باید approval مستقل داشته باشد.
4. prototype-to-production mapping باید بدون import مستقیم فایل prototype تعریف شود.
5. read-only بودن slice اول و ممنوعیت mutation/action باید تست‌پذیر باشد.
6. test plan، rollback plan و merge checklist باید پیش از build تایید شوند.
7. داده demo باید از داده واقعی قابل تشخیص باشد و stale status نمایش داده شود.
8. هیچ قرارداد خارجی مالی/کالا پیش از staging و approval وارد slice نشود.

## 9. تصمیم‌های باز مرکز کنترل

- آیا P52 فقط Overview Workforce-only را plan کند یا ابتدا mapping صف تصمیم را دقیق کند؟
- route جدید مجاز خواهد بود یا shell باید پشت entry ایزوله باقی بماند؟
- freshness و snapshot cadence داده Workforce چگونه نمایش داده شود؟
- چه subsetی از audit/history در overview مجاز است؟
- معیار approval برای انتقال patternهای prototype به production چیست؟
- آیا placeholderهای ماژول‌های فاقد داده اصلاً نمایش داده شوند؟

## 10. Main / Merge Policy

- `main` روی `b16b1a0` قفل است.
- merge در P51 ممنوع است و انجام نشده است.
- implementation نیازمند approval جداست.
- تایید این سند مجوز ساخت واقعی نیست.
- build فقط در یک فاز تعریف‌شده پس از plan و approval مستقل مجاز است.
- ورود به main نیز پس از build، review و merge approval مستقل انجام می‌شود.

## 11. P52 Proposal

نام پیشنهادی:

`Cockpit Implementation Plan - Workforce-only Read-only First Slice`

P52 باید فقط plan باشد و این موارد را نهایی کند: data contract، file boundary، route decision، UI states، freshness، test plan، rollback و approval gates. هیچ کد، route، prototype change یا integration در P52 ساخته نشود.
