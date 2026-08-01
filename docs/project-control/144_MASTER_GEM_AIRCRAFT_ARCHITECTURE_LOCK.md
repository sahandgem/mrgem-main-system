# Master Gem Aircraft Architecture Lock

تاریخ ثبت: `2026-06-30`

## 1. Architecture Decision

| مورد | تصمیم قفل‌شده |
|---|---|
| Phase | `P52` |
| هدف مادر | ساخت «سیستم‌عامل مدیریتی مسترجم» به‌عنوان یک هواپیمای کامل |
| جایگاه cockpit | کابین نمایش و فرمان؛ نه کل سیستم و نه هدف نهایی مستقل |
| نوع این فاز | documentation/design lock؛ بدون ساخت |
| Cockpit implementation | `NOT_APPROVED` |
| Subproject merge | `NOT_APPROVED` |
| Main | روی `b16b1a0` قفل |

Cockpit فقط پس از شکل‌گیری موتور، سوخت، قطعات، سنسورها و قراردادهای داده می‌تواند نمای قابل اعتماد کل سیستم باشد. بنابراین implementation واقعی cockpit تا پیش از قفل‌شدن مرز ماژول‌ها، data contractها، audit و review boundary نباید آغاز شود. P52 طراحی مادر را قفل می‌کند و مجوز build نیست.

## 2. Aircraft Metaphor Map

| قطعه هواپیما | معادل در Master Gem OS | مسئولیت معماری |
|---|---|---|
| بدنه و اسکلت | Master Gem OS Core | shell، قراردادهای مرکزی، navigation، مرز ماژول‌ها و قواعد یکپارچگی |
| اولین موتور واقعی | Workforce | عملیات نیروها، زمان، مکان، تحلیل، هشدار و تصمیم‌های کاری |
| موتور تولید | Production | فرمول ساخت، نیاز مواد، جریان تولید، هزینه و ریسک تولید |
| سوخت | Finance | نقدینگی، دریافت/پرداخت، فشار مالی، اقساط و تایید مالی |
| مخزن قطعات | Product + Inventory | کالا، barcode، سنگ، گروه، موجودی، حرکت و کمبود |
| رادار بازار | Sales + Customer Response | فروش، تقاضا، پاسخ مشتری و سیگنال بازار |
| جعبه سیاه | Audit + Backup + History + Signoff + Drift | ردیابی تصمیم، snapshot، بازگشت‌پذیری، baseline و تغییرات |
| کمک‌خلبان | AI Suggestions + Review Queue | تحلیل، پیشنهاد، confidence و هدایت موارد حساس به انسان |
| کابین خلبان | Cockpit Overview + Drill-downs | خلاصه مدیریتی، هشدار، drill-down و نقطه ورود به تصمیم |
| سنسورها و ورودی‌ها | Excel، Mahak، Bank، Photos و External Imports | دریافت داده خام از طریق staging، validation و import gate |

قانون اتصال: هیچ قطعه‌ای با نمایش ظاهری جایگزین موتور یا قرارداد داده نمی‌شود. Cockpit باید مصرف‌کننده خروجی‌های معتبر ماژول‌ها باشد، نه سازنده منطق پنهان آن‌ها.

## 3. Current Module Status

