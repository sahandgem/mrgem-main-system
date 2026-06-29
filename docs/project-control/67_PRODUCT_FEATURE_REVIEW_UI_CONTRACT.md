# Product Feature Review UI Contract

آخرین به‌روزرسانی: 2026-06-29

## هدف

این سند قرارداد مفهومی UI آینده برای بررسی featureهای مسئله‌دار کالا را تعریف می‌کند. این قرارداد پیاده‌سازی UI یا component نیست و هیچ route، database، migration، auth یا localStorage ایجاد نمی‌کند.

## Product Feature Review UI Contract چیست؟

قراردادی بین Review Queue، validation report، پیشنهاد AI و لایه نمایش آینده است تا reviewer یا مدیر بتواند شواهد یک مسئله را ببیند، تصمیم کنترل‌شده بگیرد و نتیجه را با audit ثبت کند. UI فقط فرمان تصمیم تولید می‌کند و اجازه تغییر مستقیم داده main را ندارد.

## داده‌های لازم برای هر Review Item

| داده | کاربرد در UI |
|---|---|
| `productCode` | شناسایی سریع کالا |
| `productName` | عنوان قابل فهم برای reviewer |
| `featureKey` | feature درگیر |
| `issueType` | نوع خطا، conflict یا نیاز به review |
| `severity` | اولویت و شدت رسیدگی |
| `rawValue` | مقدار اصلی و تغییرناپذیر منبع |
| `normalizedValue` | مقدار normalize شده یا پیشنهادی |
| `validationResult` | نتیجه ruleهای اعتبارسنجی |
| `confidenceLevel` | اطمینان سیستم به mapping یا پیشنهاد |
| `riskFlags` | ریسک‌های duplicate، pricing، production، inventory یا AI |
| `sourceModule` | منبع داده و زمینه ورود |
| `suggestedAction` | اقدام پیشنهادی rule engine مفهومی |
| `aiSuggestion` | پیشنهاد توضیح‌پذیر AI، نه تصمیم نهایی |
| `auditReference` | ارجاع به شواهد و تاریخچه تصمیم |
| `relatedDuplicateSignals` | سیگنال‌های مرتبط با کالای تکراری |
| `relatedConflictSignals` | تعارض‌های مرتبط با مقدار، گروه، سنگ یا منبع |

## الگوی نمایش مفهومی

- سربرگ کالا: productCode، productName، severity و وضعیت فعلی.
- مقایسه مقدار: rawValue در کنار normalizedValue، بدون پنهان‌کردن مقدار خام.
- شواهد: validationResult، confidenceLevel، riskFlags و sourceModule.
- زمینه تصمیم: duplicate/conflict signals، suggestedAction و AI suggestion همراه با دلیل.
- ناحیه تصمیم: actionهای مجاز بر اساس role، severity و approval boundary.
- audit context: auditReference و خلاصه تصمیم‌های قبلی.

## Actionهای UI

- `approve`
- `reject`
- `request_correction`
- `accept_auto_fix`
- `edit_normalized_value`
- `map_manually`
- `mark_duplicate`
- `block_import`
- `escalate_to_manager`

هر action باید queueItemId، actor، role، reason و auditReference را به decision layer تحویل دهد. action حساس بدون reason یا سطح approval معتبر قابل ثبت نیست.

## Stateهای UI

| state | معنی |
|---|---|
| `pending` | هنوز بررسی آغاز نشده است |
| `under_review` | reviewer در حال بررسی شواهد است |
| `correction_requested` | اصلاح از منبع یا importer درخواست شده است |
| `approved` | تصمیم پذیرش با audit ثبت شده است |
| `rejected` | feature یا mapping رد شده است |
| `blocked` | ورود تا رفع مانع ممنوع است |
| `escalated` | تصمیم به مدیر یا سطح بالاتر ارجاع شده است |
| `resolved` | تصمیم نهایی و اثر آن ثبت شده است |

## مرز نقش‌ها

- Reviewer می‌تواند موارد عادی را approve/reject کند، اصلاح بخواهد یا mapping دستی پیشنهاد دهد.
- تغییرهای اثرگذار بر قیمت، وزن حساس، duplicate، barcode یا production formula باید طبق approval boundary به مدیر ارجاع شوند.
- AI فقط suggestionReference، reason و confidence ارائه می‌کند و actor تصمیم محسوب نمی‌شود.
- UI نباید action خارج از مجوز role یا وضعیت current item را نمایش یا اجرا کند.

## قوانین ایمنی

- UI فقط تصمیم را ثبت می‌کند و main data را مستقیم mutate نمی‌کند.
- rawValue همیشه قابل مشاهده و تغییرناپذیر باقی می‌ماند.
- تصمیم حساس باید audit و approval معتبر داشته باشد.
- low confidence و conflict نباید مسیر approve سریع داشته باشند.
- AI suggestion باید از تصمیم انسانی و rule suggestion به‌وضوح جدا دیده شود.
- اجرای واقعی UI در این فاز ممنوع است.

## خروجی مفهومی

UI آینده فقط یک `ProductFeatureReviewDecisionCommand` به decision boundary تحویل می‌دهد؛ اعمال نتیجه، validation مجدد و import decision مسئولیت UI نیست.

## محدودیت فعلی

هیچ صفحه، component، route، state store، API، database، migration یا localStorage key ساخته نشده است.
