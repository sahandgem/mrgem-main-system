# Design Lab Launch Blueprint

آخرین به‌روزرسانی: 2026-06-29

## هدف

این سند نقشه راه راه‌اندازی `Design Lab` مستر جم را تعریف می‌کند. Design Lab فضای جدا برای طراحی، prototype و تجربه UI/UX است و نباید مستقیماً main را تغییر دهد.

این سند فقط طراحی است و هیچ کد اجرایی، UI اصلی، route، database، migration، auth، repo یا localStorage ایجاد نمی‌کند.

## Design Lab چیست؟

`Design Lab` یک workstream یا repo آینده برای طراحی ظاهری، تجربه کاربری، component pattern و prototypeهای مستر جم است. خروجی آن باید به شکل pattern، spec، screenshot، flow یا token تحویل مرکز کنترل شود، نه کد مستقیم برای merge.

## چرا باید جدا از main باشد؟

- main فعلاً باید پایدار و قابل rollback بماند.
- prototypeها معمولاً پرریسک و سریع‌تغییر هستند.
- طراحی cockpit، mobile، finance و product ممکن است چند بار تغییر کند.
- جدا بودن Design Lab از main جلوی route/UI churn و dependency ناخواسته را می‌گیرد.
- فقط خروجی تاییدشده بعداً با implementation امن وارد main می‌شود.

## هدف‌های Design Lab

| هدف | توضیح |
|---|---|
| cockpit prototype | طراحی نمای کابین مرکزی برای مدیر. |
| dashboard cards | طراحی کارت‌های KPI، ریسک، هشدار و تصمیم. |
| design tokens | تعریف رنگ، تایپوگرافی، فاصله، radius، shadow و density. |
| component patterns | الگوهای قابل تکرار برای کارت، صف review، timeline و panel. |
| page layout experiments | آزمایش layout بدون تغییر main. |
| mobile screen concepts | طراحی صفحات موبایل برای receipt capture و queue. |
| finance dashboard concepts | طراحی فشار نقدینگی، bank import، review و approval. |
| product dashboard concepts | طراحی هشدار کالا، duplicate، import و Mahak export. |
| production/inventory concepts | طراحی ریسک تولید، کمبود موجودی و material requirement. |

## چیزهایی که ممنوع است

- merge مستقیم خروجی Design Lab به main.
- تغییر route اصلی از داخل Design Lab.
- تغییر auth یا database.
- ساخت migration.
- وابسته کردن main به prototype یا assetهای موقت.
- تغییر UI اصلی بدون فاز implementation مستقل و approval مرکز فرمان.
- اضافه کردن dependency طراحی به main بدون بررسی.

## خروجی‌های مجاز

| خروجی | کاربرد |
|---|---|
| design tokens | پایه رنگ، typography، spacing و status language. |
| component patterns | الگوهای تصویب‌پذیر برای پیاده‌سازی آینده. |
| UX flows | جریان کار مدیر، reviewer، importer و operator. |
| screenshots | ثبت بصری ایده‌ها برای review. |
| prototype notes | توضیح دلیل طراحی و tradeoffها. |
| approved component specs | spec نهایی component برای ورود امن به main. |

## مسیر ورود خروجی Design Lab به main

1. ساخت prototype در Design Lab.
2. ثبت screenshot و notes.
3. بررسی توسط مرکز کنترل.
4. تبدیل به component spec تصویب‌شده.
5. طراحی implementation plan کوچک و قابل rollback.
6. ورود به main فقط در فاز مستقل با test/build.

## محدودیت فعلی

در این فاز repo جدید ساخته نمی‌شود و هیچ UI یا کد اصلی تغییر نمی‌کند.
