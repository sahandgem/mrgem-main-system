# Product Import Prototype Isolation Boundary

آخرین به‌روزرسانی: 2026-06-29

## هدف

این سند مرز ایزوله‌سازی prototype آینده Product Import را تعریف می‌کند تا هیچ داده، storage، auth، route یا تصمیم production تحت تاثیر جریان نمایشی قرار نگیرد.

## Prototype Isolation Boundary چیست؟

مجموعه‌ای از ممنوعیت‌ها و کنترل‌های طراحی است که prototype را از main app، داده واقعی و عملیات برگشت‌ناپذیر جدا نگه می‌دارد. عبور از هر مرز نیازمند توقف و approval مستقل مرکز کنترل است.

## چیزهایی که Prototype باید از آن‌ها جدا بماند

- main app data
- production database
- real Mahak export/import
- real barcode records
- real financial data
- customer و counterparty data
- employee data
- auth system و roleهای واقعی
- real localStorage keys
- manager approval state واقعی
- production routes و services

## قوانین ایزوله‌سازی

- `no production write`: هیچ نوشتن مستقیم یا غیرمستقیم در main مجاز نیست.
- `no shared storage key`: prototype نباید storage key مشترک با main داشته باشد.
- `no migration`: schema یا migration production ساخته نشود.
- `no schema dependency`: قرارداد prototype به schema فنی سیستم قدیمی وابسته نشود.
- `no direct mahak dependency`: فایل، query، table یا integration مستقیم محک استفاده نشود.
- `no manager approval mutation`: تصمیم demo وضعیت واقعی approval را تغییر ندهد.
- `no irreversible action`: delete، merge، import یا action برگشت‌ناپذیر وجود نداشته باشد.
- `no hidden network dependency`: هر dependency شبکه‌ای آینده نیازمند approval و mock جایگزین است.

## الزامات Prototype در صورت ساخت آینده

- استفاده از mock service.
- استفاده از fixture data مصنوعی و versioned.
- reset واضح و کامل.
- banner دائمی «Prototype / Demo».
- گزارش صریح اینکه داده و تصمیم‌ها واقعی نیستند.
- namespace و storage کاملاً جدا، در صورت تصویب storage موقت.
- عدم دسترسی به secret، credential یا production endpoint.
- fail-closed هنگام تشخیص source واقعی یا مرز ناشناخته.

## کنترل نشت داده

- ورودی دارای الگوی داده واقعی، شناسه ناشناخته یا source production باید رد یا quarantined شود.
- export prototype باید watermark و synthetic marker داشته باشد.
- logها نباید حاوی داده حساس یا token باشند.
- screenshot و report باید فقط داده مصنوعی نمایش دهند.
- هیچ copy/paste از فایل‌های واقعی محک به fixture مجاز نیست.

## شرایط خروج از Prototype به Implementation

1. docs و contractها توسط مرکز کنترل approved شده باشند.
2. synthetic data scenarios با expected result پاس شده باشند.
3. dry-run flow پاس شده باشد.
4. Quality Gate behavior بازبینی و تایید شده باشد.
5. Manager Review Flow تایید شده باشد.
6. audit و rollback strategy اجرایی تعریف شده باشند.
7. security، auth و storage boundary جداگانه بررسی شده باشند.
8. implementation approval صریح از مرکز کنترل صادر شده باشد.

هیچ‌کدام از این شرایط به‌تنهایی مجوز implementation نیست؛ approval نهایی مستقل الزامی است.

## خروجی‌های آینده

- `ProductImportPrototypeBoundaryCheck`
- `ProductImportPrototypeEnvironmentReport`
- `ProductImportPrototypeExitAssessment`
- `ProductImportImplementationApprovalGate`

## محدودیت فعلی

این سند prototype واقعی، repo، UI، route، localStorage، database، migration، auth، mock service یا fixture اجرایی ایجاد نمی‌کند.
