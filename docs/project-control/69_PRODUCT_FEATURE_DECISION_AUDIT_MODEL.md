# Product Feature Decision Audit Model

آخرین به‌روزرسانی: 2026-06-29

## هدف

این سند مدل مفهومی audit برای تصمیم‌های reviewer و manager درباره featureهای کالا را تعریف می‌کند تا هر تایید، رد، اصلاح، mapping، block یا override قابل پیگیری باشد.

## Product Feature Decision Audit Model چیست؟

یک رکورد append-only مفهومی از زمینه تصمیم، actor، مقدار قبل/بعد، دلیل، confidence، risk، rule و شواهد مرتبط است. Audit record جایگزین داده اصلی یا review item نیست و نباید برای بازنویسی تاریخچه استفاده شود.

## فیلدهای مدل

| فیلد | نقش |
|---|---|
| `decisionId` | شناسه یکتای تصمیم |
| `queueItemId` | ارجاع به آیتم صف بررسی |
| `productId` | ارجاع مفهومی به کالا |
| `featureKey` | feature موضوع تصمیم |
| `decisionType` | نوع تصمیم reviewer یا manager |
| `actor` | هویت تصمیم‌گیر |
| `role` | نقش actor هنگام تصمیم |
| `timestamp` | زمان ثبت تصمیم |
| `beforeValue` | مقدار normalize شده پیش از تصمیم |
| `afterValue` | مقدار پس از اصلاح یا mapping، در صورت وجود |
| `decisionReason` | دلیل قابل فهم و اجباری تصمیم |
| `confidenceLevel` | confidence شواهد هنگام تصمیم |
| `riskFlags` | ریسک‌های موثر بر تصمیم |
| `sourceModule` | منبع داده یا فرآیند |
| `aiSuggestionReference` | ارجاع به پیشنهاد AI، در صورت وجود |
| `ruleVersion` | نسخه ruleهای استفاده‌شده |
| `auditReference` | زنجیره audit مرتبط |

## Decision Typeها

- `approve`
- `reject`
- `request_correction`
- `accept_auto_fix`
- `manual_map`
- `edit_normalized_value`
- `mark_duplicate`
- `block_import`
- `escalate`
- `manager_override`

## Approval Boundary

| موضوع تصمیم | حداقل کنترل |
|---|---|
| تغییر قیمت یا feature قیمت‌گذار | manager approval و دلیل |
| تغییر وزن حساس یا واحد مبهم | review تخصصی و manager approval در ریسک بالا |
| تغییر barcode یا duplicate decision | duplicate evidence و approval مشخص |
| merge یا mark duplicate | تصمیم انسانی، بدون auto merge |
| feature اثرگذار بر production formula | approval مسئول تولید/مدیر |
| low confidence یا conflict | block تا تصمیم انسانی |
| manager override | دلیل اجباری، شواهد، before/after و auditReference |

## ثبت پیشنهاد AI

- AI actor یا decision maker نیست.
- `aiSuggestionReference` فقط پیشنهاد، دلیل، confidence و sourceهای آن را پیوند می‌دهد.
- پذیرش یا رد پیشنهاد AI باید به نام actor انسانی یا rule خودکار مجاز ثبت شود.
- manager override نباید با پیشنهاد AI توجیه ضمنی شود؛ reason مستقل لازم است.

## قوانین Audit

- تغییر feature حساس بدون audit ممنوع است.
- `manager_override` بدون decisionReason معتبر نیست.
- هر تغییر مقدار باید beforeValue و afterValue داشته باشد.
- تصمیم‌های مرتبط با قیمت، وزن، barcode، duplicate و production formula باید سطح approval مشخص داشته باشند.
- audit record پس از ثبت حذف یا بازنویسی نشود؛ اصلاح بعدی یک رکورد جدید ایجاد می‌کند.
- ruleVersion و confidenceLevel باید وضعیت زمان تصمیم را منعکس کنند.
- auditReference باید review item، validation report و gate decision را قابل اتصال کند.

## خروجی‌های آینده

- `ProductFeatureDecisionAuditRecord`
- `ProductFeatureManagerOverrideRecord`
- `ProductFeatureDecisionHistory`
- `ProductFeatureApprovalReference`

## محدودیت فعلی

این مدل فقط مستند است. هیچ audit store، database، migration، auth/role implementation، UI، route یا localStorage key ساخته نشده است.
