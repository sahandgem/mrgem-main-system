# Product Schema And Adapter Boundary

آخرین به‌روزرسانی: 2026-06-29

## هدف

این سند `Product Schema Draft` و مرز اتصال آینده پروژه کالا / `mahak-web-version` به سیستم‌عامل مستر جم را طراحی می‌کند. این طراحی فقط مستند است و هیچ کد اجرایی، route، UI، localStorage key، database، migration یا merge مستقیم ایجاد نمی‌کند.

## Product Schema Draft

اگر کالا در آینده وارد database اصلی شود، ساختار پیشنهادی اولیه باید مستقل از UI و مستقل از فایل‌های قدیمی پروژه کالا باشد. این schema باید قبل از migration، adapter اجرایی و UI تأیید شود.

| فیلد | نوع پیشنهادی | توضیح |
|---|---|---|
| `id` | string | شناسه پایدار داخلی مستر جم |
| `productCode` | string | کد داخلی کالا برای عملیات مستر جم |
| `mahakCode` | string nullable | کد متناظر محک، در صورت وجود |
| `barcode` | string nullable | بارکد اصلی کالا؛ aliasهای آینده باید جدا بررسی شوند |
| `name` | string | نام اصلی کالا |
| `groupCode` | string nullable | کد گروه کالا برای mapping داخلی/محک |
| `groupName` | string nullable | نام گروه کالا |
| `stoneType` | string nullable | نوع سنگ یا دسته سنگ |
| `stoneName` | string nullable | نام سنگ از بانک سنگ |
| `weight` | number nullable | وزن کالا یا سنگ |
| `weightUnit` | string | واحد وزن، مثل گرم یا قیراط |
| `wage` | number nullable | اجرت ساخت/پرداخت |
| `basePrice` | number nullable | قیمت پایه |
| `salePrice` | number nullable | قیمت فروش |
| `inventoryStatus` | string | وضعیت موجودی: available، reserved، out، in_production، review |
| `productionStatus` | string | وضعیت تولید: ready، in_progress، needs_work، invalid |
| `dataSource` | string | manual، mahak، import، mahak-web-version، ai-ready |
| `isActive` | boolean | فعال/غیرفعال بدون حذف فیزیکی |
| `createdAt` | datetime | زمان ایجاد |
| `updatedAt` | datetime | زمان آخرین تغییر |
| `notes` | string nullable | توضیحات کوتاه |

## قراردادهای schema

- `productCode` کد داخلی مستر جم است و نباید بدون تصمیم مرکز فرمان با `mahakCode` یکی فرض شود.
- `barcode` باید قبل از import نهایی از نظر خالی بودن، تکراری بودن و format بررسی شود.
- `weight` و `wage` باید عددی، قابل normalize و قابل گزارش خطا باشند.
- `inventoryStatus` فقط وضعیت خلاصه کالا است؛ مقدار موجودی باید در مدل انبار آینده نگه‌داری شود.
- `productionStatus` فقط وضعیت مرتبط با تولید را نشان می‌دهد؛ جریان تولید در `Production Flow Model` جدا می‌ماند.
- `dataSource` برای audit و rollback مفهومی ضروری است.

## Adapter Boundary

اتصال پروژه کالا / `mahak-web-version` به مستر جم باید از مسیر adapter انجام شود، نه merge مستقیم. adapter فقط داده را می‌خواند، normalize می‌کند، گزارش می‌سازد و خروجی قابل تصمیم‌گیری به مرکز فرمان می‌دهد.

## ورودی‌های احتمالی adapter

| ورودی | نقش |
|---|---|
| خروجی Excel محک | منبع بررسی ستون‌ها، کدها، قیمت‌ها و mapping محک |
| بانک سنگ | منبع نوع سنگ، نام سنگ و ویژگی‌های قابل تحلیل |
| کد گروه‌ها | منبع groupCode و groupName |
| بارکدها | منبع barcode و کنترل تکراری |
| فایل‌های کالا | منبع import نمونه و تطبیق با schema |
| خروجی AI-ready | منبع داده تمیز برای تحلیل و snapshot آینده |

