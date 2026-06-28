# Import Error Handling and Rollback Policy

آخرین به‌روزرسانی: 2026-06-29

## هدف

این سند خطاهای import، رفتار سیستم در برابر خطا و سیاست rollback را برای مستر جم تعریف می‌کند. هدف این است که import اشتباه قابل شناسایی، قابل quarantine، قابل review و در صورت تایید، قابل برگشت باشد.

این سند فقط policy است و هیچ کد اجرایی، route، UI، database، migration، auth، repo یا localStorage ایجاد نمی‌کند.

## Import Error Handling

هر خطای import باید قبل از ورود به main یا پس از تشخیص در audit ثبت شود. خطاها نباید بی‌صدا نادیده گرفته شوند.

## خطاهای مهم

| خطا | رفتار پیشنهادی |
|---|---|
| parse error | block یا quarantine تا اصلاح قالب. |
| validation error | block و request correction. |
| duplicate conflict | needs review یا mark as duplicate. |
| wrong mapping | block و correction request. |
| format changed | quarantine و نیاز به approval قالب جدید. |
| missing required field | block تا تکمیل فیلد. |
| low confidence | needs review یا block. |
| unauthorized import attempt | block، quarantine و audit security note. |
| partial import failure | توقف ادامه batch، گزارش اثر، rollback candidate. |

## رفتار سیستم

| رفتار | کاربرد |
|---|---|
| block | ورود داده متوقف می‌شود. |
| quarantine | داده جدا نگه داشته می‌شود تا بررسی عمیق‌تر انجام شود. |
| needs review | reviewer یا manager باید تصمیم بگیرد. |
| request correction | اصلاح داده، mapping یا rule درخواست می‌شود. |
| retry after correction | پس از اصلاح و ثبت audit دوباره تست می‌شود. |
| rollback candidate | import یا بخشی از آن کاندید برگشت می‌شود. |

## Rollback Policy

Rollback یک اقدام حساس است و باید قابل audit باشد. rollback نباید به معنی حذف بی‌ردپا باشد؛ باید قبل/بعد، علت، actor و نتیجه ثبت شود.

## rollback باید چه چیزهایی داشته باشد؟

| داده rollback | توضیح |
|---|---|
| import batch id | شناسه batch که import را ایجاد کرده است. |
| before/after snapshot | وضعیت قبل و بعد از import یا اصلاح. |
| affected records | رکوردهای تحت اثر. |
| actor | شخص یا سیستم درخواست‌دهنده. |
| timestamp | زمان درخواست و اجرای rollback. |
| reason | علت rollback یا correction. |
| manager approval | تایید مدیر برای موارد حساس. |
| rollback result | موفق، نیمه‌موفق، شکست‌خورده یا نیازمند review. |

## چه چیزهایی بدون approval نباید rollback شوند؟

- financial event
- inventory stock
- production formula
- product merge
- employee/workforce critical data
- approved payment/installment

## rollback و correction

در بعضی موارد rollback کامل پرریسک است و باید correction انجام شود. تصمیم بین rollback و correction باید بر اساس risk، audit، اثر روی ماژول‌های دیگر و تایید مدیر انجام شود.

## قوانین توقف

- rollback نباید بدون audit trail انجام شود.
- rollback مالی یا موجودی حساس بدون manager approval ممنوع است.
- partial import failure باید report و rollback candidate بسازد.
- unauthorized import attempt باید در audit و security note ثبت شود.
- rollback نباید داده history و trace را پاک کند.

## محدودیت فعلی

این سند فقط policy است. هیچ rollback engine، database snapshot، migration، permission system یا UI ساخته نمی‌شود.
