# Product Import Quality Gate

آخرین به‌روزرسانی: 2026-06-29

## هدف

این سند دروازه کیفیت ورود کالا را طراحی می‌کند تا فقط داده کامل، validate شده، بدون تعارض حل‌نشده و دارای audit مناسب بتواند نامزد ورود به main شود.

## Product Import Quality Gate چیست؟

Quality Gate نقطه تصمیم پس از staging، normalization، validation، duplicate/conflict check، review و dry-run است. gate داده را import نمی‌کند؛ فقط بر اساس شواهد نسخه‌دار یک تصمیم قابل audit تولید می‌کند.

## چرا import کالا به gate نیاز دارد؟

ورود مستقیم کالا می‌تواند بارکد تکراری، گروه یا سنگ اشتباه، وزن نامعتبر، تعارض قیمت و تولید، یا داده کم‌اطمینان را وارد main کند. gate از عبور batch یا item دارای مانع حل‌نشده جلوگیری می‌کند و نیازهای review/approval را شفاف می‌سازد.

## شرط‌های عبور

| شرط | معیار |
|---|---|
| Required features complete | تمام featureهای اجباری محصول یا گروه موجود باشند |
| Validation passed | هیچ validation error مسدودکننده باقی نمانده باشد |
| No unresolved duplicate | duplicate candidate تصمیم‌گیری‌نشده وجود نداشته باشد |
| No unresolved conflict | conflict منبع، مقدار یا mapping حل‌نشده نباشد |
| Barcode safe | قالب و یکتایی بارکد تایید شده باشد |
| Product group valid | گروه کالا معتبر و بدون mismatch باشد |
| Stone mapping valid | stoneType/stoneName به مرجع معتبر mapping شده باشد |
| Weight and unit valid | وزن مثبت، منطقی و واحد معتبر باشد |
| Pricing-impact reviewed | featureهای اثرگذار بر قیمت review لازم را گذرانده باشند |
| Production-impact reviewed | featureهای اثرگذار بر تولید review لازم را گذرانده باشند |
| Confidence acceptable | confidence با سطح ریسک و policy سازگار باشد |
| Audit reference exists | validation، review و تصمیم قابل ردیابی باشند |
| Dry-run report exists | اثر import و risk summary پیش از ورود واقعی موجود باشد |

## تصمیم‌های Gate

| تصمیم | معنی |
|---|---|
| `pass` | همه شرط‌ها بدون مانع برآورده شده‌اند |
| `pass_with_warnings` | warning غیرمسدودکننده ثبت شده و approval لازم موجود است |
| `needs_review` | تصمیم انسانی یا اصلاح هنوز لازم است |
| `blocked` | یک یا چند مانع item-level عبور را متوقف کرده است |
| `quarantine` | منبع، قالب یا داده مشکوک باید جدا نگه‌داری شود |
| `reject_batch` | batch در سطح کلی ناامن یا غیرقابل اعتماد است |

## موارد مسدودکننده

- duplicate barcode حل‌نشده.
- feature اجباری مفقود.
- گروه کالای نامعتبر یا نامشخص.
- stone mismatch حل‌نشده.
- feature بحرانی با low confidence.
- pricing conflict.
- production formula conflict.
- manual-only mapping حل‌نشده.
- قالب منبع ناشناخته یا تغییرکرده بدون approval.

## سطح Item و Batch

- مانع یک item لزوماً کل batch را رد نمی‌کند؛ item می‌تواند blocked یا quarantined شود.
- خطای ساختاری منبع، format ناشناخته، audit ناقص یا نرخ خطای بحرانی می‌تواند `reject_batch` تولید کند.
- split batch فقط پس از ثبت شفاف itemهای accepted، blocked و quarantined مجاز است.

## شواهد لازم برای تصمیم

- Product Attribute Validation Report
- Duplicate/conflict report
- Product Feature Review Decisionها
- confidence و risk summary
- Import Dry-run Report
- source/batch reference
- approval requirement و approval result
- rollback readiness

## خروجی‌های آینده

- `ProductImportQualityGateReport`
- `ProductImportGateDecision`
- `ProductImportRiskSummary`
- `ProductImportApprovalRequirement`

## قوانین

- gate نباید داده main را mutate یا import را اجرا کند.
- `pass_with_warnings` فقط برای warning غیرمسدودکننده و قابل audit مجاز است.
- conflict، duplicate یا manual-only حل‌نشده هرگز `pass` نمی‌گیرد.
- AI suggestion به تنهایی شرط عبور نیست.
- هر تصمیم باید rule version، actor/system source، timestamp و auditReference داشته باشد.

## محدودیت فعلی

هیچ import engine، UI، database، migration، route، localStorage یا اتصال مستقیم به محک ساخته نشده است.
