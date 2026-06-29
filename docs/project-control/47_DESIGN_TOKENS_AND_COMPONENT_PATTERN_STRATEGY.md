# Design Tokens and Component Pattern Strategy

آخرین به‌روزرسانی: 2026-06-29

## هدف

این سند strategy اولیه design tokens و component patternهای مستر جم را تعریف می‌کند. هدف این است که Design Lab خروجی قابل انتقال، قابل بررسی و بدون وابستگی مستقیم به main تولید کند.

این سند فقط طراحی است و هیچ component اجرایی، UI اصلی، route، database، migration، auth، repo یا localStorage ایجاد نمی‌کند.

## Design Tokens چیست؟

`Design Tokens` مقادیر پایه طراحی هستند که زبان بصری سیستم را یکدست می‌کنند: رنگ، تایپوگرافی، فاصله، radius، shadow، density و وضعیت‌ها. tokenها باید قبل از implementation به عنوان spec تایید شوند.

## tokenهای اولیه

| token | کاربرد |
|---|---|
| colors | رنگ‌های پایه dark cockpit و پس‌زمینه‌ها. |
| typography | سلسله‌مراتب متن فارسی، عدد و label. |
| spacing | فاصله داخلی کارت‌ها، gridها و panelها. |
| radius | radius محدود و حرفه‌ای برای کارت و کنترل‌ها. |
| shadows | عمق کنترل‌شده بدون شلوغی بصری. |
| card density | تراکم کارت‌ها برای dashboard مدیریتی. |
| status colors | OK، attention، critical، review و inactive. |
| risk levels | زبان رنگ/نشان برای low، medium، high و crisis. |
| confidence indicators | نمایش high، medium، low، conflict و manual only. |

## component patternهای اولیه

| pattern | کاربرد |
|---|---|
| KPI Card | نمایش عدد اصلی، روند و وضعیت. |
| Risk Alert Card | هشدار با دلیل، شدت و مسیر drill-down. |
| Review Queue Card | آیتم‌های منتظر تصمیم انسان. |
| AI Suggestion Card | پیشنهاد AI با confidence، source و action boundary. |
| Import Status Card | وضعیت staging، dry-run، quarantine و import gate. |
| Financial Pressure Card | فشار نقدینگی، cash-in/cash-out و سررسید. |
| Product Warning Card | duplicate، barcode، Mahak readiness و import warning. |
| Timeline / History Card | تاریخچه تصمیم، import، drift یا operation. |
| Manager Decision Panel | تایید، رد، اصلاح، assign، quarantine یا rollback request. |

## قانون انتقال به main

- هیچ component از Design Lab مستقیم وارد main نشود.
- اول pattern تصویب شود.
- بعد component spec نوشته شود.
- سپس adapter یا implementation امن در main در فاز مستقل انجام شود.
- هر ورود به main باید کوچک، قابل rollback و دارای test/build باشد.

## معیار پذیرش pattern

- فارسی و RTL را درست پشتیبانی کند.
- dark mode و cockpit visual language را حفظ کند.
- علت هر هشدار یا پیشنهاد را نشان دهد.
- confidence و review boundary را واضح کند.
- در dashboard متراکم اما قابل اسکن باشد.
- برای mobile و desktop قابل انطباق باشد.

## محدودیت فعلی

در این فاز token یا component واقعی ساخته نمی‌شود؛ فقط strategy و قرارداد طراحی ثبت می‌شود.
