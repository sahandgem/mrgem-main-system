# Product Attribute Validation Report

آخرین به‌روزرسانی: 2026-06-29

## هدف

این سند استاندارد گزارش خواندنی کیفیت و اعتبار featureهای کالا را تعریف می‌کند تا import dry-run، review مدیر، cockpit، AI snapshot و خروجی آینده محک بر یک خلاصه قابل ردیابی تکیه کنند.

## Product Attribute Validation Report چیست؟

گزارشی read-only از نتایج validation، confidence، duplicate/conflict و ریسک featureهای یک کالا یا import batch است. گزارش وضعیت را توضیح می‌دهد اما داده اصلی را تغییر نمی‌دهد و تصمیم ورود یا اصلاح را به تنهایی اجرا نمی‌کند.

## محتوای گزارش

| بخش | محتوای مورد انتظار |
|---|---|
| `totalAttributesChecked` | تعداد کل attributeهای بررسی‌شده |
| `validAttributes` | featureهای معتبر |
| `warningAttributes` | featureهای قابل استفاده با هشدار |
| `needsReviewAttributes` | featureهای نیازمند تصمیم انسانی |
| `blockedAttributes` | featureهای ممنوع برای ورود یا مصرف حساس |
| `autoFixCandidates` | اصلاح‌های پیشنهادی کم‌ریسک |
| `missingRequiredFeatures` | featureهای اجباری مفقود |
| `duplicateSensitiveWarnings` | هشدارهای بارکد، کد یا feature حساس به duplicate |
| `pricingImpactWarnings` | ریسک‌های اثرگذار بر قیمت |
| `productionImpactWarnings` | ریسک‌های اثرگذار بر تولید یا فرمول |
| `inventoryImpactWarnings` | ریسک‌های اثرگذار بر موجودی |
| `confidenceSummary` | توزیع high، medium، low، conflict و manual only |
| `riskSummary` | خلاصه شدت و نوع riskFlags |
| `sourceSummary` | منابع داده، نسخه‌ها و وضعیت قابلیت اعتماد |

## ارجاع‌های الزامی

هر گزارش باید این زمینه را داشته باشد:

- `reportId`
- `productId` یا `importBatchId`
- `sourceType` و `sourceReference`
- `validationRuleVersion`
- `generatedAt`
- `auditReference`

گزارش بدون batch/source/audit reference برای تصمیم import، AI snapshot یا خروجی محک معتبر نیست.

## موارد استفاده

- import dry-run کالا و تعیین approved/blocked/review candidates.
- بررسی کیفیت داده کالا قبل از ورود به main.
- ساخت کارت‌ها و خلاصه‌های read-only کابین خلبانی.
- تصمیم manager review با دسترسی به شواهد جمع‌بندی‌شده.
- آماده‌سازی Product Feature AI Snapshot از داده validate شده.
- کنترل آمادگی خروجی آینده محک بدون وابستگی به schema محک.

## تفکیک سطح گزارش

| سطح | کاربرد |
|---|---|
| Product level | کیفیت featureهای یک کالا |
| Batch level | کیفیت کل import batch و نرخ خطا/review |
| Source level | کیفیت داده یک منبع یا فایل |
| Risk level | تمرکز روی pricing، production، inventory یا duplicate |

## قوانین

- گزارش فقط خواندنی است و نباید داده اصلی را mutate کند.
- آمار گزارش باید از validation resultهای نسخه‌دار و قابل audit ساخته شود.
- blocked و needs_review نباید در valid جمع شوند.
- auto-fix candidate به معنی اصلاح قطعی نیست.
- report باید source، confidence و rule version را آشکار نگه دارد.
- گزارش AI باید از raw input جدا باشد و فقط داده normalize و validate شده را مصرف کند.

## خروجی‌های آینده

- `ProductAttributeValidationReport`
- `ProductAttributeValidationSummary`
- `ProductImportQualityReport`
- `ProductFeatureRiskSummary`

## محدودیت فعلی

هیچ report engine، UI، query، view، database، migration، route یا localStorage key ساخته نشده و هیچ نام فنی از schema محک کپی نشده است.
