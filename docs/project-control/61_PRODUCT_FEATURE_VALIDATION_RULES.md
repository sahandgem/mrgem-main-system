# Product Feature Validation Rules

آخرین به‌روزرسانی: 2026-06-29

## هدف

این سند قوانین اعتبارسنجی featureهای کالا را برای مستر جم طراحی می‌کند. این مرحله فقط مستندسازی است و هیچ کد اجرایی، route، UI، database، migration، localStorage یا اتصال مستقیم به محک ایجاد نمی‌کند.

## Product Feature Validation Rules چیست؟

Product Feature Validation Rules مجموعه قانون‌هایی است که مشخص می‌کند هر feature کالا قبل از ورود به main، استفاده در گزارش، استفاده در duplicate detection، اثرگذاری روی قیمت یا تولید، و ورود به AI snapshot باید چه کنترل‌هایی را بگذراند.

feature فقط یک مقدار نیست. هر feature باید type، unit، source، confidence، risk و ارتباطش با قیمت، تولید، موجودی و AI مشخص باشد.

## چرا featureها باید جداگانه validation داشته باشند؟

کالاهای مستر جم featureهای متنوعی دارند. یک خطای کوچک در feature می‌تواند باعث قیمت اشتباه، duplicate اشتباه، خروجی اشتباه برای محک، خطای تولید یا تحلیل AI گمراه‌کننده شود.

اعتبارسنجی جداگانه لازم است چون:

- `weight`، `barcode`، `stoneName` و `formulaReference` ریسک‌های متفاوت دارند.
- بعضی featureها روی قیمت اثر مستقیم دارند.
- بعضی featureها روی تولید و مواد اولیه اثر دارند.
- بعضی featureها برای duplicate detector حساس هستند.
- featureهای low confidence نباید وارد تصمیم‌های حساس شوند.

## نوع قوانین

| نوع قانون | توضیح |
|---|---|
| `required rule` | feature برای گروه یا نوع کالا ضروری است یا نه |
| `type rule` | مقدار feature با attributeType سازگار است یا نه |
| `unit rule` | واحد مقدار مثل وزن یا پول درست و قابل تبدیل است یا نه |
| `range rule` | مقدار عددی در بازه قابل قبول است یا نه |
| `enum rule` | مقدار feature در فهرست مجاز قرار دارد یا نه |
| `reference rule` | ارجاع feature به master data معتبر است یا نه |
| `duplicate-sensitive rule` | feature در تشخیص کالای تکراری حساس است یا نه |
| `pricing-impact rule` | feature روی قیمت اثر دارد و نیازمند validation قوی‌تر است یا نه |
| `production-impact rule` | feature روی تولید یا فرمول اثر دارد یا نه |
| `inventory-impact rule` | feature روی موجودی یا آمادگی انبار اثر دارد یا نه |
| `AI-risk rule` | feature برای AI snapshot ریسک گمراه‌کنندگی دارد یا نه |

## مثال validation برای featureها

| feature | کنترل‌های پیشنهادی |
|---|---|
| `stoneType` | enum/reference به بانک سنگ، تشخیص مقدار ناشناخته، نیاز به review در conflict |
| `stoneName` | تطبیق با بانک سنگ، کنترل نوشتار مشابه، warning برای مقدار مبهم |
| `weight` | number/weight، مثبت بودن، range منطقی، unit معتبر، warning برای مقدار مشکوک |
| `weightUnit` | enum واحد مجاز و قابلیت تبدیل |
| `wageAmount` | money/number، معتبر بودن، warning برای مقدار غیرعادی |
| `basePrice` | money، مثبت بودن، source مشخص، نیاز به review برای اختلاف شدید |
| `salePrice` | money، مقایسه با basePrice و margin، warning یا review برای تناقض |
| `barcode` | format معتبر، یکتا بودن، duplicate-sensitive، block برای تکرار قطعی |
| `mahakReference` | فقط reference تاریخی از staging، بدون وابستگی schema، نیازمند audit |
| `formulaReference` | reference مفهومی، production-impact، بدون اجرای فرمول در این فاز |
| `productGroup` | reference به ProductGroup، required برای import، mismatch نیازمند review |
| `inventoryStatus` | enum مجاز، inventory-impact، warning برای وضعیت ناسازگار |

## خروجی validation

| خروجی | معنی |
|---|---|
| `valid` | feature معتبر است و می‌تواند در مسیرهای مجاز استفاده شود |
| `warning` | feature قابل استفاده محدود است اما باید در گزارش ریسک دیده شود |
| `needs_review` | feature باید توسط reviewer یا مدیر بررسی شود |
| `blocked` | feature نباید وارد main یا تصمیم حساس شود |
| `auto_fix_suggested` | سیستم می‌تواند اصلاح پیشنهادی بدهد، اما اعمال آن طبق مرز review انجام می‌شود |

## قوانین تصمیم

- feature با low confidence یا conflict مستقیم وارد main نشود.
- feature موثر روی قیمت یا تولید بدون validation وارد نشود.
- feature مشکوک باید review شود.
- feature تکراری یا duplicate-sensitive باید قبل از import با Duplicate Detector بررسی شود.
- feature دارای source نامشخص نباید وارد AI snapshot نهایی شود.
- auto-fix فقط پیشنهاد است، نه تغییر قطعی بدون audit و approval لازم.
- داده محک فقط پس از staging، normalize، validation و mapping مفهومی قابل استفاده است.

## خروجی‌های آینده

- `ProductFeatureValidationRule`
- `ProductFeatureValidationResult`
- `ProductAttributeValidationReport`
- `ProductFeatureRiskWarning`
- `ProductFeatureAutoFixSuggestion`
- `ProductFeatureValidationAudit`

## محدودیت فعلی

این سند rule engine اجرایی نمی‌سازد. هیچ import واقعی، database، migration، UI، route، localStorage key یا وابستگی به schema محک ایجاد نمی‌شود.
