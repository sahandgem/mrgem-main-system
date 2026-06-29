# Product Feature Review Queue

آخرین به‌روزرسانی: 2026-06-29

## هدف

این سند صف کنترل انسانی featureهای مسئله‌دار کالا را طراحی می‌کند. این مرحله فقط مستندسازی است و هیچ UI، route، database، migration، localStorage یا اتصال اجرایی به محک ایجاد نمی‌کند.

## Product Feature Review Queue چیست؟

صف بررسی، مرز کنترل بین validation و ورود feature به main است. هر feature ناشناخته، ناقص، متناقض، کم‌اطمینان یا اثرگذار بر قیمت، تولید و موجودی باید همراه با شواهد، پیشنهاد سیستم و وضعیت تصمیم در این صف نگه داشته شود تا reviewer یا مدیر درباره آن تصمیم بگیرد.

## موارد ورودی صف

| issueType | دلیل ورود به review |
|---|---|
| `unknown_feature` | feature به attributeKey استاندارد قابل mapping نیست |
| `missing_required_feature` | feature اجباری گروه یا نوع کالا موجود نیست |
| `invalid_type` | مقدار با attributeType تعریف‌شده سازگار نیست |
| `unit_mismatch` | واحد ناشناخته، ناسازگار یا تبدیل آن پرریسک است |
| `suspicious_weight` | وزن خارج از محدوده منطقی یا ناسازگار با کالا است |
| `duplicate_barcode` | بارکد با کالای دیگری تعارض یا احتمال تکرار دارد |
| `stone_mismatch` | نوع یا نام سنگ با مرجع مفهومی سنگ سازگار نیست |
| `product_group_mismatch` | گروه کالا با منبع، ویژگی‌ها یا محصول موجود تعارض دارد |
| `pricing_impact_conflict` | feature اثرگذار بر قیمت دارای conflict است |
| `production_impact_conflict` | feature اثرگذار بر تولید یا فرمول دارای conflict است |
| `low_confidence` | شواهد برای تصمیم خودکار کافی نیست |
| `manual_only_mapping` | mapping طبق policy فقط با تصمیم انسانی مجاز است |

## مدل مفهومی Review Queue Item

| فیلد | نقش |
|---|---|
| `queueItemId` | شناسه یکتای آیتم صف |
| `productId` | ارجاع مفهومی به کالا، در صورت وجود |
| `productCode` | کد کالا برای ردیابی |
| `productName` | نام نمایشی کالا |
| `featureKey` | کلید feature مسئله‌دار |
| `issueType` | نوع مسئله |
| `severity` | شدت اثر یا ریسک |
| `rawValue` | مقدار خام دریافت‌شده |
| `normalizedValue` | مقدار normalize شده پیشنهادی |
| `validationResult` | نتیجه validation مرتبط |
| `confidenceLevel` | سطح اطمینان تصمیم یا mapping |
| `riskFlags` | پرچم‌های ریسک قیمت، تولید، موجودی، duplicate یا AI |
| `sourceModule` | منبع داده یا ماژول تولیدکننده |
| `suggestedAction` | اقدام پیشنهادی rule یا AI |
| `reviewer` | reviewer مسئول یا تصمیم‌گیر |
| `decisionStatus` | وضعیت تصمیم صف |
| `decisionReason` | دلیل تصمیم انسانی |
| `auditReference` | ارجاع audit برای منبع، تغییر و تصمیم |
| `createdAt` | زمان ایجاد آیتم |
| `updatedAt` | زمان آخرین تغییر |

## تصمیم‌های reviewer

- `approve`: پذیرش feature پس از کنترل شواهد.
- `reject`: رد feature یا mapping نامعتبر.
- `request_correction`: درخواست اصلاح از منبع یا importer.
- `accept_auto_fix`: پذیرش اصلاح پیشنهادی کم‌ریسک.
- `edit_normalized_value`: اصلاح کنترل‌شده مقدار normalize شده با ثبت قبل/بعد.
- `map_feature_manually`: mapping دستی به attributeKey معتبر.
- `mark_duplicate`: ثبت به عنوان duplicate و جلوگیری از ورود مستقل.
- `block_import`: مسدود کردن ورود کالا یا feature.
- `escalate_to_manager`: ارجاع تصمیم حساس به مدیر.

## چرخه پیشنهادی صف

1. validation یا mapping مسئله را تشخیص می‌دهد.
2. آیتم همراه با rawValue، normalizedValue، confidence و riskFlags ساخته می‌شود.
3. سیستم اقدام پیشنهادی را بدون اعمال قطعی نمایش می‌دهد.
4. reviewer شواهد و اثر feature را بررسی می‌کند.
5. تصمیم و دلیل ثبت می‌شود؛ موارد حساس به مدیر escalate می‌شوند.
6. نتیجه به import decision و audit trail متصل می‌شود.

## قوانین ایمنی

- feature حساس بدون review وارد main نشود.
- `low_confidence` و `conflict` هیچ‌وقت auto approve نشوند.
- feature اثرگذار بر قیمت، تولید یا موجودی با conflict باید به مدیر escalate شود.
- تصمیم reviewer باید actor، timestamp، reason و auditReference داشته باشد.
- تغییر rawValue مجاز نیست؛ اصلاح فقط به صورت normalizedValue جدید و با ثبت قبل/بعد انجام شود.
- صف بررسی نباید داده اصلی را مستقیم mutate کند؛ فقط تصمیم قابل audit تولید می‌کند.

## خروجی‌های آینده

- `ProductFeatureReviewItem`
- `ProductFeatureReviewDecision`
- `ProductFeatureCorrectionLog`
- `ProductFeatureReviewAuditTrail`

## محدودیت فعلی

این سند فقط قرارداد مفهومی است. صف اجرایی، UI، role/auth، database، migration، route، localStorage key یا اتصال مستقیم به داده محک ساخته نشده است.
