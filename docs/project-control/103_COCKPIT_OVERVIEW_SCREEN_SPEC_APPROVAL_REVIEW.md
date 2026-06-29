# Cockpit Overview Screen Spec Approval Review

آخرین به‌روزرسانی: 2026-06-29

## وضعیت سند

این سند خروجی CONTROL-P35-BATCH و بسته بازبینی مشخصات نخستین صفحه پیشنهادی cockpit است. این review مجوز ساخت prototype، UI، route یا component واقعی نیست.

| موضوع | وضعیت |
|---|---|
| Screen Candidate | `SELECTED` |
| Screen Spec Review | `READY` |
| Prototype Build | `NOT_APPROVED` |
| Real Implementation | `NOT_APPROVED` |

## صفحه مورد بررسی

`Central Cockpit Overview Screen`

## هدف صفحه

- مدیر در کمتر از ۱۰ ثانیه وضعیت کلی کسب‌وکار را بفهمد.
- کارت‌های بحرانی و موارد نیازمند توجه را سریع تشخیص دهد.
- risk و confidence هر signal را از هم تفکیک کند.
- بداند کدام action فقط پیشنهاد است و کدام مورد به تصمیم انسانی نیاز دارد.
- برای هر هشدار، source و audit state قابل مشاهده باشد.

## کارت‌های اصلی

| Card | هدف مفهومی |
|---|---|
| Financial Pressure | خلاصه فشار نقدینگی و ریسک مالی |
| Product Import Warning | وضعیت blockerها و هشدارهای ورود کالا |
| Manager Review Queue | حجم و اولویت تصمیم‌های منتظر مدیر |
| Inventory Shortage | کمبودهای مهم موجودی |
| Production Risk | ریسک‌های تولید و مواد |
| Workforce Risk | ریسک‌های برنامه و نیروی انسانی |
| AI Suggestion | پیشنهاد توضیح‌پذیر AI با confidence و approval boundary |
| Crisis Signal | سیگنال بحران چندماژولی با source و audit context |

## کارت‌های placeholder

- Bank Import Status
- Installment Confirmation
- Mobile Receipt Queue
- Cash-in/Cash-out

این کارت‌ها فقط جایگاه مفهومی دارند و ورودشان به prototype یا main نیازمند review مستقل است.

## actionهای مجاز در concept

- `open_drill_down_concept`
- `mark_for_review_concept`
- `view_audit_summary_concept`
- `view_ai_suggestion_concept`

## actionهای ممنوع

- approve یا reject واقعی
- write یا mutation واقعی
- import واقعی
- route یا navigation production
- storage واقعی
- تصمیم نهایی خودکار برای مورد حساس

## نتیجه review

Screen spec برای بازبینی مرکز کنترل `READY` است، اما ساخت prototype و implementation واقعی همچنان `NOT_APPROVED` هستند.
