# Core Business Event Bus

آخرین به‌روزرسانی: 2026-06-29

## هدف

این سند مفهوم `Central Business Event Bus` را برای مستر جم طراحی می‌کند. Event Bus زبان مشترک رخدادها بین ماژول‌ها است و برای Automation-First، AI-Assisted و Central Cockpit لازم است.

این سند فقط طراحی مفهومی است و هیچ کد اجرایی، route، UI، database، migration، auth یا localStorage ایجاد نمی‌کند.

## Central Business Event Bus چیست؟

`Central Business Event Bus` جریان مفهومی رخدادهای کسب‌وکار است. وقتی سندی ساخته می‌شود، پرداختی تایید می‌شود، کالا import می‌شود، کمبود موجودی تشخیص داده می‌شود یا مدیر تصمیمی می‌گیرد، یک event مفهومی می‌تواند ثبت شود تا سایر ماژول‌ها از آن signal یا snapshot بسازند.

## چرا برای Automation-First و AI-Assisted لازم است؟

- ماژول‌ها بدون mutate مستقیم داده یکدیگر با هم هماهنگ می‌شوند.
- cockpit می‌تواند crisis signal و management alert بسازد.
- AI می‌تواند روی eventهای نسخه‌دار و audit شده تحلیل کند.
- audit trail و history تصمیم‌ها کامل‌تر می‌شود.
- هر automation مرز source، confidence و risk را حفظ می‌کند.

## eventهای اصلی آینده

| Event | معنی |
|---|---|
| `FinancialEventCreated` | رویداد مالی ایجاد شد. |
| `PaymentApproved` | پرداخت حساس یا عادی تایید شد. |
| `InstallmentConfirmed` | قسط با rule و audit تایید شد. |
| `ProductImported` | کالای تاییدشده از staging وارد شد. |
| `ProductDuplicateDetected` | احتمال تکراری بودن کالا تشخیص داده شد. |
| `InventoryShortageDetected` | کمبود موجودی تشخیص داده شد. |
| `ProductionStarted` | فرآیند تولید شروع شد. |
| `ProductionCostEstimated` | هزینه تولید تخمین زده شد. |
| `ReceiptUploaded` | رسید از موبایل یا ورودی دیگر ثبت شد. |
| `ManagerReviewRequested` | موردی به صف review مدیر رفت. |
| `ManagerDecisionSubmitted` | مدیر تصمیم ثبت کرد. |
| `CrisisSignalRaised` | سیگنال بحران چندماژولی ایجاد شد. |

## ساختار مفهومی event

| فیلد | توضیح |
|---|---|
| `eventId` | شناسه event. |
| `eventType` | نوع event. |
| `sourceModule` | ماژول تولیدکننده event. |
| `relatedEntity` | سند، کالا، رویداد مالی، موجودی، تولید یا receipt مرتبط. |
| `confidenceLevel` | high، medium، low، conflict یا manual only. |
| `riskFlags` | ریسک‌های مرتبط با event. |
| `timestamp` | زمان رخداد. |
| `actor` | سیستم، کاربر، مدیر، reviewer یا admin. |
| `auditReference` | مرجع audit برای ردیابی source و تصمیم. |
| `payloadSummary` | خلاصه امن و غیرخام برای مصرف ماژول‌های دیگر یا AI. |

## قوانین

- event bus فعلاً مفهومی است.
- هیچ پیاده‌سازی اجرایی انجام نشود.
- هیچ route، database، migration یا queue واقعی ساخته نشود.
- event نباید داده خام حساس یا schema خارجی را تحمیل کند.
- هر event حساس باید auditReference و confidenceLevel داشته باشد.
- ماژول‌ها باید از event و snapshot استفاده کنند، نه mutate مستقیم داده یکدیگر.

## ارتباط با cockpit و AI

Central Cockpit می‌تواند eventها را به alert، trend، decision recommendation و crisis signal تبدیل کند. AI باید فقط eventهای normalize شده، دارای summary و قابل audit را تحلیل کند.
