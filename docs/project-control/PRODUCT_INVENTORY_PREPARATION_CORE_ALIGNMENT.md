# Product & Inventory Preparation Core — Alignment

آخرین به‌روزرسانی: 2026-07-02

## 1. Purpose

این سند برای هماهنگی `Product & Inventory Preparation Core` با `Master Gem Core / Master Gem OS` است.

این سند:

- implementation نیست.
- migration نیست.
- schema change نیست.
- merge نیست.
- فقط قانون، مرز و قرارداد آینده را ثبت می‌کند.

تصمیم Project Core این است که این بخش ابزار موقت ثبت کالا نیست، اما مرکز کل پروژه هم نیست. این بخش زیرسیستم آماده‌سازی Product + Inventory است.

- نام مفهومی تاییدشده: `Product & Inventory Preparation Core`
- جایگاه معماری: زیرمجموعه آینده `Product + Inventory Core`
- هدف نهایی: اتصال آینده به `Master Gem Core / Master Gem OS`

قانون مهم: محک مقصد نهایی یا هسته اصلی نیست؛ محک فقط یک Connector / Export Target است.

## 2. Current Subproject Boundary

این بخش فعلاً داخل پروژه محک / `web-version` توسعه می‌یابد و در وضعیت subproject است. direct merge به Master Gem Core ممنوع است. اتصال آینده فقط از طریق contract، migration و connector کنترل‌شده مجاز خواهد بود.

توسعه MVP در subproject می‌تواند ادامه یابد، اما مدل داده و مرزهای اصلی باید با Master Gem Core سازگار بمانند.

در این مرحله:

- no source change
- no database change
- no schema migration
- no direct merge
- no connector implementation

فقط alignment ثبت می‌شود.

`Product & Inventory Preparation Core` نباید جای کل Product + Inventory Core را بگیرد. این فقط بخش آماده‌سازی، ثبت، صف عملیات، عکس، وضعیت Workbench و خروجی Connector است.

## 3. Product Contract

Product موجودیت اصلی کالا است و باید از ابتدا قابل اتصال به Master Gem Core باشد. برای آینده باید `master_product_id` رزرو شود. `product_code` و `barcode` به‌تنهایی شناسه حقیقت کافی نیستند.

حداقل مفاهیم Product:

- `master_product_id`
- `product_code`
- `barcode`
- `group_code`
- `product_name`
- `product_index`
- `product_type`
- `full_product_name`
- `unit`
- `pricing_status`
- `media_status`
- `workbench_status`
- `inventory_status`
- `source_system`
- `source_reference`
- `created_at`
- `updated_at`

قواعد هویت:

- `master_product_id` شناسه آینده در Master Gem Core است.
- `product_code` شناسه کاری/داخلی یا کد محصول است.
- `barcode` شناسه چاپی و اسکن‌شونده است.
- `source_reference` اتصال به محک یا سیستم‌های قدیمی را نگه می‌دارد.
- barcode نباید تنها source of truth محصول در هسته مادر باشد.
- هویت آینده بر ترکیب `master_product_id + product_code + barcode mapping` استوار است.

## 4. Structured Product Name Rule

نام کالا نباید فقط یک متن آزاد باشد.

ساختار پایه:

- `product_name`
- `product_index`
- `product_type`
- `full_product_name`

`full_product_name` برای نمایش، خروجی محک و Excel ساخته می‌شود، اما داده اصلی باید ساختاری و جدا بماند.

فرمول مفهومی:

`full_product_name = product_name + product_index + product_type`

ثبت جداگانه نام، شاخص و نوع در آینده امکان‌های زیر را فراهم می‌کند:

- ساخت خروجی محک
- پیشنهاد بهتر قیمت مرجع
- تشخیص خطای نام‌گذاری
- تغذیه دقیق‌تر AI و Cockpit
- migration ساده‌تر به Master Gem Core

هیچ بخشی نباید فقط به full text name وابسته شود، مگر برای نمایش یا export.

## 5. MediaAsset Contract

عکس کالا بخشی از Product Entry نیست و باید به‌عنوان `MediaAsset` دیده شود.

حداقل مفاهیم MediaAsset:

