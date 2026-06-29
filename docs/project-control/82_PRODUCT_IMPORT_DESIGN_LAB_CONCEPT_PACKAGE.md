# Product Import Design Lab Concept Package

آخرین به‌روزرسانی: 2026-06-29

## وضعیت

این سند خروجی CONTROL-P29-BATCH است و فقط برای Design Lab نوشته شده است. این بسته مجوز ساخت UI اجرایی، component، route، prototype واقعی، import واقعی، storage واقعی، اتصال به محک، استفاده از داده واقعی یا merge به main نیست.

## Product Import Design Lab Concept Package چیست؟

Product Import Design Lab Concept Package قرارداد مفهومی برای طراحی تجربه ورود کالا در محیط Design Lab است. هدف آن این است که تیم طراحی بداند flowها، screen conceptها، کارت‌ها، گزارش‌ها و سناریوهای mock باید چه محدوده‌ای داشته باشند، بدون اینکه هیچ رفتار اجرایی در پروژه اصلی ساخته شود.

## هدف بسته Design Lab

- تبدیل معماری Product Import به زبان قابل طراحی برای screen spec و mock flow.
- مشخص کردن صفحه‌های مفهومی مورد نیاز قبل از هر prototype واقعی.
- حفظ مرز ایمنی بین Design Lab و main app.
- آماده کردن مسیر review مدیریتی، quality gate، AI suggestion و audit summary در سطح concept.
- جلوگیری از ورود زودهنگام داده واقعی، UI واقعی یا اتصال مستقیم به محک.

## خروجی‌های مجاز Design Lab

| خروجی | هدف | محدودیت |
|---|---|---|
| Product Import Flow Map | نمایش مسیر synthetic input تا decision/audit | فقط diagram یا spec |
| Import Dry-run Screen Concept | نمایش نتیجه قبل از import واقعی | بدون import یا action واقعی |
| Product Review Queue Screen Concept | نمایش issueها، confidence، risk و decisionهای مفهومی | بدون mutation |
| Quality Gate Result Screen | نمایش pass/warning/blocked و دلیل‌ها | فقط mock result |
| Batch Decision Screen | نمایش تصمیم batch و itemها | بدون اجرای تصمیم |
| Manager Decision Report Screen | خلاصه مدیریتی risk، AI suggestion و required action | بدون approval واقعی |
| Product Data Quality Metrics Card | نمایش شاخص‌های read-only کیفیت داده | فقط concept |
| AI Suggestion Panel Concept | نمایش پیشنهاد AI، دلیل، confidence و audit reference | AI تصمیم‌گیر نهایی نیست |

## خروجی‌های ممنوع

- UI اجرایی در main app.
- route واقعی یا تغییر route موجود.
- component واقعی یا dependency جدید.
- database، migration یا storage واقعی.
- import واقعی یا write به داده اصلی.
- اتصال مستقیم به محک یا وابستگی به schema/query/table/view محک.
- استفاده از داده واقعی مشتری، کالا، barcode، قیمت یا خروجی واقعی محک.
- merge مستقیم خروجی Design Lab به main.

## قانون Design Lab

Design Lab فقط concept، mock، screen spec، flow diagram، storyboard و pattern پیشنهادی تولید می‌کند. هیچ خروجی Design Lab مستقیم وارد main نمی‌شود و هر پیاده‌سازی آینده به approval جداگانه، فاز مستقل، test plan، rollback plan و مرز storage مستقل نیاز دارد.

## ارتباط با اسناد قبلی

- `76_PRODUCT_IMPORT_PROTOTYPE_CHARTER.md`: هدف و پرسش‌های prototype آینده را تعریف می‌کند.
- `77_PRODUCT_IMPORT_SYNTHETIC_DATA_PROTOCOL.md`: فقط synthetic/mock data را مجاز می‌داند.
- `78_PRODUCT_IMPORT_PROTOTYPE_ISOLATION_BOUNDARY.md`: جدایی prototype از main را تعریف می‌کند.
- `79_PRODUCT_IMPORT_PROTOTYPE_APPROVAL_REVIEW.md`: Design Review را approved و Prototype Build را not approved ثبت کرده است.
- `80_PRODUCT_IMPORT_DESIGN_LAB_TRANSITION_PLAN.md`: مسیر انتقال به Design Lab را مشخص می‌کند.
- `81_PRODUCT_IMPORT_IMPLEMENTATION_HOLD_POLICY.md`: implementation را تا approval مستقل در hold نگه می‌دارد.

## وضعیت approval

| مورد | وضعیت |
|---|---|
| Design Lab concept package | Approved for documentation |
| Design Lab planning | Approved |
| Prototype build | NOT_APPROVED |
| Implementation | NOT_APPROVED |
| Main app UI change | NOT_APPROVED |
| Real import | NOT_APPROVED |
| Real Mahak connection | NOT_APPROVED |
