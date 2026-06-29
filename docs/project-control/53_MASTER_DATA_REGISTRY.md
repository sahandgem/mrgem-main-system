# Master Data Registry

آخرین به‌روزرسانی: 2026-06-29

## هدف

این سند رجیستری داده‌های پایه مستر جم را طراحی می‌کند. داده‌های پایه باید مرکزی، مستقل، قابل audit، قابل استفاده بین ماژول‌ها و بدون وابستگی به schema محک باشند.

این سند فقط طراحی معماری است و هیچ کد اجرایی، route، UI، database، migration، auth یا localStorage ایجاد نمی‌کند.

## Master Data Registry چیست؟

`Master Data Registry` فهرست کنترل‌شده موجودیت‌های پایه‌ای است که چند ماژول به آن‌ها نیاز دارند: کالا، گروه کالا، سنگ، شخص، کارمند، حساب بانکی، ارز، واحد، انبار و مرکز هزینه.

## چرا داده‌های پایه باید مرکزی و مستقل باشند؟

- ماژول‌های مالی، کالا، تولید، انبار، موبایل و cockpit به referenceهای مشترک نیاز دارند.
- تکرار داده پایه باعث duplicate، mismatch و گزارش غلط می‌شود.
- داده تاریخی محک یا هر سیستم خارجی باید فقط پس از staging و validation وارد reference مستقل شود.
- AI-ready snapshotها باید به referenceهای پایدار و قابل audit وصل باشند.

## master dataهای اصلی

| Master Data | نقش | مصرف‌کننده‌ها | producer احتمالی | ارتباط با staging/import | ارتباط با AI-ready snapshot |
|---|---|---|---|---|---|
| Product | کالای مرکزی مستر جم | Sales، Purchase، Inventory، Production، Finance، Cockpit | Product import، manual approved entry | Product Excel/Mahak import باید staging شود | ProductAISnapshot، InventoryAISnapshot |
| ProductGroup | دسته‌بندی کالا | Product، Reporting، Cockpit | Group code import، manager setup | Group codes باید validate شوند | Product summary و dashboard grouping |
| Stone | اطلاعات سنگ | Product، Production، Inventory | Stone bank import، manager setup | Stone bank باید duplicate/mismatch check شود | ProductAISnapshot و production analysis |
| Person | شخص عمومی | Finance، Sales، Purchase، CRM | approved entry، historical import | داده خارجی باید identity review شود | Counterparty analysis |
| Customer | مشتری | Sales، Finance، CRM | CRM/Sales setup | import باید duplicate check شود | Sales/finance snapshot |
| Supplier | تامین‌کننده | Purchase، Finance، Inventory | Purchase setup | import باید validation و review داشته باشد | Purchase/finance snapshot |
| Employee | کارمند | Workforce، Payroll، Finance | HR/WF setup | external input نیازمند policy است | WorkforceAISnapshot |
| BankAccount | حساب بانکی | Finance، Bank import، Cockpit | manager/admin setup | Bank Excel باید به حساب تاییدشده map شود | FinancialAISnapshot |
| CashBox | صندوق یا محل پول نقد | Finance، Cash flow | manager setup | تغییر حساس نیازمند approval است | Liquidity snapshot |
| Currency | ارز | Finance، Pricing، Reporting | manager setup | نرخ و currency import باید review شود | Financial snapshot |
| Unit | واحد اندازه‌گیری | Product، Inventory، Production | core setup | mapping واحد باید validate شود | Product/Inventory snapshot |
| Warehouse | انبار یا محل نگه‌داری | Inventory، Production، Cockpit | inventory setup | import موجودی باید به warehouse معتبر وصل شود | InventoryAISnapshot |
| ProductionFormula | فرمول تولید | Production، Inventory، Finance | production setup | فرمول خارجی باید validation شود | ProductionAISnapshot |
| CostCenter | مرکز هزینه | Finance، Production، Payroll | manager setup | mapping هزینه باید review شود | Financial/production analysis |
| Branch | شعبه یا بخش عملیاتی | Cockpit، Finance، Inventory، Workforce | admin setup | تغییر branch حساس است | CentralCockpitAISnapshot |

## قوانین

- master data نباید از محک کپی شود.
- داده تاریخی محک فقط از staging و validation وارد شود.
- هر master data باید audit و status داشته باشد.
- master data باید source و confidence در زمان import داشته باشد.
- حذف یا merge داده پایه باید review و audit داشته باشد.
- mapping خارجی نباید هویت داخلی را تحمیل کند.

## وضعیت‌های پیشنهادی master data

- draft
- active
- inactive
- merged
- duplicate_candidate
- archived
- blocked

## محدودیت فعلی

این سند فقط registry مفهومی است. هیچ schema، migration، API، UI یا storage ساخته نمی‌شود.