- `media_id`
- `related_product_id / master_product_id`
- `product_code`
- `barcode`
- `related_task_id`
- `media_type`
- `file_path`
- `file_stage`
- `capture_status`
- `review_status`
- `captured_by`
- `captured_at`
- `source_device`
- `notes`
- `audit_reference`

عکس باید به کالا و Task وصل باشد، نه فقط یک فایل داخل پوشه.

مدل قدیمی که نباید ادامه یابد:

- ثبت با عکس
- ثبت بدون عکس

مدل جدید:

`ثبت ردیف کالا → ایجاد Task در Workbench → انجام عکس توسط Mobile Companion → ثبت MediaAsset → نمایش وضعیت در Workbench → هشدار قبل از خروجی در صورت کمبود عکس`

مسیرهای پیشنهادی محلی برای MVP:

- `web-version/data/product-images/incoming`
- `web-version/data/product-images/review`
- `web-version/data/product-images/final`

برای MVP، عکس تاییدشده توسط موبایل وارد `review` می‌شود و `final` برای مرحله نهایی‌سازی/خروجی آینده رزرو می‌ماند.

این مسیرها فقط implementation محلی هستند. در معماری مادر، عکس باید به‌عنوان MediaAsset با metadata، related product، related task، status و audit ثبت شود.

## 6. Operation Task / Workbench Contract

کارهای بعد از ثبت کالا باید وارد Workbench شوند.

Product Entry فقط مسئول این موارد است:

- انتخاب گروه کالا
- ورود اطلاعات کالا
- استفاده از قیمت / قیمت تمام‌شده
- تولید یا نمایش کد / بارکد
- ثبت ردیف کالا
- ارسال کالا به Workbench

Product Entry مسئول این موارد نیست:

- عکس گرفتن
- کنترل کیفیت
- AI
- محل انبار
- مدیریت صف
- تصمیم نهایی خروجی
- مدیریت عملیات موبایل

Workbench مرکز عملیات بعد از ثبت کالا است.

مدل محلی قابل قبول: `operation_tasks`

فیلدهای پیشنهادی:

- `id`
- `product_code`
- `barcode`
- `group_code`
- `product_name`
- `task_type`
- `status`
- `priority`
- `source`
- `created_at`
- `updated_at`
- `completed_at`
- `result_ref_id`
- `payload_json`

task type فعلی:

- `PHOTO`

task typeهای آینده:

- `PHOTO`
- `QC`
- `BARCODE_VERIFY`
- `WAREHOUSE_LOCATION`
- `AI_ANALYSIS`
- `AI_ICON_GENERATION`
- `PACKAGING`
- `EXPORT_READY`

statusهای اولیه:

- `pending`
- `in_progress`
- `completed`
- `skipped`
- `error`
- `cancelled`

`operation_tasks` برای MVP محلی قابل قبول است، اما باید در آینده به `Task`، `DecisionItem`، `MediaAsset` و `Audit` در Master Gem Core قابل mapping باشد. نباید جدول اختصاصی فقط برای عکس ساخته شود که آینده را قفل کند.

Mobile Companion اپ تجاری مستقل نیست؛ ابزار اجرایی Workbench است.

وظیفه موبایل:

`دریافت وظیفه بعدی → انجام وظیفه → تأیید → رفتن به وظیفه بعدی`

وظیفه اصلی فعلی موبایل `PHOTO` است. در آینده همین ساختار می‌تواند برای QC، اسکن بارکد، محل انبار یا AI استفاده شود.

## 7. InventoryMovement Future Contract

ثبت کالا الزاماً به معنی ورود قطعی به انبار نهایی نیست. برای آینده باید `InventoryMovement` جدا دیده شود.

حداقل مفاهیم آینده:

- `movement_id`
- `product_id / master_product_id`
- `product_code`
- `barcode`
- `movement_type`
- `source_location`
- `target_location`
- `quantity`
- `unit`
- `reason`
- `related_task_id`
- `created_at`
- `created_by`
- `audit_reference`

movement typeهای آینده:

- `initial_entry`
- `location_assign`
- `move`
- `reserve`
- `release`
- `production_consume`
- `production_output`
- `sale_dispatch`
- `correction`

