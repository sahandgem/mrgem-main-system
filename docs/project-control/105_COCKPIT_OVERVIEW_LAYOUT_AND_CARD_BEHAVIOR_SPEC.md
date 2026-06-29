# Cockpit Overview Layout and Card Behavior Spec

آخرین به‌روزرسانی: 2026-06-29

## وضعیت سند

این سند layout و رفتار مفهومی کارت‌های Central Cockpit Overview Screen را تعریف می‌کند. هیچ UI، component یا route واقعی در این فاز ساخته نمی‌شود.

## Layout and Card Behavior Spec چیست؟

مرجع Design Lab و مرکز کنترل برای ارزیابی ترتیب اطلاعات، اولویت بصری، stateهای کارت و مرز actionهای نمایشی پیش از هر prototype احتمالی است.

## layout مفهومی

1. `top_status_band`: خلاصه سلامت کل سیستم و مهم‌ترین crisis signal.
2. `critical_cards_row`: کارت‌های high risk، conflict و manual_only.
3. `operational_risk_cards_row`: ریسک‌های مالی، کالا، موجودی، تولید و نیروی انسانی.
4. `ai_suggestion_area`: پیشنهادهای توضیح‌پذیر AI، جدا از تصمیم نهایی.
5. `manager_review_area`: موارد منتظر تصمیم انسانی و اولویت آن‌ها.
6. `audit_risk_summary_area`: خلاصه audit state، source status و blockerها.

## قرارداد هر card

| ویژگی | انتظار مفهومی |
|---|---|
| cardPurpose | سوال مدیریتی که کارت پاسخ می‌دهد |
| primaryMetric | شاخص اصلی و قابل اسکن |
| secondaryMetric | زمینه یا روند پشتیبان |
| riskBadge | سطح و دلیل risk |
| confidenceBadge | سطح confidence مستقل از risk |
| auditIndicator | وضعیت audit و blocker احتمالی |
| clickBehaviorConcept | drill-down مفهومی بدون route واقعی |
| emptyState | نبود signal معتبر، بدون نمایش عدد ساختگی |
| warningState | نیاز به توجه یا review |
| blockedState | توقف action به علت conflict، manual_only یا audit_missing |
| aiSuggestionBehavior | پیشنهاد، دلیل و confidence بدون تصمیم نهایی |

## قواعد رفتاری

- high risk باید در اسکن اولیه واضح باشد، بدون اتکا به رنگ به تنهایی.
- conflict باید هر auto-action را block کند.
- manual_only باید action انسانی و دلیل آن را نشان دهد.
- `audit_missing` در تصمیم حساس باید state را blocked کند.
- AI نباید به عنوان تصمیم نهایی یا approval نمایش داده شود.
- risk و confidence باید دو مفهوم مستقل باقی بمانند.
- empty state نباید با صفر یا موفقیت قطعی اشتباه شود.
- drill-down در این سند فقط concept است و route واقعی محسوب نمی‌شود.

## وضعیت نهایی

Layout و رفتار کارت‌ها برای review مستنداتی آماده است، اما prototype و implementation مجوز ندارند.
