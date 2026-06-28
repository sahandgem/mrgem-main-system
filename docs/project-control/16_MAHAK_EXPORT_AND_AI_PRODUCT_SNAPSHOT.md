# Mahak Export And AI Product Snapshot

آخرین به‌روزرسانی: 2026-06-29

## هدف

این سند مرز مفهومی `Mahak Export Adapter` و `AI Product Snapshot` را طراحی می‌کند. این کار فقط مستند است و هیچ اتصال واقعی به محک، خروجی اجرایی، UI، route، localStorage key، database، migration یا merge مستقیم `mahak-web-version` ایجاد نمی‌کند.

## Mahak Export Adapter چیست؟

`Mahak Export Adapter` لایه‌ای است که در آینده پس از validator، duplicate detector و review queue، داده کالا را به قالب قابل بررسی برای خروجی محک تبدیل می‌کند.

این adapter نباید از داده خام پروژه کالا یا رکوردهای تأییدنشده خروجی بسازد. هدف آن preview، mapping و کنترل ریسک است، نه نوشتن مستقیم در سیستم اصلی یا محک.

## کنترل‌های قبل از خروجی محک

| کنترل | دلیل |
|---|---|
| productCode معتبر | جلوگیری از رکورد نامعتبر در خروجی |
| mahakCode تفکیک‌شده از productCode | جلوگیری از قاطی شدن کد داخلی و کد محک |
| barcode معتبر و بدون تداخل | جلوگیری از خطای فروش/انبار |
| groupCode قابل mapping | خروجی محک به گروه درست نیاز دارد |
| groupName قابل خواندن | گزارش انسانی و بررسی خروجی |
| stoneName/stoneType استاندارد | جلوگیری از آلودگی بانک سنگ و تحلیل |
| weight عددی و مثبت | جلوگیری از قیمت و گزارش اشتباه |
| wage عددی | کنترل اجرت و قیمت‌گذاری |
| basePrice/salePrice معتبر | جلوگیری از خروجی مالی خراب |
| duplicate report بدون error باز | خروجی روی کالای تکراری ممنوع است |
| review decisions کامل | رکوردهای نیازمند review نباید وارد export شوند |

## خطر خراب شدن خروجی محک

| خطر | اثر |
|---|---|
| groupCode اشتباه | کالا در گروه غلط وارد محک می‌شود. |
| mahakCode اشتباه | update یا mapping اشتباه رخ می‌دهد. |
| barcode اشتباه | عملیات فروش/اسکن خراب می‌شود. |
| وزن یا اجرت اشتباه | قیمت‌گذاری و گزارش مالی آلوده می‌شود. |
| duplicate حل‌نشده | کالا چندبار در خروجی دیده می‌شود. |
| وابستگی به فایل قدیمی | adapter به ساختار ناپایدار پروژه کالا قفل می‌شود. |

## خروجی پیشنهادی MahakExportPreview

`MahakExportPreview` باید قبل از هر export واقعی ساخته شود و شامل موارد زیر باشد:

- تعداد رکوردهای آماده export
- تعداد رکوردهای block شده
- mapping ستون‌ها
- هشدارهای groupCode / mahakCode / barcode
- لیست duplicateهای حل‌نشده
- نمونه چند ردیف خروجی
- وضعیت آمادگی: ready، needs_review، blocked

## AI Product Snapshot چیست؟

`AI Product Snapshot` خروجی نسخه‌دار و تمیز از داده کالا برای تحلیل هوشمند آینده است. این snapshot باید برای پرس‌وجو، گزارش، تحلیل duplicate، تحلیل قیمت/سنگ/گروه و اتصال به کابین مرکزی قابل استفاده باشد.

Snapshot نباید داده خام آلوده، duplicate حل‌نشده، barcode نامعتبر یا mapping مبهم داشته باشد.

## داده لازم برای AI Product Snapshot

| داده | نقش در تحلیل |
|---|---|
| productCode | شناسه داخلی پایدار |
| mahakCode | اتصال آینده به محک |
| barcode | تحلیل یکتایی و عملیات اسکن |
| name | جست‌وجو و تشخیص شباهت |
| groupCode/groupName | تحلیل گروه و mapping |
| stoneName/stoneType | تحلیل بانک سنگ |
| weight | تحلیل قیمت، تولید و موجودی |
| wage | تحلیل اجرت و هزینه |
| basePrice/salePrice | تحلیل قیمت‌گذاری |
| inventoryStatus | وضعیت عملیاتی کالا |
| productionStatus | اتصال به تولید |
| validationSummary | کیفیت داده |
| duplicateSummary | ریسک duplicate |
| sourceVersion | audit و تکرارپذیری |

## ارتباط با اجزای ایمنی ورود کالا

| جزء | ارتباط |
|---|---|
| barcode | هم در export محک و هم در AI snapshot باید معتبر و بدون تداخل باشد. |
| groupCode | mapping گروه برای محک و تحلیل AI حیاتی است. |
| stone bank | منبع استاندارد stoneName و stoneType است. |
| duplicate detector | رکوردهای duplicate حل‌نشده نباید وارد export یا snapshot شوند. |
| product import report | وضعیت کیفیت batch و آمادگی export/snapshot را تغذیه می‌کند. |

## قواعد توقف

- اگر ProductImportReport خطای باز دارد، MahakExportPreview نباید ready شود.
- اگر DuplicateProductWarningهای حل‌نشده critical باشند، export و snapshot متوقف شوند.
- اگر groupCode یا mahakCode mapping مبهم داشته باشد، خروجی محک blocked شود.
- اگر barcode conflict وجود دارد، خروجی محک و snapshot تحلیلی نباید نهایی شوند.

## پیشنهاد مرکز کنترل

قدم بعدی امن، طراحی `Mahak Export Adapter` جزئی‌تر پس از validator/review queue یا طراحی `AI Product Snapshot Versioning` است. هنوز هیچ export واقعی، database change، UI یا migration نباید انجام شود.
