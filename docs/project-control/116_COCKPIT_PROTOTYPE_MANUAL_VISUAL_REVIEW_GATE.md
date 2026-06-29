# Cockpit Prototype Manual Visual Review Gate

آخرین به‌روزرسانی: 2026-06-30

## وضعیت فعلی

| موضوع | وضعیت |
|---|---|
| Static Review | `PASS` |
| Human Visual Review | `approved_for_iteration` |
| Desktop | `PASS` |
| Mobile | `PASS_WITH_MINOR_NOTE` |
| Main Merge | `ON_HOLD` |
| Main Integration | `NOT_APPROVED` |
| Implementation | `NOT_APPROVED` |

## نتیجه ثبت‌شده

- Reviewer: Sahand
- Review date: 2026-06-30
- Desktop overall: همه‌چیز خوب است.
- Desktop issue: ندارد.
- Mobile overall: خوب است.
- Mobile issue: اندازه‌ها کمی بزرگ هستند، اما blocker نیست.
- Decision: `approved_for_iteration`

## Human Visual Review Gate چیست؟

دروازه بازبینی انسانی برای ارزیابی فهم سریع، خوانایی، رفتار دیداری و صادقانه بودن مرز demo است. Static Review می‌تواند dependencyها را کنترل کند، اما کیفیت تجربه مدیر و نمایش درست risk/confidence/audit فقط با مشاهده انسانی تایید می‌شود.

## موارد الزامی بازبینی در مرورگر

- banner «نمونه نمایشی ایزوله — داده‌ها ساختگی هستند» واضح باشد.
- رابط فارسی، RTL و dark-first باشد.
- وضعیت کلی در کمتر از ۱۰ ثانیه قابل فهم باشد.
- هر ۸ signal در کارت یا ناحیه مرتبط قابل مشاهده باشند.
- risk badge واضح و مستقل از confidence badge باشد.
- audit indicator در کارت‌ها و خلاصه دیده شود.
- AI فقط suggestion باشد و به‌عنوان decision نهایی نمایش داده نشود.
- کلیک روی کارت فقط drill-down مفهومی را باز کند.
- هیچ action واقعی، approve، reject، import یا write دیده نشود.
- conflict، manual_only و audit_missing حالت block مفهومی واضح داشته باشند.
- layout در desktop و mobile خوانا و بدون overlap باشد.
- بستن پنل با دکمه، backdrop و Escape کار کند.

## شواهد مورد انتظار

- نام reviewer و تاریخ review
- viewportهای بررسی‌شده
- نتیجه فهم ۱۰ ثانیه‌ای
- نتیجه desktop/mobile
- موارد pass/fail با توضیح کوتاه
- تصویر یا یادداشت در صورت مشاهده مشکل
- تصمیم نهایی review

## خروجی‌های review

| Outcome | معنی |
|---|---|
| `approved_for_iteration` | prototype می‌تواند فقط در scope ایزوله اصلاح شود |
| `needs_revision` | مشکلات دیداری یا رفتاری باید اصلاح و دوباره review شوند |
| `blocked` | ریسک یا نقض boundary مانع ادامه است |
| `rejected` | prototype برای ادامه مناسب نیست |
| `frozen` | هیچ ادامه‌ای تا تصمیم مستقل مرکز کنترل مجاز نیست |

## قانون

Human Visual Review با outcome برابر `approved_for_iteration` ثبت شد. این outcome فقط iteration بعدی در scope ایزوله را مجاز می‌داند و معادل merge approval نیست. Main Merge همچنان `ON_HOLD` و Implementation همچنان `NOT_APPROVED` است.
