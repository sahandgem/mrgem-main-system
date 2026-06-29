# Cockpit Prototype Branch Merge Hold

آخرین به‌روزرسانی: 2026-06-30

## وضعیت

| موضوع | وضعیت |
|---|---|
| Prototype Branch | `prototype/cockpit-overview-isolated` |
| Prototype Commit Reviewed | `f5f8b5e` |
| Static Review | `PASS` |
| Human Visual Review | `approved_for_iteration` |
| Main Merge | `ON_HOLD` |
| Main Integration | `NOT_APPROVED` |
| Production Implementation | `NOT_APPROVED` |

## Branch Merge Hold چیست؟

قفل کنترلی روی ادغام branch prototype است تا آماده بودن static به‌اشتباه مجوز ورود به main تلقی نشود.

## دلیل hold

- `approved_for_iteration` فقط اجازه iteration ایزوله است و merge approval محسوب نمی‌شود.
- یادداشت جزئی mobile درباره بزرگ بودن اندازه‌ها blocker نیست، اما باید در iteration آینده مدیریت شود.
- rollback با حذف کامل پوشه باید در review تایید شود.
- scope باید prototype-only و isolated باقی بماند.
- تایید مستقل مرکز کنترل برای هر merge احتمالی وجود ندارد.

## شرط‌های لازم برای بررسی رفع hold

- control-room approval صریح صادر شود.
- نتیجه iteration بعدی و review مجدد در صورت تغییر UI ثبت شود.
- Static Review همچنان `PASS` باشد.
- rollback path و affected file list تایید شوند.
- هیچ production dependency، real data یا main mutation وجود نداشته باشد.
- test/review report نهایی کامل باشد.

## مواردی که این سند تایید نمی‌کند

- merge به main
- route یا navigation اصلی
- production component
- database، auth یا storage
- اتصال داده واقعی
- implementation اصلی

## قانون نهایی

با وجود نتیجه `approved_for_iteration`، این branch تا اطلاع بعدی و تصمیم مستقل مرکز کنترل به main merge نشود. وضعیت جاری `Main Merge = ON_HOLD` است.
