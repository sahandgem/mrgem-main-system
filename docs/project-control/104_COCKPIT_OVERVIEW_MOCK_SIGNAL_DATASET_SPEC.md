# Cockpit Overview Mock Signal Dataset Spec

آخرین به‌روزرسانی: 2026-06-29

## وضعیت سند

این سند قرارداد داده مصنوعی برای Central Cockpit Overview Screen را تعریف می‌کند. هیچ dataset واقعی در این فاز ساخته یا وارد main نمی‌شود.

## Mock Signal Dataset Spec چیست؟

قراردادی نسخه‌پذیر و deterministic برای signalهای مصنوعی است تا رفتار دیداری و مرز تصمیم صفحه Overview در prototype احتمالی آینده، بدون استفاده از داده واقعی، قابل ارزیابی باشد.

## signalهای لازم

- `financial_pressure_signal`
- `product_import_warning_signal`
- `manager_review_queue_signal`
- `inventory_shortage_signal`
- `production_risk_signal`
- `workforce_risk_signal`
- `ai_suggestion_signal`
- `crisis_signal`

## قرارداد هر signal

| فیلد | هدف |
|---|---|
| signalId | شناسه یکتای mock signal |
| signalType | نوع signal از فهرست مصوب |
| title | عنوان کوتاه کارت |
| summary | خلاصه قابل اسکن |
| primaryMetric | شاخص اصلی |
| secondaryMetric | شاخص پشتیبان |
| riskLevel | سطح risk |
| confidenceLevel | سطح confidence |
| sourceModule | ماژول مفهومی تولیدکننده |
| sourceStatus | وضعیت دسترس‌پذیری و اعتبار منبع mock |
| suggestedAction | پیشنهاد نمایشی و غیراجرایی |
| requiresManagerDecision | نیاز به تصمیم انسانی |
| auditState | وضعیت audit مصنوعی |
| drillDownTargetConcept | مقصد مفهومی drill-down، بدون route واقعی |
| generatedAt | زمان تولید fixture مصنوعی |

## سناریوهای mock

1. `normal_day`
2. `high_financial_pressure`
3. `product_import_blocked`
4. `review_queue_overload`
5. `inventory_shortage`
6. `production_risk`
7. `workforce_risk`
8. `crisis_signal`
9. `audit_missing_sensitive_decision`

## قواعد داده

- dataset نباید از داده واقعی مالی، کالا، بانک، محک، موجودی یا کارمند ساخته شود.
- شناسه، عدد، تاریخ و متن هر fixture باید synthetic باشد.
- dataset نباید وارد main، production storage یا localStorage production شود.
- dataset فقط برای concept یا prototype ایزوله آینده است.
- هر سناریو باید expected cards، expected risk/confidence و expected decision boundary داشته باشد.
- reset کامل dataset و demo state باید ممکن باشد.

## وضعیت نهایی

قرارداد dataset برای review آماده است؛ ساخت dataset اجرایی یا اتصال آن به UI هنوز مجاز نیست.
