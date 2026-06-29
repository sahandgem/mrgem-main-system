# Product Import Synthetic Data Protocol

آخرین به‌روزرسانی: 2026-06-29

## هدف

این سند پروتکل داده مصنوعی برای طراحی و آزمون امن prototype آینده Product Import را تعریف می‌کند تا هیچ داده واقعی مشتری، مالی، کالا یا محک وارد محیط نمایشی نشود.

## Synthetic Data Protocol چیست؟

مجموعه‌ای از قواعد برای ساخت fixtureهای ساختگی، تکرارپذیر، قابل تست و دارای expected result است. داده مصنوعی باید رفتار معماری را آزمایش کند، بدون اینکه نمونه‌ای قابل انتساب به اشخاص، تراکنش‌ها یا رکوردهای واقعی باشد.

## چرا Prototype باید با داده مصنوعی شروع شود؟

- ریسک افشای اطلاعات واقعی را حذف می‌کند.
- نتیجه سناریوها قابل تکرار و مقایسه می‌شود.
- validation، review، gate و audit بدون آلودگی داده production بررسی می‌شوند.
- failure caseها را می‌توان عمداً و کنترل‌شده ساخت.
- وابستگی مستقیم به محک یا sourceهای تاریخی ایجاد نمی‌شود.

## سناریوهای داده مصنوعی

| سناریو | نتیجه مورد انتظار کلی |
|---|---|
| `valid_product` | validation معتبر و gate نامزد pass |
| `missing_required_feature` | block یا correction required |
| `duplicate_barcode` | duplicate warning و block/review |
| `stone_mismatch` | review یا block تا mapping معتبر |
| `group_mismatch` | review یا correction required |
| `invalid_weight` | validation error و block |
| `invalid_unit` | review، correction یا safe normalization محدود |
| `pricing_impact_conflict` | review مدیریتی و عدم pass کامل |
| `production_impact_conflict` | review تخصصی و block |
| `low_confidence_feature` | review required |
| `manual_only_mapping` | بدون auto action و نیازمند تصمیم انسانی |

## ویژگی‌های الزامی داده مصنوعی

- بدون اطلاعات واقعی مشتری یا شخص.
- بدون اطلاعات مالی واقعی.
- بدون کپی مستقیم از داده یا schema محک.
- ساختگی و غیرقابل انتساب به عملیات واقعی.
- deterministic و قابل تکرار با fixture version.
- قابل تست با expected result مشخص.
- دارای risk/confidence نمونه و توضیح علت.
- مستقل از database، auth و storage اصلی.

## قرارداد هر Sample

| فیلد | نقش |
|---|---|
| `sampleId` | شناسه ساختگی و یکتا |
| `productCode` | کد مصنوعی با prefix مشخص demo |
| `productName` | نام کاملاً ساختگی |
| `groupCode` | گروه مصنوعی یا reference mock |
| `featureSet` | featureهای نمونه برای سناریو |
| `sourceType` | منبع mock مانند synthetic_excel |
| `expectedValidationResult` | نتیجه validation مورد انتظار |
| `expectedGateDecision` | تصمیم Quality Gate مورد انتظار |
| `expectedReviewNeed` | review لازم است یا نه |
| `expectedRiskFlags` | riskFlags مورد انتظار |

اطلاعات تکمیلی پیشنهادی: `fixtureVersion`، `scenarioType`، `expectedConfidenceLevel` و `notes`.

## قواعد تولید و نگه‌داری Fixture

- هر sample فقط یک هدف تست اصلی داشته باشد؛ سناریوی ترکیبی جداگانه نام‌گذاری شود.
- شناسه‌ها و نام‌ها با prefix روشن مانند `DEMO` یا `SYNTH` از داده واقعی متمایز شوند.
- expected result همراه fixture version تغییر کند.
- random generation بدون seed ثابت برای تست مبنا استفاده نشود.
- fixture نباید شباهت ناخواسته به مشتری، بارکد یا کد واقعی داشته باشد.
- پاک‌سازی و reset کامل fixtureها باید در طراحی prototype پیش‌بینی شود.

## استفاده از داده واقعی در آینده

داده واقعی فقط پس از approval جداگانه، حذف/پوشاندن اطلاعات حساس، ورود به staging و عبور از validation، review، Quality Gate و audit قابل بررسی است. تایید prototype با synthetic data پیش‌شرط هر بررسی بعدی است.

## خروجی‌های آینده

- `ProductImportSyntheticFixture`
- `ProductImportSyntheticScenario`
- `ProductImportExpectedResult`
- `ProductImportFixtureManifest`

## محدودیت فعلی

هیچ fixture اجرایی، dataset واقعی، فایل محک، generator، test code، database یا storage ساخته نشده است.
