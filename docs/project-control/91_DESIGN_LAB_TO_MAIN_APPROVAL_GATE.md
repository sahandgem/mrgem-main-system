# Design Lab to Main Approval Gate

آخرین به‌روزرسانی: 2026-06-29

## وضعیت

این سند gate خروج از Design Lab به سمت prototype یا main را تعریف می‌کند. Design Lab خروجی طراحی می‌دهد، نه implementation. Main فقط با approval مستقل تغییر می‌کند.

## Design Lab to Main Approval Gate چیست؟

Design Lab to Main Approval Gate نقطه کنترل رسمی است که تعیین می‌کند آیا یک طراحی مفهومی اجازه دارد وارد مرحله prototype مستقل یا implementation آینده شود یا نه. عبور از این gate خودکار نیست و نیازمند تصمیم صریح مرکز کنترل است.

## چه زمانی یک طراحی اجازه خروج از Design Lab دارد؟

یک طراحی فقط وقتی می‌تواند برای مرحله بعدی پیشنهاد شود که همه شرط‌های لازم روشن، مستند و تایید شده باشند. حتی در این حالت، خروجی فقط candidate است و اجرای واقعی به فاز مستقل نیاز دارد.

## شرط‌های لازم

- screen spec approved.
- synthetic/mock data approved.
- risk/confidence reviewed.
- audit boundary reviewed.
- implementation restriction reviewed.
- test plan drafted.
- rollback plan drafted.
- control-room approval issued.

## مواردی که gate را block می‌کنند

- unclear user action.
- hidden sensitive decision.
- no audit boundary.
- no risk/confidence display.
- direct main dependency.
- real data usage.
- missing empty/error state.
- no approval path.

## وضعیت‌های gate

| وضعیت | معنی |
|---|---|
| blocked | طراحی اجازه خروج ندارد |
| needs_revision | باید اصلاح و دوباره بررسی شود |
| approved_for_isolated_prototype | فقط prototype مستقل با approval جداگانه ممکن است |
| approved_for_main_implementation_planning | فقط برنامه‌ریزی implementation مجاز است، نه اجرای کد |
| frozen | ادامه تا تصمیم مستقل مرکز کنترل متوقف است |

## قانون اصلی

Design Lab خروجی طراحی می‌دهد، نه implementation. Main فقط با approval مستقل، scope کوچک، test plan، rollback plan، security/storage boundary و checkpoint روشن تغییر می‌کند.

## ممنوعیت‌های همیشگی بدون approval مستقل

- merge مستقیم خروجی Design Lab به main.
- ساخت route یا component واقعی.
- استفاده از داده واقعی.
- تغییر database، auth، migration یا localStorage.
- تصمیم حساس بدون human approval.
- AI action بدون audit و confidence.
