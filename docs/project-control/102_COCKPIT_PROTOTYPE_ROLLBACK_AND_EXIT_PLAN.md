# Cockpit Prototype Rollback and Exit Plan

آخرین به‌روزرسانی: 2026-06-29

## وضعیت

این سند شرایط توقف، حذف، بازبینی یا خروج کنترل‌شده از prototype احتمالی آینده cockpit را تعریف می‌کند. در CONTROL-P34 هیچ prototype واقعی برای rollback وجود ندارد.

## Rollback/Exit Plan چیست؟

برنامه‌ای از پیش تعریف‌شده برای توقف امن prototype، پاک‌سازی کامل demo state، ثبت دلیل و تایید نتیجه است تا هیچ وابستگی یا اثر جانبی در main باقی نماند.

## محرک‌های توقف فوری

- نشت یا استفاده از داده واقعی
- وابستگی تصادفی به main
- نقض مرز storage یا استفاده از production key
- تصمیم حساس پنهان یا action غیرقابل برگشت
- نبود audit در تصمیم حساس
- نمایش گمراه‌کننده risk یا confidence
- نمایش AI به عنوان تصمیم نهایی
- تلاش برای route یا integration در main
- component یا کد تاییدنشده
- وابستگی به database، auth یا service production

## اجزای rollback/exit

- برنامه حذف کامل prototype
- پاک‌سازی mock data و fixtureها
- reset کامل demo state
- فهرست دقیق فایل‌های متاثر
- approval record و audit reference
- مالک rollback
- دلیل rollback یا exit
- زمان شروع و پایان
- verification پس از rollback
- تایید نبود route، storage، database، auth یا dependency باقی‌مانده

## exit outcomeها

| Outcome | معنی |
|---|---|
| `approved_for_iteration` | فقط اصلاح concept/prototype ایزوله با دامنه تاییدشده مجاز است |
| `needs_revision` | قبل از ادامه، اصلاح و review مجدد لازم است |
| `rejected` | مسیر prototype رد شده و باید حذف/بسته شود |
| `frozen` | هیچ ادامه‌ای تا دستور مستقل مرکز کنترل مجاز نیست |
| `approved_for_isolated_prototype_next_step` | فقط گام بعدی ایزوله با approval مستقل مجاز است؛ ورود به main مجاز نیست |

## قواعد approval

- prototype بدون rollback/exit plan تایید نمی‌شود.
- خروج یا rollback باید reason، owner، audit و approval داشته باشد.
- rollback داده یا action واقعی موضوع این سند نیست، چون prototype حق دسترسی به آن‌ها را ندارد.
- نتیجه موفق rollback باید با بررسی پاک بودن demo state و نبود اثر در main تایید شود.

## وضعیت نهایی

این برنامه فقط readiness مستنداتی را کامل می‌کند. `Cockpit Prototype` همچنان `ON_HOLD` و `Cockpit Implementation` همچنان `NOT_APPROVED` است.
