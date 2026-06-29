# Cockpit Prototype Test Plan

آخرین به‌روزرسانی: 2026-06-29

## وضعیت

این سند برنامه تست مفهومی prototype احتمالی آینده cockpit است. در CONTROL-P34 هیچ prototype یا تست اجرایی ساخته یا اجرا نمی‌شود.

## Cockpit Prototype Test Plan چیست؟

برنامه‌ای برای سنجش فهم سریع مدیر، درستی نمایش risk/confidence، آشکار بودن audit boundary و رعایت جدایی کامل از داده و رفتار production است.

## هدف‌های تست

- بررسی فهم وضعیت کلیدی توسط مدیر در حدود ۱۰ ثانیه
- بررسی خوانایی risk و confidence
- بررسی visible بودن audit boundary
- اطمینان از نمایش AI به عنوان suggestion، نه decision نهایی
- بررسی رعایت Mock Data Protocol
- اثبات عدم استفاده از داده واقعی
- اثبات عدم mutation داده، route، storage، auth یا سرویس اصلی
- بررسی مسدود شدن auto-action در حالت conflict و manual_only

## سناریوهای پیشنهادی

1. `normal_day`: نمایش روز عادی بدون هشدار کاذب.
2. `high_financial_pressure`: نمایش فشار مالی شدید با دلیل و drill-down مفهومی.
3. `product_import_blocked`: نمایش توقف ورود کالا و نیاز به review.
4. `inventory_shortage`: نمایش کمبود موجودی و اقدام پیشنهادی بدون mutation.
5. `production_risk`: نمایش ریسک تولید با منبع و confidence.
6. `workforce_risk`: نمایش ریسک نیروی انسانی با مرز تصمیم مدیر.
7. `manager_review_overload`: نمایش انباشت صف review و اولویت‌بندی قابل فهم.
8. `crisis_signal`: نمایش بحران چندماژولی بدون اغراق یا تصمیم خودکار حساس.
9. `audit_missing_sensitive_decision`: مسدود شدن تصمیم حساس در نبود audit.
10. `conflict_manual_only_auto_action_block`: اثبات ممنوع بودن auto-action.

## قرارداد هر test case

| فیلد | توضیح |
|---|---|
| testId | شناسه یکتای سناریو |
| scenario | شرح کوتاه وضعیت مصنوعی |
| inputMockSignals | signalهای mock ورودی |
| expectedCards | کارت‌های مورد انتظار |
| expectedRiskDisplay | وضعیت مورد انتظار نمایش ریسک |
| expectedConfidenceDisplay | وضعیت مورد انتظار نمایش اطمینان |
| expectedManagerAction | action نمایشی مورد انتظار مدیر |
| expectedAIBehavior | رفتار مورد انتظار پیشنهاد AI |
| expectedAuditState | وضعیت audit مورد انتظار |
| passCriteria | معیارهای قبولی |
| failCriteria | معیارهای توقف یا رد |

## قواعد اجرا

- هیچ test case نباید از داده واقعی استفاده کند.
- fixtureها باید synthetic، نسخه‌دار، deterministic و قابل reset باشند.
- هر mutation روی main، production storage یا service اصلی شکست قطعی تست است.
- این برنامه فقط برای prototype احتمالی آینده است و در این فاز تست واقعی اجرا نمی‌شود.

## وضعیت نهایی

این Test Plan آماده بررسی مرکز کنترل است، اما مجوز اجرای prototype یا تست واقعی نیست.