محل انبار و جابه‌جایی کالا نباید داخل Product Entry قاطی شود. این بخش در MVP می‌تواند فقط status داشته باشد، اما contract آینده باید جدا بماند.

اگر در MVP فقط «وضعیت نیازمند تعیین محل» وجود دارد، این هنوز InventoryMovement کامل نیست. InventoryMovement کامل باید بعداً با contract جدا فعال شود.

## 8. DecisionItem Future Contract

موارد مشکوک یا نیازمند تأیید مدیر باید در آینده `DecisionItem` شوند.

نمونه موارد:

- خروجی بدون عکس
- قیمت نامطمئن
- گروه کالای مشکوک
- بارکد تکراری
- mismatch بین نام/شاخص/نوع
- عکس بی‌کیفیت
- آماده خروجی نبودن کالا
- تغییر حساس در قیمت تمام‌شده
- override دستی خروجی محک
- عبور از هشدار Workbench

حداقل مفاهیم آینده:

- `decision_id`
- `related_product_id / master_product_id`
- `related_task_id`
- `decision_type`
- `risk_level`
- `status`
- `suggested_action`
- `requested_by`
- `decided_by`
- `decided_at`
- `audit_reference`

در MVP تأیید صریح کاربر کافی است، اما در Master Gem Core باید به DecisionItem / Audit نگاشت شود.

AI می‌تواند پیشنهاد بدهد، اما مالک تصمیم نیست. تصمیم نهایی با مدیر یا rule مصوب است.

## 9. Mahak Connector Boundary

محک source of truth نیست و فقط Export Connector است.

مسیر صحیح:

`Master Gem Data Model → Mahak Export Connector → Mahak Format`

مسیر معکوس مجاز نیست. هیچ تغییر در خروجی محک نباید مدل مادر را وابسته به محدودیت‌های محک کند.

Mahak Connector مسئول است:

- تبدیل داده ساختاری به فرمت محک
- ساخت Excel/XML/خروجی لازم
- رعایت قالب‌های موجود محک
- حفظ compatibility با نیازهای فعلی

Mahak Connector مسئول نیست:

- تعریف مدل اصلی Product
- تعیین شناسه حقیقت کالا
- تعیین منطق اصلی Workbench
- تعیین منطق MediaAsset
- تعیین تصمیم مدیریتی

No-touch list، مگر با دستور صریح:

- barcode generation logic
- `costCalculator`
- reference price logic
- templates
- `group_codes`
- `stone_names`
- `barcode_records`
- legacy data loader
- Mahak export format
- sensitive `app_settings`
- `product_rows` مگر در محدوده ثبت کالا
- schemaهای قدیمی مگر با migration امن

پیش از هر تغییر دیتابیس، timestamped backup الزامی است. اگر تغییر database/schema لازم شد، باید task جدا، backup، rollback، migration plan و report داشته باشد.

## 10. MVP Rules

هدف فوری MVP:

`ثبت پشت‌سرهم کالا → ساخت Task عکس برای موارد لازم → اجرای صف عکس در موبایل → نمایش وضعیت Workbench → هشدار کمبود عکس پیش از خروجی`

MVP فعلی فقط شامل این موارد است:

- Product Entry سریع
- Operation Queue
- Mobile Photo Task
- Workbench Status
- Export Warning

فعلاً انجام نشود:

- QC کامل
- AI
- full inventory
- full mobile app
- Cockpit
- production integration
- database/schema بزرگ بدون migration
- اتصال مستقیم به Master Gem Core
- full Workbench implementation
- انبارداری پیشرفته
- نهایی‌سازی فایل عکس
- automation/n8n execution

قانون UI/UX سی‌ثانیه‌ای: هر کاربر باید در کمتر از ۳۰ ثانیه بفهمد صفحه برای چیست.

تقسیم نقش:

- Product Entry: «من اینجا فقط کالا ثبت می‌کنم.»
- Workbench: «من اینجا کارهای بعد از ثبت را می‌بینم.»
- Mobile Companion: «من اینجا وظیفه بعدی را انجام می‌دهم.»

قواعد UI آینده:

