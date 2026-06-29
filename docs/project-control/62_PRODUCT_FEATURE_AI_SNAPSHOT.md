# Product Feature AI Snapshot

آخرین به‌روزرسانی: 2026-06-29

## هدف

این سند مشخص می‌کند AI در آینده از featureهای کالا چه snapshot کنترل‌شده‌ای ببیند. این snapshot فقط از داده normalize و validate شده ساخته می‌شود و نباید داده اصلی را تغییر دهد.

## Product Feature AI Snapshot چیست؟

Product Feature AI Snapshot خلاصه‌ای نسخه‌دار، قابل audit و قابل تحلیل از featureهای مهم یک کالا است. هدف آن این است که AI برای تحلیل کیفیت داده، duplicate، قیمت، تولید، import و cockpit از داده خام یا نامطمئن استفاده نکند.

## AI از featureها چه چیزی باید ببیند؟

AI باید تصویر خلاصه و کنترل‌شده‌ای از وضعیت کالا داشته باشد، نه تمام داده خام. این تصویر باید نشان دهد:

- featureهای اصلی کالا چیستند.
- کدام featureها ناقص یا مشکوک‌اند.
- چه warningهایی وجود دارد.
- duplicate signalها چیستند.
- featureهای اثرگذار روی قیمت و تولید کدام‌اند.
- source و confidence هر بخش چیست.
- آیا داده برای import یا گزارش آماده است یا نیاز به review دارد.

## ساختار snapshot پیشنهادی

| فیلد | توضیح |
|---|---|
| `productId` | شناسه کالا |
| `productCode` | کد داخلی یا مفهومی کالا |
| `productName` | نام کالا |
| `featureSummary` | خلاصه featureهای تاییدشده و قابل تحلیل |
| `requiredFeatureStatus` | وضعیت کامل بودن featureهای ضروری |
| `missingFeatures` | featureهای ضروری که وجود ندارند |
| `validationWarnings` | warningهای validation |
| `duplicateSignals` | نشانه‌های تکراری بودن یا شباهت مشکوک |
| `pricingImpactFeatures` | featureهای اثرگذار روی قیمت |
| `productionImpactFeatures` | featureهای اثرگذار روی تولید |
| `inventoryImpactFeatures` | featureهای اثرگذار روی موجودی |
| `confidenceSummary` | خلاصه سطح اطمینان داده |
| `riskFlags` | ریسک‌های مهم مثل conflict، low confidence یا missing source |
| `sourceReferences` | ارجاع به sourceهای staging، import، manual یا master data |
| `auditReference` | ارجاع به audit snapshot یا تغییرات مرتبط |
| `generatedAt` | زمان تولید snapshot |
| `version` | نسخه قرارداد snapshot |

## استفاده‌های آینده

| استفاده | توضیح |
|---|---|
| تحلیل کیفیت داده کالا | تشخیص کالاهای ناقص، ناسازگار یا پرریسک |
| تشخیص duplicate | کمک به duplicate detector با featureهای normalize شده |
| پیشنهاد اصلاح feature | پیشنهاد auto-fix candidate برای مقدارهای قابل اصلاح |
| هشدار قیمت‌گذاری | تشخیص featureهای اثرگذار روی قیمت و conflictها |
| هشدار تولید | تشخیص featureهای اثرگذار روی فرمول، مواد و ریسک تولید |
| آماده‌سازی import | بررسی اینکه کالا آماده ورود تاییدشده هست یا نه |
| گزارش کابین خلبانی | تولید هشدار و summary برای cockpit |

## قوانین

- AI Snapshot فقط از داده normalize و validate شده ساخته شود.
- snapshot نباید مستقیماً داده main را تغییر دهد.
- پیشنهاد AI بدون review نباید تغییر حساس ایجاد کند.
- snapshot باید version، generatedAt، confidenceSummary و auditReference داشته باشد.
- featureهای blocked، conflict یا low confidence فقط با risk flag وارد snapshot شوند، نه به عنوان حقیقت قطعی.
- snapshot باید sourceReferences داشته باشد تا تحلیل قابل ردیابی بماند.
- داده تاریخی محک فقط از مسیر staging و validation در snapshot منعکس شود.

## خروجی‌های آینده

- `ProductFeatureAISnapshot`
- `ProductFeatureAISummary`
- `ProductFeatureConfidenceSummary`
- `ProductFeatureDuplicateSignal`
- `ProductFeatureRiskFlag`
- `ProductFeatureSnapshotAuditReference`

## محدودیت فعلی

این سند هیچ AI pipeline اجرایی، UI، database، route، migration یا localStorage key نمی‌سازد.
