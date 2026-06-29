# Product Data Quality Threshold Policy

آخرین به‌روزرسانی: 2026-06-29

## هدف

این سند سیاست مفهومی thresholdهای کیفیت داده کالا را تعریف می‌کند تا Quality Gate، گزارش مدیر، cockpit و dry-run بر معیارهای نسخه‌دار و قابل توضیح تکیه کنند.

## Product Data Quality Threshold Policy چیست؟

مجموعه‌ای از معیارها، حدود تصمیم و blockerهای قطعی است که کیفیت item، batch و source را ارزیابی می‌کند. عددهای اجرایی در این فاز تعیین یا hardcode نمی‌شوند؛ هر threshold آینده باید config، version، owner و approval مشخص داشته باشد.

## Thresholdهای پیشنهادی

| threshold | هدف |
|---|---|
| `requiredFeatureCompletionRate` | نسبت featureهای ضروری کامل |
| `validAttributeRate` | نسبت attributeهای valid |
| `unresolvedDuplicateLimit` | حداکثر duplicate حل‌نشده مجاز |
| `unresolvedConflictLimit` | حداکثر conflict حل‌نشده مجاز |
| `barcodeSafetyRate` | نسبت بارکدهای معتبر و بدون تعارض |
| `productGroupValidityRate` | نسبت mapping معتبر گروه کالا |
| `stoneMappingValidityRate` | نسبت mapping معتبر سنگ |
| `weightUnitValidityRate` | نسبت وزن/واحد معتبر |
| `pricingImpactReviewRate` | پوشش review featureهای اثرگذار بر قیمت |
| `productionImpactReviewRate` | پوشش review featureهای اثرگذار بر تولید |
| `lowConfidenceCriticalLimit` | حد itemهای بحرانی کم‌اطمینان |
| `manualOnlyMappingLimit` | حد mappingهای manual-only حل‌نشده |

## قرارداد Threshold

هر threshold آینده باید شامل این metadata باشد:

- `thresholdKey`
- `scope` شامل item، batch یا source
- `measurementDefinition`
- `operator`
- `targetValue` یا `allowedRange`
- `blockingBehavior`
- `policyVersion`
- `approvedBy`
- `effectiveFrom`
- `auditReference`

## سطح‌های کیفیت

| سطح | معنی تصمیمی |
|---|---|
| `excellent` | کیفیت بالا، بدون blocker و با warning ناچیز |
| `acceptable` | قابل عبور طبق policy و approval لازم |
| `warning` | قابل بررسی؛ pass کامل بدون توجه به warning مجاز نیست |
| `risky` | نیازمند review، correction یا split |
| `blocked` | ورود تا رفع blocker ممنوع است |

سطح کلی نباید blocker قطعی item-level را پنهان کند؛ batch با میانگین خوب اما duplicate barcode حل‌نشده همچنان blocked است.

## قواعد قطعی پیشنهادی

- critical conflict باید صفر باشد.
- duplicate barcode حل‌نشده باید block کند.
- feature ضروری مفقود برای کالای اصلی باید block کند.
- low confidence روی feature حساس باید review ایجاد کند.
- pricing/production impact بدون review نباید `pass` کامل بگیرد.
- unknown source format و manual-only حل‌نشده نمی‌توانند با میانگین کیفیت جبران شوند.

## کاربردها

- Product Import Quality Gate
- Product Import Manager Decision Report
- Product Import Cockpit Metrics
- Product Feature AI Snapshot quality check
- Import Dry-run Report
- Product Data Quality Monitoring

## حاکمیت و تغییر Policy

- thresholdها باید versioned و قابل audit باشند.
- تغییر threshold نباید گزارش تاریخی را بی‌صدا بازتفسیر کند.
- کاهش سخت‌گیری برای feature حساس نیازمند manager approval و reason است.
- AI می‌تواند threshold adjustment پیشنهاد دهد اما آن را تصویب نمی‌کند.
- هر گزارش باید policyVersion زمان محاسبه را ثبت کند.

## خروجی‌های آینده

- `ProductDataQualityThresholdPolicy`
- `ProductDataQualityAssessment`
- `ProductDataQualityLevel`
- `ProductThresholdBreach`

## محدودیت فعلی

هیچ threshold engine، config اجرایی، UI، database، migration، route یا localStorage key ساخته نشده و هیچ عدد اجرایی hardcode نشده است.