- دکمه اصلی ثبت باید مشخص و غالب باشد.
- عملیات بعد از ثبت نباید کنار دکمه ثبت قاطی شود.
- وضعیت Workbench باید پایین صفحه یا در بخش جدا واضح باشد.
- badgeها باید معنی‌دار باشند: عکس ثبت شد، در صف عکس، در حال عکاسی، بدون عکس، خطای عکس.

پیش از خروجی یا ثبت نهایی، سیستم باید وضعیت Workbench را بررسی کند. اگر کالایی عکس الزامی دارد ولی Task عکس کامل نشده است، باید هشدار «چند کالا هنوز عکس ندارند» نمایش داده و نام کالا، بارکد و وضعیت عکس را فهرست کند.

خروجی بدون عکس فقط با تأیید صریح مجاز است. در معماری مادر، این تأیید باید به DecisionItem / Audit نگاشت شود.

## 11. Future Core Integration Questions

- شناسه اصلی آینده کالا چیست؟
- `master_product_id` از چه زمانی ساخته می‌شود؟
- Product Entry چه زمانی به Product + Inventory Core migrate می‌شود؟
- MediaAsset در Master Gem Core کجا ذخیره می‌شود؟
- `operation_tasks` چگونه به Task / DecisionItem / Audit نگاشت می‌شوند؟
- InventoryMovement از چه فازی فعال می‌شود؟
- Mahak Connector چگونه از مدل مادر خروجی می‌سازد؟
- چه داده‌ای از Legacy Intelligence فقط پیشنهاد است و چه داده‌ای source of truth است؟
- Workbench چه summaryهایی به Cockpit می‌دهد؟
- Mobile Companion فقط executor می‌ماند یا نقش‌های دیگری می‌گیرد؟
- قیمت پیشنهادی و قیمت تاییدشده در کدام فاز جدا می‌شوند؟
- آیا عکس/QC/AI/محل انبار همگی task type می‌مانند یا برخی entity مستقل می‌شوند؟
- چه زمانی subproject محک فقط Connector می‌شود و Product Core از آن جدا می‌شود؟

نظر فعلی Project Core:

- نام زیرسیستم قابل قبول است.
- Workbench قابل قبول است.
- `operation_tasks` برای MVP قابل قبول است، اما باید به Task/Decision/MediaAsset/Audit قابل mapping باشد.
- خروجی محک باید Connector باشد.
- شناسه آینده باید ترکیب `master_product_id + product_code + barcode mapping` باشد.
- عکس/QC/AI/محل انبار می‌توانند task type باشند، ولی هرکدام باید boundary جدا داشته باشند.
- زیرسیستم فعلاً مستقل بماند و بعداً از طریق contract/migration وصل شود.
- Workbench باید در آینده summary به Cockpit بدهد.
- Mobile Companion فعلاً فقط task executor بماند.
- Legacy Intelligence باید پیشنهاد بدهد، نه اینکه source of truth شود.
- AI باید پیشنهاد بدهد، نه تصمیم نهایی بگیرد.

## 12. Final Principle

این بخش قرار نیست دور ریخته شود. هرچقدر توسعه پیدا کند، باید بعداً قابل اتصال به Master Gem Core باشد.

از امروز هر تصمیم باید با این پرسش سنجیده شود: اگر پروژه ۱۰ برابر بزرگ‌تر شود، آیا این تصمیم هنوز درست است؟

## 13. Recommended Next Action

پیشنهاد بعدی:

`PRODUCT-P01 — Product Entry + Workbench Photo MVP Plan`

این مسیر فقط داخل subproject محک / `web-version` است، نه Master Gem Core.

پیش از اجرای PRODUCT-P01 باید:

- backup timestamped گرفته شود.
- محدوده فایل‌ها مشخص شود.
- no-touch list رعایت شود.
- schema change احتمالی migration امن داشته باشد.
- report template مشخص باشد.

## 14. Non-Goals

این سند مجوز اجرای هیچ‌کدام از موارد زیر نیست:

- code implementation
- schema migration
- database change
- direct Mahak/Product merge
- Cockpit implementation
- AI implementation
- full Workbench implementation
- full mobile app implementation
- production inventory implementation
- source refactor
- P56
- merge/main/push
