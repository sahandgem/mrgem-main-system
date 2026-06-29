# Product Variant, Pricing and Production Feature Boundary

آخرین به‌روزرسانی: 2026-06-29

## هدف

این سند مرز مفهومی variant کالا، اثر featureها روی قیمت و اثر featureها روی تولید را طراحی می‌کند. در این مرحله هیچ pricing engine، production formula engine، UI، database، migration یا import واقعی ساخته نمی‌شود.

## Product Variant چیست؟

Product Variant نسخه‌ای از یک کالا است که از نظر هویت اصلی به یک محصول پایه نزدیک است، اما در بعضی ویژگی‌های قابل کنترل تفاوت دارد؛ مثلاً وزن، سنگ، رنگ، سایز، اجرت، متریال یا وضعیت تولید.

هدف variant این است که سیستم بتواند تفاوت‌های مهم کالا را بدون ساختن مدل‌های بی‌نظم یا تکراری مدیریت کند.

## چه زمانی کالا variant است؟

یک کالا می‌تواند variant محسوب شود وقتی:

- محصول پایه، گروه کالا و کاربرد اصلی یکسان است.
- تفاوت‌ها قابل توضیح با featureهای مشخص هستند.
- تفاوت‌ها روی قیمت، تولید یا موجودی اثر دارند ولی هویت کلی محصول را کاملاً عوض نمی‌کنند.
- سیستم بتواند رابطه parent/variant را با audit و review نگه دارد.

## چه زمانی کالا مستقل است؟

کالا باید مستقل باشد وقتی:

- productGroup یا ماهیت فروش متفاوت است.
- stone، material یا ساختار تولید تفاوت بنیادین دارد.
- فرمول تولید یا هزینه تولید به شکل غیرقابل مقایسه تغییر می‌کند.
- duplicate detector یا manager review تشخیص دهد یکی کردن آن‌ها خطرناک است.
- کالا از نظر حسابداری، موجودی یا خروجی محک باید جدا ردیابی شود.

## ویژگی‌هایی که روی قیمت اثر دارند

| feature | اثر احتمالی |
|---|---|
| `weight` | اثر مستقیم بر قیمت پایه، اجرت یا قیمت فروش |
| `stone` | اثر روی ارزش کالا و ریسک قیمت‌گذاری |
| `metal` | اثر روی قیمت پایه و حساسیت به نرخ |
| `wage` | اثر روی اجرت ساخت یا فروش |
| `formula` | اثر روی محاسبه هزینه ساخت |
| `production cost` | اثر روی حداقل قیمت فروش و margin |
| `inventory status` | اثر روی تخفیف، فوریت فروش یا تامین |
| `purchase cost` | اثر روی قیمت پایه و سود |
| `sale margin` | اثر روی پیشنهاد قیمت فروش |

## ویژگی‌هایی که روی تولید اثر دارند

| feature | اثر احتمالی |
|---|---|
| `formulaReference` | اتصال مفهومی به فرمول تولید |
| `materialRequirement` | نیاز مواد اولیه |
| `productionType` | نوع ساخت، مونتاژ یا سفارش |
| `laborCost` | هزینه کار یا اجرت تولید |
| `wasteRate` | ضایعات یا پرت احتمالی |
| `productionRisk` | ریسک تولید، کمبود مواد یا حساسیت عملیات |

## مرز Pricing Boundary

- pricing engine فعلاً پیاده‌سازی نمی‌شود.
- هیچ قیمت خودکار بدون validation، source و confidence نباید پیشنهاد قطعی شود.
- featureهای قیمت‌گذار باید audit، source و riskFlags داشته باشند.
- اختلاف قیمت ناشی از feature conflict باید به review برود.
- AI می‌تواند پیشنهاد یا هشدار بدهد، اما قیمت حساس با تایید مدیر یا rule مصوب نهایی می‌شود.

## مرز Production Boundary

- production formula فعلاً پیاده‌سازی نمی‌شود.
- formulaReference فقط یک ارجاع مفهومی است.
- materialRequirement، laborCost، wasteRate و productionRisk در این مرحله فقط boundary هستند.
- هر اتصال آینده به تولید باید از Master Data، Product Attribute، Audit Trail و Approval Boundary عبور کند.

## خروجی‌های آینده

- `ProductVariantCandidate`
- `ProductPriceFeatureSummary`
- `ProductProductionFeatureSummary`
- `ProductFeatureRiskWarning`
- `ProductVariantReviewDecision`

## قوانین

- variant merge یا update خودکار ممنوع است.
- اختلاف low confidence یا conflict باید review شود.
- featureهای قیمت‌گذار و تولیدی باید auditReference داشته باشند.
- هیچ schema، naming، جدول، ستون، query یا view محک وارد این boundary نمی‌شود.
- خروجی‌های مرتبط با محک فقط پس از staging، validation، duplicate check و approval قابل بررسی هستند.

## محدودیت فعلی

این سند فقط مرز مفهومی را ثبت می‌کند. هیچ محاسبه قیمت، فرمول تولید، تغییر انبار، UI کالا، route، localStorage key یا database change ایجاد نمی‌شود.
