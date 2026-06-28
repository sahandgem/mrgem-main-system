# Cross-module Automation Map

آخرین به‌روزرسانی: 2026-06-29

## هدف

این سند نقشه جریان داده و اتوماسیون بین ماژول‌های مستر جم را ثبت می‌کند. هدف این است که هر ماژول بداند چه داده‌ای تولید می‌کند، چه داده‌ای مصرف می‌کند، کجا AI-ready snapshot می‌سازد و چه خروجی‌هایی به کابین مرکزی می‌فرستد.

این سند فقط طراحی معماری است و هیچ کد اجرایی، route، UI، database، migration، auth، repo یا localStorage ایجاد نمی‌کند.

## Cross-module Automation Map چیست؟

`Cross-module Automation Map` نقشه‌ای است برای اینکه اتوماسیون در یک ماژول، بدون اتصال شتاب‌زده و بدون merge مستقیم پروژه‌ها، بتواند به تصمیم یا هشدار در ماژول دیگر کمک کند. این نقشه به جای ساخت feature، مرز data contract، producer/consumer و snapshot را روشن می‌کند.

## جریان کلی بین ماژول‌ها

1. هر ماژول داده خام خود را دریافت می‌کند.
2. داده داخل همان مرز ماژول normalize و validate می‌شود.
3. خروجی‌ها به صورت snapshot یا event قابل audit آماده می‌شوند.
4. ماژول‌های دیگر فقط snapshot، event یا signal کنترل‌شده را مصرف می‌کنند.
5. Central Cockpit سیگنال‌های چندماژولی را به alert، recommendation و crisis signal تبدیل می‌کند.

## Producer و Consumer هر ماژول

| ماژول | داده‌ای که تولید می‌کند | داده‌ای که مصرف می‌کند | خروجی AI-ready |
|---|---|---|---|
| Finance | financial event، bank transaction، receipt match، liquidity signal، approval status | receipt، bank Excel، product cost، inventory shortage، workforce cost signal | FinancialSnapshot، LiquiditySignal، PaymentRiskSummary |
| Product | product normalized record، duplicate warning، Mahak export preview، product snapshot | product import files، stone bank، group codes، inventory status، production usage | ProductSnapshot، DuplicateRiskSummary، MahakExportPreview |
| Production | formula، material requirement، production cost estimate، waste/anomaly signal | product model، inventory availability، workforce capacity، finance cost rules | ProductionSnapshot، MaterialRequirementSignal، ProductionRiskSummary |
| Inventory | stock level، movement، shortage alert، mismatch warning | product model، production demand، sales/purchase signal، finance constraints | InventorySnapshot، StockShortageSignal، MovementAnomalySummary |
| Workforce | schedule health، capacity risk، decision queue، operational history | production demand، store coverage need، finance pressure signal | WorkforceSnapshot، OperationalRiskSignal، StaffingRecommendation |
| Mobile | receipt photo، offline queue item، document candidate، upload status | user task context، financial event candidate، attachment target | MobileCaptureSnapshot، DocumentClassificationSignal |
| Central Cockpit | management alert، decision recommendation، crisis signal، cross-module summary | snapshotها و signalهای همه ماژول‌ها | CockpitSnapshot، CrisisSignal، ManagementDecisionPack |

## مثال جریان‌های اصلی

| جریان | توضیح |
|---|---|
| receipt mobile capture -> financial event | اپ موبایل رسید را ثبت می‌کند، receipt flow آن را normalize می‌کند، finance آن را به رویداد مالی یا review وصل می‌کند. |
| bank excel import -> installment confirmation | Excel بانک normalize می‌شود، rule matcher قسط احتمالی را تشخیص می‌دهد، high confidence می‌تواند با audit تایید شود و موارد دیگر به review می‌روند. |
| product import -> inventory readiness | داده کالا پس از validator و duplicate detector به snapshot کالا تبدیل می‌شود و inventory readiness را آماده می‌کند. |
| product duplicate warning -> manager review | کالای تکراری یا merge candidate وارد صف review می‌شود و بدون تایید مدیر merge نمی‌شود. |
| production formula -> material requirement | فرمول تولید مواد لازم را پیشنهاد می‌دهد و inventory کمبود یا آمادگی را گزارش می‌کند. |
| inventory shortage -> purchase/finance alert | کمبود موجودی به هشدار خرید و فشار نقدینگی احتمالی تبدیل می‌شود. |
| workforce risk -> management alert | ریسک برنامه، ظرفیت، تمرکز یا پوشش به هشدار مدیریتی در cockpit می‌رسد. |
| finance pressure -> cockpit crisis signal | فشار نقدینگی، سررسید، پرداخت حساس یا cash-out غیرعادی به crisis signal تبدیل می‌شود. |

## مرزهای ایمنی

- ماژول‌ها نباید داده خام یکدیگر را مستقیم mutate کنند.
- snapshot و signal باید نسخه، source، validation result و confidence داشته باشند.
- AI-ready snapshot جایگزین database اصلی نیست.
- هر cross-module auto action باید از confidence scoring و safety matrix عبور کند.
- تصمیم‌های sensitive، conflict و manual only باید به manager review برسند.

## مسیر آینده

1. تعریف data contract مفهومی برای هر snapshot.
2. طراحی confidence scoring مشترک.
3. طراحی safety matrix برای auto action.
4. طراحی cross-module cockpit signal بدون اتصال اجرایی.
5. اجرای هر integration فقط در فاز مستقل و با تایید مرکز فرمان.
