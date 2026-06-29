# Quarantine Review Flow

آخرین به‌روزرسانی: 2026-06-29

## هدف

این سند جریان quarantine و بررسی داده‌های پرریسک، مشکوک یا ناسازگار را برای مستر جم تعریف می‌کند. هدف این است که داده مشکل‌دار نه وارد main شود و نه بی‌ردپا حذف شود.

این سند فقط طراحی flow است و هیچ کد اجرایی، route، UI، database، migration، auth، repo یا localStorage ایجاد نمی‌کند.

## Quarantine چیست؟

`Quarantine` وضعیت نگه‌داری جداگانه برای داده‌ای است که برای ورود به main امن نیست. داده quarantined باید دلیل، source، خطاها، reviewer/manager decision و audit trail داشته باشد.

## چه داده‌هایی باید quarantine شوند؟

| داده یا وضعیت | دلیل |
|---|---|
| parse error | ساختار فایل یا ورودی قابل خواندن نیست. |
| unknown format | قالب فایل شناخته‌شده یا تاییدشده نیست. |
| missing required fields | فیلد اجباری ناقص است. |
| conflict | شواهد با هم ناسازگارند. |
| low confidence | داده برای auto import یا تصمیم کافی نیست. |
| suspicious duplicate | احتمال تکراری بودن جدی وجود دارد. |
| unauthorized import attempt | تلاش ورود غیرمجاز یا خارج از policy دیده شده است. |
| unsafe auto action | سیستم قصد اقدام خودکار ناامن داشته یا rule نامطمئن است. |
| failed validation | validation شکست خورده است. |
| inconsistent receipt/bank/product mapping | mapping بین سند، بانک یا کالا ناسازگار است. |

## وضعیت‌های quarantine

| وضعیت | معنی |
|---|---|
| `quarantined` | داده جدا شده و وارد main نمی‌شود. |
| `waiting review` | منتظر بررسی reviewer یا manager است. |
| `correction requested` | اصلاح داده یا mapping درخواست شده است. |
| `corrected` | اصلاح انجام شده و آماده تست دوباره است. |
| `rejected` | داده رد شده است. |
| `approved after review` | پس از review مجاز به ادامه مسیر شده است. |
| `archived` | داده ناامن یا نامرتبط برای reference نگه داشته شده است. |

## تصمیم‌های مدیر

| تصمیم | کاربرد |
|---|---|
| approve after correction | داده پس از اصلاح و تست دوباره ادامه می‌دهد. |
| reject permanently | داده برای همیشه از مسیر import خارج می‌شود. |
| request correction | اصلاح مقدار، mapping، source یا فایل درخواست می‌شود. |
| mark duplicate | داده به عنوان تکراری علامت‌گذاری می‌شود. |
| map manually | mapping دستی با audit و approval انجام می‌شود. |
| split batch | batch به بخش امن و ناامن تقسیم می‌شود. |
| retry parse | پس از اصلاح قالب یا parser policy دوباره parse می‌شود. |
| archive as unsafe | داده ناامن نگه‌داری می‌شود ولی وارد main نمی‌شود. |

## خروجی‌های مورد انتظار

| خروجی | کاربرد |
|---|---|
| `QuarantineItem` | آیتم quarantined با source، خطا، وضعیت و ریسک. |
| `QuarantineReviewDecision` | تصمیم reviewer/manager و دلیل آن. |
| `QuarantineCorrectionLog` | ثبت اصلاح‌های انجام‌شده و مقدار قبلی/جدید. |
| `QuarantineAuditTrail` | رد کامل source، actor، تصمیم، زمان و نتیجه. |

## قوانین توقف

- داده quarantined نباید بدون status و decision وارد main شود.
- conflict و unauthorized import attempt فقط با manager/admin decision قابل خروج از quarantine هستند.
- archived به معنی حذف نیست؛ trace باید باقی بماند.
- split batch نباید بخش ناامن را پنهان کند.

## محدودیت فعلی

این سند فقط flow مفهومی است. هیچ quarantine storage، UI، permission، database، migration یا notification ساخته نمی‌شود.
