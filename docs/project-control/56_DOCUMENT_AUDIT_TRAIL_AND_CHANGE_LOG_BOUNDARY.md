# Document Audit Trail and Change Log Boundary

آخرین به‌روزرسانی: 2026-06-29

## هدف

این سند مرز audit trail و change log سندهای مستر جم را تعریف می‌کند. هدف این است که هر تغییر حساس، هر import، هر تایید، هر اصلاح و هر rollback قابل ردیابی باشد.

این سند فقط طراحی معماری است و هیچ کد اجرایی، route، UI، database، migration، auth، localStorage یا schema محک ایجاد نمی‌کند.

## Document Audit Trail چیست؟

`Document Audit Trail` رد کامل تغییرات و تصمیم‌های مربوط به یک سند است. این trail باید نشان دهد چه چیزی تغییر کرد، چه کسی تغییر داد، چرا تغییر داد، قبل و بعد چه بود و چه rule یا confidence در تصمیم اثر داشت.

## Change Log Boundary چیست؟

`Change Log Boundary` مرز تصمیم‌گیری درباره این است که چه تغییراتی باید log شوند. در مستر جم، هر تغییر حساس یا اثرگذار روی پول، کالا، موجودی، تولید، سند، تایید، import یا rollback باید audit شود.

## هر تغییر سند باید چه چیزهایی ثبت کند؟

| فیلد | توضیح |
|---|---|
| `auditId` | شناسه audit. |
| `documentId` | سند مرتبط. |
| `documentType` | نوع سند. |
| `actionType` | نوع اقدام انجام‌شده. |
| `actor` | کاربر، مدیر، reviewer، admin یا system. |
| `timestamp` | زمان اقدام. |
| `beforeSnapshot` | وضعیت قبل از تغییر. |
| `afterSnapshot` | وضعیت بعد از تغییر. |
| `reason` | دلیل اقدام یا توضیح تصمیم. |
| `sourceModule` | ماژول منبع. |
| `confidenceLevel` | سطح اطمینان در زمان اقدام. |
| `riskFlags` | ریسک‌های مرتبط. |
| `ruleVersion` | نسخه rule یا policy در صورت کاربرد. |
| `relatedEventId` | event مرتبط در Central Business Event Bus. |

## actionTypeهای اصلی

| actionType | کاربرد |
|---|---|
| `create` | ایجاد سند. |
| `submit` | ارسال برای بررسی. |
| `approve` | تایید سند یا اقدام. |
| `reject` | رد سند یا اقدام. |
| `request_correction` | درخواست اصلاح. |
| `update` | تغییر داده سند یا item. |
| `finalize` | نهایی‌سازی سند. |
| `cancel` | لغو سند. |
| `rollback` | برگشت یا اصلاح اثر import/decision. |
| `attach_receipt` | اتصال رسید به سند یا رویداد. |
| `import_from_staging` | ورود داده از staging پس از approval. |

## قوانین

- تغییر حساس بدون audit ممنوع است.
- auto action باید دلیل و rule version داشته باشد.
- rollback باید before/after و approval داشته باشد.
- audit trail نباید قابل حذف بی‌ردپا باشد.
- تغییر ناشی از import باید import batch و audit reference داشته باشد.
- تغییر ناشی از AI suggestion باید confidence و source را ثبت کند.

## مرز حساسیت

این موارد همیشه audit می‌خواهند:

- تغییر مبلغ، تاریخ، طرف حساب یا وضعیت تایید.
- تغییر itemهای مالی، کالا، موجودی یا تولید.
- تایید یا رد مدیر.
- اتصال یا جداسازی رسید.
- import از staging.
- rollback یا cancel.
- merge کالا یا master data.

## محدودیت فعلی

این سند فقط boundary مفهومی است. هیچ audit table، log service، database، migration یا UI ساخته نمی‌شود.
