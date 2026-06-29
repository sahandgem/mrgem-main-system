# Core Product Attribute Model

آخرین به‌روزرسانی: 2026-06-29

## هدف

این سند مدل مفهومی attributeهای کالا را برای مستر جم طراحی می‌کند. این مدل مستقل از schema محک است و فعلاً فقط به عنوان قرارداد طراحی برای فازهای آینده ثبت می‌شود.

## Core Product Attribute Model چیست؟

Core Product Attribute Model توضیح می‌دهد هر feature قابل توسعه کالا وقتی برای یک محصول مشخص ثبت می‌شود، چه اطلاعاتی باید همراه خود داشته باشد. attribute فقط یک مقدار خام نیست؛ باید منبع، اعتبار، وضعیت validation، confidence، risk و audit داشته باشد.

## مدل مفهومی attribute

| فیلد مفهومی | توضیح |
|---|---|
| `attributeId` | شناسه attribute |
| `productId` | ارجاع به کالا در Core Product Model |
| `attributeKey` | کلید مفهومی feature مثل `stoneName` یا `weight` |
| `attributeLabel` | عنوان قابل نمایش برای کاربر یا گزارش |
| `attributeType` | نوع داده attribute |
| `attributeValue` | مقدار ثبت‌شده، پس از normalize |
| `valueUnit` | واحد مقدار، اگر لازم باشد |
| `sourceModule` | ماژول یا منبعی که attribute را تولید کرده است |
| `validationStatus` | وضعیت اعتبارسنجی attribute |
| `confidenceLevel` | سطح اطمینان به مقدار attribute |
| `riskFlags` | ریسک‌های مرتبط مثل conflict، duplicate یا low confidence |
| `isRequired` | آیا برای این کالا یا گروه کالا لازم است؟ |
| `isSearchable` | آیا وارد جست‌وجو شود؟ |
| `isReportable` | آیا وارد گزارش و snapshot شود؟ |
| `createdAt` | زمان ایجاد |
| `updatedAt` | زمان آخرین تغییر |
| `auditReference` | ارجاع به audit trail مربوط به ایجاد یا تغییر attribute |

## attributeTypeهای پیشنهادی

| نوع | کاربرد |
|---|---|
| `text` | متن ساده مثل نام سنگ یا توضیح |
| `number` | عدد عمومی |
| `money` | مقدار پولی مثل اجرت یا قیمت |
| `weight` | مقدار وزنی با واحد مشخص |
| `percentage` | درصد مثل margin یا wasteRate |
| `boolean` | مقدار بله/خیر |
| `enum` | مقدار از فهرست مجاز |
| `date` | تاریخ |
| `reference` | ارجاع به master data یا سند دیگر |
| `formula` | ارجاع یا خلاصه فرمول مفهومی |

## validationStatus پیشنهادی

| وضعیت | معنی |
|---|---|
| `not_checked` | هنوز بررسی نشده است |
| `valid` | معتبر و قابل استفاده است |
| `warning` | قابل استفاده مشروط و نیازمند توجه |
| `invalid` | ورود یا استفاده ممنوع است |
| `needs_review` | نیازمند بررسی انسان |
| `conflict` | با داده دیگر تناقض دارد |

## ارتباط با مدل‌های دیگر

- `Core Product Model`: attributeها جزئیات قابل توسعه کالا را نگه می‌دارند.
- `Master Data Registry`: attributeهای reference باید به داده پایه معتبر وصل شوند.
- `Product Import Validator`: attributeها قبل از ورود باید validate شوند.
- `Product Duplicate Detector`: attributeهای کلیدی در تشخیص تکراری مصرف می‌شوند.
- `Product AI Snapshot`: فقط attributeهای معتبر یا review شده وارد snapshot می‌شوند.
- `Inventory`: attributeهای وضعیت موجودی و location readiness از این مسیر قابل گزارش‌اند.
- `Production Formula`: attributeهایی مثل formulaReference، materialRequirement و productionType در مرز تولید مصرف می‌شوند.
- `Mahak historical data`: داده تاریخی فقط از staging و validation عبور می‌کند و مستقیم وارد attribute اصلی نمی‌شود.

## قوانین

- هر attribute باید validation و audit داشته باشد.
- attribute مشکوک، conflict یا low confidence نباید بدون review وارد main شود.
- attribute دارای source نامشخص نباید برای تصمیم حساس مصرف شود.
- تغییر attribute reportable یا pricing-related باید audit trail داشته باشد.
- attributeهای AI-ready باید source، confidence و validationStatus روشن داشته باشند.
- هیچ naming، schema، جدول، ستون، query یا view محک وارد این مدل نمی‌شود.

## خروجی‌های آینده

- `ProductAttributeRecord`
- `ProductAttributeValidationResult`
- `ProductAttributeRiskFlag`
- `ProductAttributeAuditReference`
- `ProductAttributeAISummary`

## محدودیت فعلی

این مدل فعلاً مفهومی است. هیچ database table، migration، UI، API، route یا localStorage key جدید ایجاد نمی‌شود.
