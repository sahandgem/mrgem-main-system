# Staging Review and Safe Import Boundary

آخرین به‌روزرسانی: 2026-06-29

## هدف

این سند مرز staging، review و safe import را برای داده‌هایی تعریف می‌کند که از بیرون سیستم اصلی یا از ماژول دیگر وارد مستر جم می‌شوند. هدف این است که هیچ داده خامی مستقیم وارد main database یا جریان تصمیم نهایی نشود.

این سند فقط طراحی معماری است و هیچ کد اجرایی، route، UI، database، migration، auth، repo یا localStorage ایجاد نمی‌کند.

## Staging Boundary چیست؟

`Staging Boundary` منطقه امن قبل از ورود داده به سیستم اصلی است. داده در staging هنوز حقیقت نهایی نیست؛ باید normalize، validate، duplicate/conflict check و confidence score شود و در صورت نیاز review بگیرد.

## چرا داده خارجی نباید مستقیم وارد main شود؟

- ممکن است قالب فایل تغییر کرده باشد.
- ممکن است رکورد تکراری، ناقص یا conflictدار باشد.
- ممکن است mapping اشتباه بین کد داخلی، کد محک، barcode، حساب بانکی یا شخص ایجاد کند.
- ممکن است داده حساس بدون audit trail وارد تصمیم خودکار شود.
- ممکن است rollback یا correction بعداً سخت شود.

## مسیر امن ورود داده

1. raw input
2. staging
3. normalize
4. validate
5. duplicate/conflict check
6. confidence score
7. review if needed
8. approved import
9. audit trail

## داده‌هایی که باید اول وارد staging شوند

| داده | دلیل نیاز به staging |
|---|---|
| Bank Excel | احتمال تغییر قالب، duplicate transaction، مبلغ/تاریخ نامعتبر یا شرح مبهم. |
| Mobile receipt | احتمال عکس ناخوانا، سند تکراری، mismatch با bank یا event. |
| Product Excel/Mahak export | احتمال duplicate product، barcode conflict، mahakCode mismatch یا mapping غلط گروه. |
| Stone bank | احتمال نام‌گذاری متفاوت، تکرار یا mismatch با product. |
| Group codes | احتمال اختلاف کد داخلی و کد محک. |
| Production formula input | احتمال خطای مواد، وزن، هزینه یا فرمول حساس. |
| Inventory import | احتمال مغایرت موجودی، رکورد تکراری یا تغییر حساس stock. |

## تصمیم‌های staging

| تصمیم | معنی |
|---|---|
| accept | داده staging قابل ادامه در مسیر validation/import است. |
| reject | داده نامعتبر است و نباید وارد سیستم اصلی شود. |
| needs review | داده نیازمند بررسی انسانی است. |
| duplicate candidate | احتمال تکراری بودن وجود دارد. |
| conflict | شواهد با هم ناسازگارند و ورود متوقف می‌شود. |
| auto-fix suggested | اصلاح پیشنهادی وجود دارد اما بسته به ریسک ممکن است review بخواهد. |
| approved for import | داده پس از کنترل‌ها مجاز به ورود کنترل‌شده است. |

## قوانین توقف

- conflict نباید وارد main شود.
- low confidence نباید auto import شود.
- missing required fields باید blocked شود.
- manual only هیچ‌وقت auto import نشود.
- duplicate candidate بدون review نباید create یا merge شود.
- فایل یا ورودی با قالب ناشناخته باید تا approval متوقف بماند.

## audit مورد نیاز

هر import تاییدشده باید ثبت کند:

- source و raw input reference
- normalized data
- validation result
- duplicate/conflict result
- confidence level
- review decision
- approvedBy یا actor
- importedAt
- version و rule reference

## محدودیت فعلی

این سند فقط boundary مفهومی است. هیچ staging table، database، API، localStorage key، migration، parser یا import اجرایی ساخته نمی‌شود.