| قطعه | status | current location/source | current readiness | ریسک اصلی | should merge now? | next safe action |
|---|---|---|---|---|---|---|
| Workforce | `real_core_exists` | `src/analysis`، `src/services`، `src/models/workforce.ts` و صفحات WF | موتور واقعی فعال با تحلیل، queue، report و عملیات | بدهی معماری `WorkforcePages.tsx` و coupling | `NO`؛ داخل core است و merge موضوعیت ندارد | refactor کوچک، تست‌پذیر و قابل rollback |
| Cockpit Overview | `prototype_exists` | `prototypes/cockpit-overview/` | mock-only، بازبینی‌شده و frozen | واقعی جلوه‌دادن mock یا اتصال زودهنگام | `NO` | حفظ freeze؛ فقط plan مستقل آینده |
| Manager Review Queue | `prototype_exists` | `prototypes/cockpit-manager-review-queue/` | P48 PASS، P49 approved، P50 frozen | ناهماهنگی action/audit با queue واقعی | `NO` | در آینده mapping contract؛ بدون action واقعی |
| Product/Mahak | `subproject_only` | `mahak-web-version` / `DATA-MAHAK` و اسناد Product | مدل‌ها و boundaryهای مفهومی ثبت شده؛ core اجرایی ندارد | duplicate، ناسازگاری schema و وابستگی به سیستم قدیمی | `NO` | analysis/design مستقل برای data contract و adapter |
| Finance/Audit App | `subproject_only` | `audit-app` / `FIN-AUDIT` و اسناد Financial | schema و flow مفهومی؛ خارج core | auth، RLS، database و approval ناسازگار | `NO` | data contract مستقل و read model پیشنهادی |
| Production | `docs_only` | roadmap، document/event و feature boundary docs | وابسته به Product و Inventory | ساخت فرمول روی master data ناپایدار | `NO` | پس از Core Product/Inventory contract، design phase مستقل |
| Inventory | `docs_only` | roadmap و Product/Inventory concepts | مدل اجرایی و producer معتبر ندارد | موجودی غیرقابل reconcile | `NO` | Core Inventory Model و movement contract در فاز docs |
| Sales | `missing` | فقط هدف کلی در نقشه cockpit | data model و boundary مشخص ندارد | KPI گمراه‌کننده و coupling مالی/کالا | `NO` | discovery و domain contract مستقل در آینده |
| AI Suggestions | `real_core_exists` | recommendation/analyzerهای Workforce؛ اسناد cross-module AI | واقعی برای WF، docs-only برای کل سیستم | پیشنهاد بدون confidence/source یا تبدیل به تصمیم خودکار | `NO` | حفظ suggestion-only؛ قرارداد چندماژولی پس از data contracts |
| Audit/History/Backup | `real_core_exists` | سرویس‌های backup، history، signoff، drift و صفحات system | جعبه سیاه Workforce فعال | پراکندگی storage و نبود audit مرکزی چندماژولی | `NO` | تثبیت و refactor بدون تغییر رفتار |
| Master Control Docs | `real_core_exists` | `docs/project-control/` | منبع تصمیم، gate، handoff و stop rules | drift مستندات یا دورزدن approval | `NO`؛ مرجع کنترل است | sync مستمر پس از هر فاز تاییدشده |

## 4. Subproject Policy

1. Product/Mahak فعلاً subproject است و مستقیم وارد core نمی‌شود.
2. Finance/Audit App فعلاً subproject است و مستقیم وارد core نمی‌شود.
3. استفاده آینده فقط از طریق data contract، adapter/integration plan، staging، validation و approval مستقل مجاز است.
4. merge مستقیم، کپی schema اجرایی یا انتقال auth/database/RLS بدون approval ممنوع است.
5. هر data extraction ابتدا به analysis/design phase مستقل، provenance، quality check و rollback boundary نیاز دارد.
6. وجود ایده یا prototype در subproject به معنی آمادگی production نیست.

## 5. Cockpit Policy

- Cockpit مصرف‌کننده read model و signalهای ماژول‌هاست؛ business logic مادر نباید داخل آن پنهان شود.
- Cockpit نباید زودتر از data contractهای producerها واقعی شود.
- اگر implementation آینده تایید شود، اولین slice باید read-only و Workforce-only باشد.
- Cockpit نباید تصمیم واقعی مدیر را بدون review queue، reason، actor و audit trail ثبت کند.
- AI در cockpit پیشنهاد می‌دهد؛ اقدام حساس نیازمند تصمیم انسانی و approval boundary است.
- هر دو prototype فعلی mock-only و frozen باقی می‌مانند و مستقیم به production import نمی‌شوند.
- approval طراحی، prototype، implementation و merge چهار gate جدا هستند.