## خروجی مورد انتظار برای مستر جم

| خروجی | هدف |
|---|---|
| `ProductNormalizedRecord` | رکورد normalize شده و سازگار با schema پیشنهادی |
| `ProductImportReport` | گزارش تعداد رکوردها، خطاها، هشدارها و آمادگی import |
| `DuplicateProductWarning` | هشدار تکراری بر اساس productCode، mahakCode، barcode، name یا ترکیب وزن/سنگ |
| `MahakExportPreview` | پیش‌نمایش خروجی محک بدون نوشتن در سیستم اصلی |
| `AIProductSnapshot` | snapshot تمیز و قابل تحلیل برای AI، بدون داده خام آلوده |

## قوانین امنیتی

- هیچ دیتایی مستقیم وارد database اصلی نشود.
- adapter ابتدا داده را normalize کند.
- adapter سپس گزارش خطا، warning و duplicate بسازد.
- ورود به مرحله UI یا migration فقط با تأیید مرکز فرمان مجاز است.
- فایل‌های پروژه کالا نباید به عنوان dependency مستقیم برنامه اصلی import شوند.
- خروجی Excel یا AI-ready باید قبل از استفاده، version و schema report داشته باشد.
- اگر خطاهای وزن، اجرت، barcode یا کد محک زیاد بود، import متوقف شود.

## ریسک‌ها

| ریسک | اثر | کنترل پیشنهادی |
|---|---|---|
| تکراری شدن کالا | گزارش و موجودی اشتباه | `Product Duplicate Detector` قبل از import |
| اختلاف کد محک با کد داخلی | خراب شدن mapping و خروجی محک | تفکیک `productCode` و `mahakCode` |
| اشتباه در بارکد | خطای فروش/انبار/اسکن | barcode strategy و validation |
| اشتباه در وزن یا اجرت | قیمت‌گذاری و تولید اشتباه | numeric normalization و گزارش خطا |
| خراب شدن خروجی محک | import/export نامعتبر | `Mahak Export Adapter` و preview قبل از خروجی |
| وابستگی مستقیم به فایل‌های قدیمی پروژه کالا | قفل شدن معماری و افزایش بدهی | adapter boundary و ممنوعیت merge مستقیم |

## ترتیب امن آینده

1. Product Schema Draft
2. Product Adapter Boundary
3. Product Import Validator
4. Product Duplicate Detector
5. Mahak Export Adapter
6. AI Product Snapshot
7. UI بعداً و فقط بعد از تأیید مرکز فرمان
8. migration فقط با اجازه مرکز فرمان

## تعریف خروجی‌های آینده

### ProductNormalizedRecord

رکوردی که از ورودی خام ساخته می‌شود و همه فیلدهای اصلی schema را با type و naming ثابت دارد.

### ProductImportReport

گزارشی که قبل از هر import نشان می‌دهد چند رکورد معتبر، چند هشدار، چند خطا و چند duplicate وجود دارد.

### DuplicateProductWarning

هشداری که نشان می‌دهد کدام رکوردها احتمالاً یک کالا هستند یا در barcode / mahakCode / productCode تداخل دارند.

### MahakExportPreview

پیش‌نمایش خروجی محک که قبل از تولید فایل یا اتصال واقعی، ستون‌ها و mapping را قابل بررسی می‌کند.

### AIProductSnapshot

خروجی تمیز، سبک و نسخه‌دار برای تحلیل هوشمند، بدون نیاز به وابستگی مستقیم به فایل‌های پروژه کالا.

## پیشنهاد مرکز کنترل

قدم بعدی امن، طراحی مستند `Product Import Validator` و `Product Duplicate Detector` است. هنوز هیچ UI، migration، database change یا merge پروژه کالا نباید انجام شود.
