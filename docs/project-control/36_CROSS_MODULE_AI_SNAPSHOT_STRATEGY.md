# Cross-module AI Snapshot Strategy

آخرین به‌روزرسانی: 2026-06-29

## هدف

این سند استاندارد خروجی `AI-ready snapshot` را برای ماژول‌های مستر جم تعریف می‌کند. هدف این است که AI روی داده خام، ناقص یا conflictدار تحلیل نهایی نسازد و هر snapshot قابل ردیابی، نسخه‌دار و قابل audit باشد.

این سند فقط طراحی معماری است و هیچ کد اجرایی، route، UI، database، migration، auth، repo یا localStorage ایجاد نمی‌کند.

## AI Snapshot چیست؟

`AI Snapshot` یک بسته داده تمیز، نرمال‌شده، اعتبارسنجی‌شده و خلاصه‌شده است که برای تحلیل AI آماده می‌شود. snapshot نباید جایگزین database اصلی باشد و نباید بدون audit trail باعث اقدام حساس شود.

## چرا داده خام نباید مستقیم به AI داده شود؟

- داده خام ممکن است ناقص، تکراری یا conflictدار باشد.
- قالب فایل یا ورودی ممکن است تغییر کرده باشد.
- AI ممکن است از متن مبهم نتیجه قطعی بسازد.
- داده خام معمولاً source، validation status و confidence ندارد.
- تحلیل روی داده خام قابل audit و قابل بازگشت نیست.

## ساختار استاندارد snapshot

هر snapshot آینده باید حداقل این بخش‌ها را داشته باشد:

| فیلد | توضیح |
|---|---|
| `source` | منبع داده: فرم، Excel، receipt، mobile، adapter، history یا signal ماژول دیگر. |
| `normalizedData` | داده پس از پاک‌سازی، استانداردسازی و تبدیل قالب. |
| `validationStatus` | نتیجه validation شامل valid، warning، error، conflict یا blocked. |
| `confidenceLevel` | high، medium، low، conflict یا manual only. |
| `riskFlags` | ریسک‌های کشف‌شده مثل duplicate، missing field، mismatch یا sensitive action. |
| `relatedEntities` | ارتباط با employee، product، financial event، bank transaction، inventory item یا production order. |
| `summaryForAI` | خلاصه کوتاه و کنترل‌شده برای مصرف AI. |
| `auditReference` | شناسه یا reference برای ردگیری داده، rule و تصمیم. |
| `generatedAt` | زمان تولید snapshot. |
| `version` | نسخه schema یا قرارداد snapshot. |

## snapshotهای اصلی آینده

| snapshot | کاربرد |
|---|---|
| `FinancialAISnapshot` | تحلیل رویداد مالی، receipt، bank match، liquidity و approval. |
| `ProductAISnapshot` | تحلیل کالا، duplicate، barcode، mahakCode، stone bank و export readiness. |
| `InventoryAISnapshot` | تحلیل موجودی، کمبود، mismatch و حرکت کالا. |
| `ProductionAISnapshot` | تحلیل فرمول، نیاز مواد، هزینه تولید و anomaly. |
| `WorkforceAISnapshot` | تحلیل ریسک برنامه، ظرفیت، هشدار پیشگیرانه و تاریخچه عملیات. |
| `MobileReceiptAISnapshot` | تحلیل رسید عکس‌دار، classification، upload status و attachment target. |
| `CentralCockpitAISnapshot` | تحلیل چندماژولی، crisis signal، management alert و recommendation. |

## قوانین اصلی

- AI فقط از داده normalize و validate شده تحلیل نهایی بسازد.
- snapshot باید نسخه‌دار، قابل ردیابی و قابل audit باشد.
- snapshot نباید بدون audit trail باعث auto action حساس شود.
- snapshot دارای `conflict` یا `manual only` فقط می‌تواند برای توضیح و review استفاده شود.
- snapshot نباید داده خام حساس غیرضروری را به AI منتقل کند.

## مسیر امن تولید snapshot

1. raw input
2. staging یا module boundary
3. normalize
4. validate
5. duplicate/conflict check
6. confidence score
7. summaryForAI
8. auditReference
9. versioned snapshot

## محدودیت فعلی

این سند فقط قرارداد مفهومی است. هیچ snapshot اجرایی، schema، database، migration، AI engine یا UI ساخته نمی‌شود.
