# Product Feature Engine

آخرین به‌روزرسانی: 2026-06-29

## هدف

این سند موتور ویژگی‌های کالا را برای مستر جم به صورت مفهومی طراحی می‌کند. این مرحله فقط مستندسازی است و هیچ کد اجرایی، route، UI، database، migration، localStorage یا اتصال مستقیم به پروژه کالا/محک ایجاد نمی‌کند.

## Product Feature Engine چیست؟

Product Feature Engine لایه‌ای مفهومی برای نگه‌داری، اعتبارسنجی، جست‌وجو، گزارش‌گیری و آماده‌سازی ویژگی‌های قابل توسعه کالا است. هدف آن این است که کالاهای مستر جم فقط به چند field ثابت محدود نشوند و بتوانند بر اساس گروه، جنس، سنگ، تولید، قیمت، موجودی و نیازهای آینده attributeهای متفاوت داشته باشند.

این موتور باید در آینده بتواند مشخص کند هر ویژگی:

- برای کدام نوع یا گروه کالا معتبر است.
- required یا optional است.
- searchable یا reportable است.
- چه نوع validation لازم دارد.
- از کدام منبع داده آمده است.
- confidence و risk آن چقدر است.
- چطور وارد AI-ready snapshot می‌شود.

## چرا کالاهای مستر جم به موتور ویژگی نیاز دارند؟

کالاهای مستر جم فقط یک نام و قیمت ساده نیستند. یک کالا می‌تواند سنگ، وزن، نوع فلز، اجرت، فرمول تولید، وضعیت انبار، بارکد، مرجع تاریخی محک، گروه کالا و ویژگی‌های ظاهری یا سفارشی داشته باشد.

مدل ثابت برای همه کالاها باعث می‌شود:

- بعضی گروه‌ها fieldهای بی‌استفاده داشته باشند.
- بعضی ویژگی‌های مهم کالاها جایی برای ثبت نداشته باشند.
- import از منابع مختلف سخت و شکننده شود.
- duplicate detector و AI snapshot داده کافی نداشته باشند.
- تغییرات آینده نیازمند migration زودهنگام شود.

Product Feature Engine این ریسک را کم می‌کند، چون featureها را به عنوان قرارداد قابل توسعه و قابل اعتبارسنجی نگاه می‌کند.

## تفاوت feature با field ثابت

| مفهوم | توضیح |
|---|---|
| field ثابت | بخشی از مدل اصلی کالا است و برای همه کالاها تقریباً همیشه وجود دارد؛ مثل `id`، `name`، `productCode` یا `isActive`. |
| feature | ویژگی قابل توسعه و دامنه‌ای است که ممکن است فقط برای بعضی کالاها یا گروه‌ها معنا داشته باشد؛ مثل `stoneQuality`، `wageType` یا `formulaReference`. |
| attribute | نمونه ثبت‌شده یک feature برای یک کالا است؛ مثلاً مقدار `stoneName` برای یک محصول مشخص. |

## featureهای نمونه

این نام‌ها قرارداد اجرایی database نیستند؛ فقط نام‌های مفهومی مستقل از محک برای طراحی آینده هستند:

| feature | نقش |
|---|---|
| `stoneType` | نوع کلی سنگ یا دسته سنگ |
| `stoneName` | نام سنگ |
| `stoneColor` | رنگ سنگ |
| `stoneQuality` | کیفیت یا grade سنگ |
| `metalType` | نوع فلز یا متریال اصلی |
| `weight` | وزن کالا یا جزء مهم کالا |
| `weightUnit` | واحد وزن |
| `wageType` | نوع اجرت |
| `wageAmount` | مقدار اجرت |
| `basePrice` | قیمت پایه |
| `salePrice` | قیمت فروش |
| `productGroup` | گروه کالا |
| `productionType` | نوع ساخت یا تولید |
| `formulaReference` | ارجاع مفهومی به فرمول تولید |
| `inventoryStatus` | وضعیت موجودی |
| `barcode` | شناسه قابل اسکن |
| `mahakReference` | مرجع تاریخی یا تطبیقی از داده staging شده، بدون وابستگی به schema محک |
| `customTag` | برچسب قابل توسعه برای نیازهای آینده |

## قابلیت‌های مورد انتظار

| قابلیت | توضیح |
|---|---|
| ویژگی قابل توسعه | امکان افزودن feature جدید بدون تغییر فوری مدل اصلی یا migration زودهنگام |
| ویژگی مخصوص گروه کالا | تعریف featureهای لازم یا مجاز برای هر گروه کالا |
| validation rule برای هر feature | کنترل نوع داده، بازه، مقدار مجاز، required بودن و conflict |
| required/optional feature | مشخص کردن اینکه یک feature برای import یا تایید لازم است یا نه |
| searchable/reportable feature | مشخص کردن featureهایی که وارد جست‌وجو و گزارش می‌شوند |
| AI-ready feature summary | تولید خلاصه تمیز و قابل تحلیل برای AI snapshot |
| import mapping from staging | تبدیل داده خارجی staging شده به featureهای نرمال‌شده |

## ارتباط با سیستم‌های دیگر

- `Core Product Model`: featureها مدل اصلی کالا را تکمیل می‌کنند، نه جایگزین آن.
- `Product Import Validator`: هر feature باید validation و risk evaluation داشته باشد.
- `Product Duplicate Detector`: featureهایی مثل barcode، stone، weight و productGroup برای تشخیص تکراری مصرف می‌شوند.
- `Product AI Snapshot`: featureهای تاییدشده و قابل گزارش وارد snapshot می‌شوند.
- `Production`: featureهایی مثل formulaReference و productionType برای مرز تولید مهم هستند.
- `Inventory`: inventoryStatus و ویژگی‌های مرتبط با stock readiness در گزارش‌های انبار مصرف می‌شوند.
- `Mahak historical data`: فقط از مسیر staging، validation و mapping مفهومی وارد می‌شود.

## قوانین

- Feature engine مستقل از محک است.
- فقط ایده Feature Based Product Model به عنوان الگوی دامنه‌ای استفاده شده است.
- هیچ schema، naming، جدول، ستون، query یا view محک وارد قرارداد مستر جم نمی‌شود.
- داده خارجی نباید مستقیم به featureهای main تبدیل شود؛ ابتدا staging، validation، duplicate/conflict check و approval لازم است.
- feature دارای conflict، low confidence یا source مبهم نباید بدون review وارد main شود.
- featureهای حساس باید auditReference و validationStatus داشته باشند.

## خروجی‌های آینده

- `ProductFeatureDefinition`
- `ProductFeatureValidationRule`
- `ProductFeatureMappingRule`
- `ProductFeatureSummary`
- `ProductFeatureRiskWarning`
- `ProductFeatureAISnapshotSection`

## محدودیت فعلی

این سند هیچ implementation ایجاد نمی‌کند. Pricing engine، production formula، import واقعی، UI کالا و migration فقط در فازهای آینده و با تایید مرکز کنترل قابل بررسی هستند.
