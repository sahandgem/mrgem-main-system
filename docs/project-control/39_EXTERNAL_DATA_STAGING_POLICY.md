# External Data Staging Policy

آخرین به‌روزرسانی: 2026-06-29

## هدف

این سند سیاست staging برای داده خارجی مستر جم را تعریف می‌کند. هدف این است که هیچ داده خارجی، فایل import، خروجی زیرپروژه یا ورودی موبایل مستقیم وارد سیستم اصلی نشود.

این سند فقط طراحی policy است و هیچ کد اجرایی، route، UI، database، migration، auth، repo یا localStorage ایجاد نمی‌کند.

## External Data Staging Policy چیست؟

`External Data Staging Policy` قانون ورود امن داده از بیرون سیستم اصلی است. هر داده خارجی ابتدا در یک وضعیت staging قرار می‌گیرد، سپس parse، normalize، validate، duplicate/conflict check و confidence scoring می‌شود. فقط داده‌ای که `approved_for_import` باشد می‌تواند وارد main شود.

## چرا داده خارجی نباید مستقیم وارد main شود؟

- قالب فایل ممکن است تغییر کرده باشد.
- داده ممکن است ناقص، تکراری یا conflictدار باشد.
- mapping اشتباه می‌تواند محصول، پرداخت، موجودی یا فرمول تولید را خراب کند.
- داده بدون audit trail قابل برگشت و بررسی نیست.
- AI یا automation ممکن است روی ورودی خام تصمیم اشتباه بگیرد.

## داده‌هایی که باید اول وارد staging شوند

| داده | دلیل staging |
|---|---|
| Bank Excel | تغییر قالب، مبلغ/تاریخ نامعتبر، duplicate transaction یا شرح مبهم. |
| Mobile receipt | عکس ناخوانا، رسید تکراری یا mismatch با بانک/رویداد. |
| Product Excel | barcode conflict، duplicate product یا فیلد ناقص. |
| Mahak export/import | اختلاف کد محک، گروه، barcode یا mapping خروجی. |
| Stone bank | اختلاف نام سنگ، synonym یا رکورد تکراری. |
| Group codes | اختلاف کد داخلی و کد محک. |
| Production formula input | خطای مواد، وزن، هزینه یا فرمول حساس. |
| Inventory import | مغایرت موجودی، تکرار رکورد یا تغییر حساس stock. |
| Workforce external input | داده حضور، عملکرد یا تصمیم بیرونی که باید policy و review داشته باشد. |

## وضعیت‌های staging

| وضعیت | معنی |
|---|---|
| `raw_received` | داده خام دریافت شده اما هنوز parse نشده است. |
| `parsed` | ساختار ورودی خوانده شده اما هنوز normalize نشده است. |
| `normalized` | قالب‌ها، تاریخ‌ها، مبلغ‌ها، کدها یا متن‌ها استاندارد شده‌اند. |
| `validation_failed` | خطای validation مانع ادامه مسیر شده است. |
| `duplicate_candidate` | احتمال تکراری بودن وجود دارد. |
| `conflict` | شواهد ناسازگارند و ورود متوقف می‌شود. |
| `needs_review` | داده باید توسط reviewer یا manager بررسی شود. |
| `auto_fix_suggested` | اصلاح پیشنهادی وجود دارد اما ممکن است نیاز به تایید داشته باشد. |
| `approved_for_import` | داده شرایط ورود کنترل‌شده را دارد. |
| `imported` | داده پس از approval وارد main شده است. |
| `rejected` | داده رد شده و نباید وارد main شود. |
| `quarantined` | داده پرریسک، مبهم یا مشکوک برای بررسی جدا نگه داشته شده است. |

## نقش‌ها

| نقش | مسئولیت |
|---|---|
| importer | فایل یا داده خارجی را وارد staging می‌کند. |
| validator | نتیجه parse، normalize و validation را بررسی می‌کند. |
| reviewer | موارد warning، duplicate، low confidence یا needs review را بررسی می‌کند. |
| manager | موارد حساس، conflict، rollback یا approved import مهم را تایید می‌کند. |
| admin | policy، سطح دسترسی و عملیات حساس آینده را کنترل می‌کند. |

## قوانین اصلی

- main فقط داده `approved_for_import` را بپذیرد.
- `conflict` و `low confidence` نباید auto import شوند.
- `manual only` هیچ‌وقت auto import نشود.
- `missing required fields` باید blocked یا validation_failed شود.
- داده quarantined نباید وارد main شود مگر پس از تصمیم صریح manager/admin.
- هر تغییر status باید audit trail داشته باشد.

## محدودیت فعلی

این سند فقط policy است. هیچ staging table، parser، import job، database، migration، role واقعی یا UI ساخته نمی‌شود.