## 6. Build Order Decision

| گزینه | benefit | risk | dependency | why now / why later |
|---|---|---|---|---|
| A. ادامه refactor Workforce | کاهش بدهی تنها موتور واقعی، مرزهای روشن‌تر و آمادگی بهتر برای read adapter آینده | regression در صورت extraction بزرگ یا تغییر همزمان رفتار | تست و build، route registry، extraction کوچک، rollback | **اکنون:** بیشترین ارزش پایداری با کمترین گسترش دامنه |
| B. طراحی Production module | روشن‌شدن موتور دوم و جریان ساخت | طراحی زودهنگام بر پایه محصول/موجودی ناپایدار | Core Product Model، Core Inventory Model، production event contract | **بعداً:** ابتدا قرارداد کالا و موجودی قفل شود |
| C. طراحی Finance data contract | تعریف سوخت سیستم و مسیر pressure signals | ورود ناخواسته auth/database/RLS زیرپروژه یا مدل ناقص | Core Financial Event، approval/audit/read model boundary | **پس از matrix:** فقط docs و بدون merge قابل بررسی است |
| D. طراحی Product/Inventory data contract | پایه مشترک کالا، تولید، انبار، فروش و محک | دامنه بزرگ و خطر گره‌زدن core به Mahak | Core Product Model، identity/barcode، movement و staging rules | **پس از matrix:** اولویت معماری بالاتر از Production دارد |
| E. اجرای Cockpit read-only Workforce slice | نمایش سریع ارزش داده واقعی Workforce | تثبیت پوسته پیش از قرارداد مادر و افزایش بدهی UI | read contract، freshness، file boundary، route/test/rollback approval | **بعداً:** فقط پس از plan و approval مستقل |

### توصیه P52

اجرای هیچ گزینه‌ای در P52 مجاز نیست. توصیه برای تصمیم بعدی این است که P53 یک matrix رسمی بسازد و با وزن‌دهی به پایداری، وابستگی، ارزش، rollback و ریسک، ترتیب را قفل کند. جهت پیشنهادی اولیه:

1. A: ادامه refactor کنترل‌شده Workforce.
2. D: طراحی docs-only قرارداد Product/Inventory.
3. C: تکمیل docs-only قرارداد Finance.
4. B: طراحی Production پس از قفل Product/Inventory.
5. E: برنامه implementation cockpit پس از آماده‌شدن read contractها.

این ترتیب provisional است و فقط P53 حق قفل‌کردن اولویت نهایی را دارد.

## 7. Recommended Next Phase

`P53 — Master Gem Module Build Priority Matrix`

P53 فقط فاز تصمیم و مستندسازی باشد. خروجی آن باید معیار وزن‌دهی، dependency graph، sequence، approval gate و stop condition هر ماژول را تعیین کند. در P53 هیچ implementation، route، storage، database، prototype change یا merge مجاز نباشد.

## 8. Do Not Touch Rules

- `main` روی `b16b1a0` قفل است.
- هیچ merge انجام نشود.
- هیچ implementation اجرایی ساخته نشود.
- `src/`، routeها و packageها تغییر نکنند.
- هیچ storage key، localStorage یا sessionStorage جدید ساخته نشود.
- database، auth، API و backend تغییر یا ایجاد نشوند.
- داده واقعی وارد prototypeها نشود.
- زیرپروژه Finance یا Product مستقیم merge نشود.
- prototypeهای frozen بدون approval مستقل تغییر نکنند.
- cockpit implementation بدون plan و approval جدا آغاز نشود.

## Lock Result

`MASTER_GEM_AIRCRAFT_ARCHITECTURE = LOCKED_FOR_DECISION`

این lock، معماری مفهومی و ترتیب تصمیم‌گیری را تثبیت می‌کند؛ مجوز build، integration، migration یا merge نیست.
