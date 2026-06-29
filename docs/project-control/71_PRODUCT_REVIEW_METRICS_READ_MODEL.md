# Product Review Metrics Read Model

آخرین به‌روزرسانی: 2026-06-29

## هدف

این سند مدل خواندنی شاخص‌های review و کیفیت import کالا را تعریف می‌کند تا cockpit، گزارش مدیر و پایش کیفیت بدون تغییر داده اصلی ساخته شوند.

## Product Review Metrics Read Model چیست؟

یک projection فقط‌خواندنی از داده‌های Review Queue، validation، Quality Gate و Decision Audit است. مدل برای مشاهده روند و وضعیت عملیاتی استفاده می‌شود و اجازه approve، reject، correction یا mutate داده main را ندارد.

## شاخص‌های اصلی

| شاخص | تعریف |
|---|---|
| `totalReviewItems` | کل review itemها در بازه و scope انتخاب‌شده |
| `pendingReviews` | آیتم‌های pending یا under_review |
| `resolvedReviews` | آیتم‌های دارای تصمیم نهایی |
| `blockedImports` | item یا batchهای blocked/rejected |
| `duplicateWarnings` | هشدارهای duplicate-sensitive |
| `autoFixAccepted` | پیشنهادهای auto-fix پذیرفته‌شده |
| `autoFixRejected` | پیشنهادهای auto-fix ردشده |
| `managerEscalations` | موارد ارجاع‌شده به مدیر |
| `averageConfidence` | confidence میانگین با روش محاسبه نسخه‌دار |
| `topIssueTypes` | پرتکرارترین issueTypeها |
| `topRiskySources` | منابع دارای بیشترین ریسک یا نرخ خطا |
| `productGroupsWithMostIssues` | گروه‌های کالای دارای بیشترین review/blocked |
| `stoneMismatchCount` | تعداد mismatchهای سنگ |
| `barcodeDuplicateCount` | تعداد duplicate barcodeها |
| `pricingImpactIssues` | مسائل اثرگذار بر قیمت |
| `productionImpactIssues` | مسائل اثرگذار بر تولید |

## ابعاد و فیلترهای مفهومی

- بازه زمانی
- sourceType/sourceName
- batchId
- product group
- issueType و severity
- review state و gate status
- confidence level
- risk category
- reviewer/manager role، بدون افشای داده غیرضروری

## منابع Read Model

- Product Feature Review Queue
- Product Attribute Validation Report
- Product Import Quality Gate Report
- Product Feature Decision Audit Model
- Product Import Batch Decision

هر metric باید source reference، محاسبه نسخه‌دار و زمان تولید snapshot داشته باشد.

## موارد استفاده

- Cockpit dashboard برای وضعیت کیفیت ورود کالا.
- Manager Review Report برای حجم صف و blockerها.
- Import Quality Report برای مقایسه source و batch.
- Product Data Quality Monitoring برای روند خطاها و اصلاح‌ها.
- AI Snapshot Quality Check برای سنجش آمادگی داده قبل از تحلیل.

## قواعد محاسبه

- denominator هر نرخ باید مشخص و ثابت باشد.
- itemهای چندریسکی می‌توانند در چند risk metric ظاهر شوند، اما totalها نباید دوباره‌شماری شوند.
- average confidence بدون روش تبدیل levelها به score معتبر نیست.
- resolved فقط وقتی شمرده می‌شود که Decision Audit نهایی وجود داشته باشد.
- manager escalation با manager approval یکسان نیست و جدا گزارش می‌شود.
- metric باید time range، scope و generatedAt داشته باشد.

## قوانین ایمنی

- Read Model فقط خواندنی است و main data را mutate نمی‌کند.
- metric نباید جای Decision Audit یا Quality Gate را بگیرد.
- گزارش AI باید source، confidence و کیفیت داده پایه را نشان دهد.
- تغییر تعریف metric نیازمند version و ثبت اثر روی گزارش‌های تاریخی است.

## خروجی‌های آینده

- `ProductReviewMetricsSnapshot`
- `ProductReviewIssueBreakdown`
- `ProductSourceQualityMetrics`
- `ProductImportCockpitMetrics`

## محدودیت فعلی

هیچ dashboard، query، view، analytics engine، database، route یا component ساخته نشده است.
