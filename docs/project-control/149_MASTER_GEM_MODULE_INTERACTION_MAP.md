# Master Gem Module Interaction Map

آخرین به‌روزرسانی: 2026-06-30

## 1. Purpose

این سند نقشه تعامل ماژول‌های مستر جم است. هدف آن implementation نیست؛ هدف، مشخص‌کردن مسیر داده، کار، تصمیم و Cockpit summary بین قطعات هواپیماست.

این سند از تصمیم‌های `CORE-P01`، قرارداد داده مرکزی `CORE-P02` و قرارداد Task + Decision در `CORE-P03` پیروی می‌کند.

## 2. Operating Principle

هیچ ماژولی نباید جزیره‌ای ساخته شود. هر ماژول باید حداقل یکی از این کارها را انجام دهد:

- تولید یا مصرف data entity
- تولید یا مصرف Task
- تولید یا مصرف DecisionItem
- تولید Audit Event
- تولید Alert
- ارسال summary به Cockpit

ارتباط بین ماژول‌ها با reference، event، Task، DecisionItem و read-only snapshot انجام می‌شود؛ نه با تغییر مستقیم داده مالکیت‌شده ماژول دیگر.

## 3. Modules Included

### Project Core

* Aircraft role: مغز، قانون و مرکز تعیین مسیر هواپیما.
* Current source/status: فعال در Project Core و اسناد کنترل پروژه.
* Owns: معماری مادر، approval، اولویت، توقف‌ها و مرز فازها.
* Reads: وضعیت فازها، ریسک‌ها، گزارش verification و درخواست‌های معماری.
* Writes: تصمیم معماری، scope، approval و freeze rule.
* Produces Task: ماموریت‌های محدود و scopeدار برای workstreamها.
* Produces DecisionItem: تصمیم‌های معماری، implementation و merge.
* Sends to Cockpit: فعلاً هیچ داده عملیاتی؛ در آینده وضعیت governance خواندنی.
* Must not directly change: داده عملیاتی ماژول‌ها یا تصمیم دامنه‌ای روزمره.
* V1 interaction: تعریف قراردادها و gate شروع کار.
* Future interaction: governance مشترک ماژول‌ها و approval graph.
* Risks: تبدیل‌شدن به مالک عملیات یا صدور دستور مبهم.

### Workforce Operations Engine

* Aircraft role: موتور اجرای کار و ظرفیت نیروی انسانی.
* Current source/status: ساخته‌شده در Workforce P0-P22 و نیازمند تثبیت تدریجی.
* Owns: Employee، Task scheduling، workforce analytics، readiness و operational history.
* Reads: WorkOrder، نیاز عملیاتی، deadline، Product/Media/Payment reference و تصمیم مدیر.
* Writes: تخصیص و پیشرفت Task، workforce finding، readiness و history.
* Produces Task: کار روزانه، پیگیری، نگهداری و assignment عملیاتی.
* Produces DecisionItem: تعارض، ریسک نیرو، تاخیر حساس و نیاز تایید مدیر.
* Sends to Cockpit: سلامت نیرو، backlog، readiness، alert و progress summary.
* Must not directly change: Product، Finance، Production یا Inventory source of truth.
* V1 interaction: Task روزانه، DecisionItem و Cockpit summary خواندنی.
* Future interaction: دریافت production/sales task و feedback به capacity planning.
* Risks: تبدیل‌شدن به کل سیستم یا تعریف Task ناسازگار با Core.

### Product + Inventory Core

* Aircraft role: بدنه کالا، مواد، قطعات و وضعیت موجودی.
* Current source/status: design/subproject؛ Mahak/Product فقط منبع تحقیق است.
* Owns: در آینده Product، Material، Component و InventoryMovement.
* Reads: تولید تاییدشده، Sale، MediaAsset، purchase/payment reference و import staging.
* Writes: هویت کالای مصوب، movement موجودی و availability snapshot.
* Produces Task: پاک‌سازی داده، شمارش، عکس‌برداری، تامین و بررسی مغایرت.
* Produces DecisionItem: اصلاح موجودی، conflict کالا، duplicate و pricing review.
* Sends to Cockpit: موجودی، کمبود، conflict، import quality و ریسک کالا.
* Must not directly change: Finance transaction، Workforce schedule یا Production execution.
* V1 interaction: Product/Material reference و MediaAsset concept.
* Future interaction: import gate، inventory event و replenishment flow.
* Risks: direct merge پروژه کالا، duplicate identity و اختلاط Product با stock quantity.

### Finance + Cashflow Core

* Aircraft role: مخزن سوخت و سنجش فشار مالی.
* Current source/status: design/subproject؛ Finance/Audit فقط منبع تحقیق و contract است.
* Owns: در آینده Payment/Transaction، cashflow، approval و finance pressure.
* Reads: Sale، expense، WorkOrder cost، Employee reference، receipt و bank evidence.
* Writes: وضعیت پرداخت، reconciliation، liquidity snapshot و financial event.
* Produces Task: بررسی تراکنش، رسید، evidence و مغایرت بانکی.
* Produces DecisionItem: پرداخت حساس، رسید مبهم، cash risk و approval لازم.
* Sends to Cockpit: فشار نقدینگی، overdue، inflow/outflow و mismatch.
* Must not directly change: Product، InventoryMovement، Employee یا Sale source data.
* V1 interaction: Payment/Transaction reference به DecisionItem.
* Future interaction: bank import، receipt matching و cashflow forecasting.
* Risks: direct merge پروژه پول، auto-approval و ثبت مالی بدون audit.

### Production Engine

* Aircraft role: موتور تبدیل مواد و ظرفیت به خروجی قابل فروش.
* Current source/status: design needed؛ implementation هنوز شروع نشده است.
* Owns: در آینده Recipe/BOM، WorkOrder و production flow.
* Reads: Material/Component availability، Product target، Workforce capacity و Media evidence.
* Writes: WorkOrder state، consumption/output signal و production status.
* Produces Task: مرحله تولید، کنترل کیفیت، آماده‌سازی و رفع مانع.
* Produces DecisionItem: شروع/توقف/hold تولید، quality issue و تغییر حساس فرمول.
* Sends to Cockpit: WorkOrder، blocker، output، capacity و production risk.
* Must not directly change: Inventory quantity، Payment یا Workforce schedule.
* V1 interaction: فقط concept ارتباط WorkOrder → Task → DecisionItem.
* Future interaction: BOM execution، material reservation، cost و output events.
* Risks: automation زودهنگام، BOM بدون version و تغییر موجودی مستقیم.

### Visual Inventory + Media

* Aircraft role: چشم و حافظه تصویری کالا، رسید و عملیات.
* Current source/status: concept/design needed.
* Owns: در آینده MediaAsset، capture flow و metadata فایل.
* Reads: Product/Material/Component، Payment/Transaction، Task و capture requirement.
* Writes: MediaAsset، quality status و entity link پیشنهادی/تاییدشده.
* Produces Task: عکس‌برداری، تکمیل evidence و تکرار capture نامعتبر.
* Produces DecisionItem: تایید کیفیت، identity conflict و اتصال حساس فایل.
* Sends to Cockpit: media backlog، missing evidence و visual status.
* Must not directly change: حقیقت Product، Payment یا Inventory فقط بر اساس تصویر.
* V1 interaction: MediaAsset concept و اتصال به Task/DecisionItem.
* Future interaction: mobile capture، classification و AI-assisted matching.
* Risks: عکس بی‌مرجع، نشت داده حساس و تلقی AI extraction به‌عنوان حقیقت.

### Sales + Friday Market

* Aircraft role: موتور درآمد، کانال فروش و بازخورد بازار.
* Current source/status: design needed.
* Owns: در آینده Sale، channel state و reconciliation need.
* Reads: Product availability، price، MediaAsset و payment status.
* Writes: Sale، best-seller signal، demand و reconciliation request.
* Produces Task: آماده‌سازی کالا، پیگیری مشتری و تطبیق فروش.
* Produces DecisionItem: اختلاف پرداخت، کسری، قیمت و تامین مجدد حساس.
* Sends to Cockpit: عملکرد فروش، best-seller، mismatch و channel risk.
* Must not directly change: موجودی یا transaction مالی بدون event تاییدشده.
* V1 interaction: فقط قرارداد مفهومی Sale و signalها.
* Future interaction: Friday Market workflow، channel reconciliation و demand feedback.
* Risks: کاهش موجودی بدون movement و ثبت درآمد بدون Finance reconciliation.

### AI Review + Decision Queue

* Aircraft role: کمک‌خلبان تحلیل و صف آماده‌سازی تصمیم.
* Current source/status: concept/prototype؛ تصمیم واقعی مجاز نیست.
* Owns: suggestion، confidence، risk classification و review candidate؛ نه تصمیم نهایی.
* Reads: snapshotهای مجاز، alert، evidence و rule output.
* Writes: پیشنهاد، explanation و DecisionItem candidate.
* Produces Task: تکمیل داده یا evidence لازم برای review.
* Produces DecisionItem: low confidence، conflict، risk و پیشنهاد حساس.
* Sends to Cockpit: queue summary، confidence، risk و suggestion status.
* Must not directly change: source of truth یا تایید نهایی مدیر.
* V1 interaction: پیشنهاد و DecisionItem concept با human approval.
* Future interaction: cross-module analysis با audit و rule version.
* Risks: AI به‌عنوان source of truth، تصمیم بی‌دلیل و automation خارج از approval.

### Central Cockpit

* Aircraft role: کابین مدیریتی و سطح مشاهده/درک وضعیت کل هواپیما.
* Current source/status: prototypeهای mock-only و frozen؛ implementation تایید نشده است.
* Owns: presentation/read model composition، نه داده عملیاتی.
* Reads: summary، Task count، DecisionItem queue، alert، risk، confidence و audit status.
* Writes: در V1 هیچ داده دامنه‌ای؛ action آینده فقط از command boundary مصوب.
* Produces Task: در V1 خیر؛ future request فقط با approval جدا.
* Produces DecisionItem: در V1 خیر؛ می‌تواند future command به Decision Core بدهد.
* Sends to Cockpit: خود سطح نمایش است و source تولید نمی‌کند.
* Must not directly change: همه master/transaction data و وضعیت دامنه‌ها.
* V1 interaction: read-only summary و drill-down concept.
* Future interaction: action routing پس از approval مستقل و audit کامل.
* Risks: ویترین بدون موتور، mutate مستقیم و نمایش عدد بدون source/audit.

### Audit/Backup/History

* Aircraft role: جعبه سیاه، حافظه و مسیر برگشت هواپیما.
* Current source/status: بخشی در Workforce ساخته شده؛ معماری مرکزی آینده لازم است.
* Owns: traceability، audit reference، snapshot، retention و rollback evidence.
* Reads: تغییر مهم، تصمیم، import، approval، rejection و rollback result.
* Writes: audit event، immutable change summary و readiness signal.
* Produces Task: رفع audit gap، backup verification و retention review.
* Produces DecisionItem: rollback حساس، retention exception و audit conflict.
* Sends to Cockpit: system confidence، rollback readiness و audit gap.
* Must not directly change: داده اصلی به نام audit؛ rollback باید command مصوب باشد.
* V1 interaction: Audit Event concept برای Task و DecisionItem.
* Future interaction: cross-module history، restore gate و compliance read model.
* Risks: audit قابل بازنویسی، snapshot ناقص و rollback بدون approval.

## 4. Module Ownership Rules

### Project Core

- مالک مسیر، قوانین، approval و ترتیب ساخت است.
- مالک داده عملیاتی نیست.

### Workforce Operations Engine

- فعلاً مالک Employee، Task scheduling، workforce analytics، readiness و operational history است.
- نباید Product/Finance/Production source of truth شود.

### Product + Inventory Core

- در آینده مالک Product، Material، Component و InventoryMovement خواهد بود.
- فعلاً Mahak/Product subproject فقط منبع تحقیق/data extraction است.
- direct merge ممنوع است.

### Finance + Cashflow Core

- در آینده مالک Payment/Transaction، cashflow و finance pressure خواهد بود.
- فعلاً Finance/Audit subproject فقط منبع تحقیق/data contract است.
- direct merge ممنوع است.

### Production Engine

- در آینده مالک Recipe/BOM، WorkOrder و production flow خواهد بود.
- فعلاً فقط design needed است.

### Visual Inventory + Media

- در آینده مالک MediaAsset و capture flow خواهد بود.
- باید به Product، Material، Component، Payment/Transaction و DecisionItem وصل شود.

### Sales + Friday Market

- در آینده مالک Sale و کانال‌های فروش خواهد بود.
- باید به Product، Payment/Transaction، InventoryMovement و Finance وصل شود.

### AI Review + Decision Queue

- مالک تصمیم نهایی نیست.
- فقط پیشنهاد، confidence، risk و review candidate تولید می‌کند.
- باید DecisionItem بسازد یا تغذیه کند.

### Central Cockpit

- مالک داده نیست.
- read-only summary و drill-down surface است.
- action واقعی بعداً approval جدا می‌خواهد.

### Audit/Backup/History

- مالک traceability است.
- هر تصمیم، تغییر مهم، import، approval، rejection و rollback باید قابل ردیابی باشد.

## 5. Interaction Matrix

| From Module | To Module | Data / Signal | Creates Task? | Creates DecisionItem? | Cockpit Visible? | Audit Required? | Notes |
|---|---|---|---|---|---|---|---|
| Workforce | Central Cockpit | workforce health، task backlog، readiness، alerts | Yes | When needed | Yes | Yes | فقط summary/read-only |
| Workforce | Audit/Backup/History | operational history، signoff، baseline، retention | Audit task | Exception | Through confidence | Yes | history مالک عملیات نیست |
| Product + Inventory | Production | materials، components، product availability | Supply/check | Shortage conflict | Yes | Yes | reference/snapshot، نه mutate |
| Production | Product + Inventory | consumption، produced components/products، inventory movement request | Yes | On conflict | Yes | Yes | Inventory movement را owner ثبت می‌کند |
| Production | Workforce | production tasks and assigned steps | Yes | On capacity conflict | Yes | Yes | Workforce assignment را مالک است |
| Production | Decision Queue | approve production، stop/hold، quality issue | May create follow-up | Yes | Yes | Yes | تصمیم حساس human-approved |
| Product + Inventory | Visual Inventory + Media | photo needs، item identity، location | Yes | If identity conflict | Yes | Yes | Product reference پایدار |
| Visual Inventory + Media | Product + Inventory | photos، evidence، media links، visual status | Recapture task | Quality/identity | Yes | Yes | تصویر حقیقت کالا را مستقیم تغییر نمی‌دهد |
| Sales + Friday Market | Finance | sales income، payment method، reconciliation needs | Reconciliation | On mismatch | Yes | Yes | Sale و payment دو حقیقت مرتبط‌اند |
| Finance | Decision Queue | unusual payment، missing receipt، cash risk، approval required | Evidence task | Yes | Yes | Yes | auto-approval ممنوع |
| Sales + Friday Market | Product + Inventory | stock reduction، best-sellers، replenishment signals | Replenishment | Sensitive shortage | Yes | Yes | کاهش stock با movement تاییدشده |
| Product + Inventory | Decision Queue | inventory adjustment، product conflict، pricing review | Cleanup/check | Yes | Yes | Yes | merge/adjustment نیازمند review |
| Finance | Central Cockpit | cash pressure، overdue payment، daily inflow/outflow | Follow-up | Critical risk | Yes | Yes | read model زمان‌دار |
| Production | Central Cockpit | work orders، blocked production، output، capacity | Follow-up | Block/quality | Yes | Yes | summary با source reference |
| Sales + Friday Market | Central Cockpit | sales performance، best-sellers، payment mismatch | Follow-up | Mismatch | Yes | Yes | بدون ثبت درآمد مستقیم در Cockpit |
| AI Review | Decision Queue | low confidence، suggested action، risk classification | Data completion | Yes | Yes | Yes | AI فقط پیشنهاد می‌دهد |
| Decision Queue | Central Cockpit | open decisions، urgent decisions، manager queue | Follow-up | Existing items | Yes | Yes | Cockpit تصمیم نهایی را مالک نیست |
| Audit/Backup/History | Central Cockpit | system confidence، rollback readiness، audit gaps | Audit task | Sensitive gap | Yes | Yes | فقط وضعیت خواندنی |

## 6. Data Flow Chains

### Production Flow

`Material/Component → Recipe/BOM → WorkOrder → Task → InventoryMovement → Product → DecisionItem if needed → Cockpit summary`

هر پیکان یک reference/event boundary است؛ Production موجودی یا داده Product را مستقیم بازنویسی نمی‌کند.

### Visual Inventory Flow

`Product/Material/Component → Photo Task → MediaAsset → Quality/identity DecisionItem → Inventory visual status → Cockpit summary`

MediaAsset evidence است و نتیجه AI تا تایید جای master data را نمی‌گیرد.

### Finance Flow

`Payment/Transaction → Classification → Sale/Expense link → DecisionItem if unclear → Cashflow summary → Cockpit risk`

موارد مبهم یا حساس وارد review می‌شوند و Cockpit فقط نتیجه خواندنی را نمایش می‌دهد.

### Sales / Friday Market Flow

`Product prepared → Sale → Payment/Transaction → InventoryMovement → Finance reconciliation → best-seller signal → Production/Inventory Task`

Sale، payment و movement مستقل اما با reference قابل reconciliation هستند.

### Workforce Flow

`Employee → Task → Schedule/Calendar → Progress → Alert/DecisionItem → Operational History → Cockpit summary`

تصمیم resolved باید اثر ثبت‌شده روی Task داشته باشد.

### AI Review Flow

`Raw signal → AI suggestion/confidence → DecisionItem/manual review → Human decision → Audit → downstream update`

AI source of truth نیست و downstream update فقط توسط domain owner انجام می‌شود.

## 7. Cockpit Visibility Rules

Cockpit فقط چیزهایی را نشان می‌دهد که پشت آن‌ها data، Task، DecisionItem یا audit وجود دارد.

هر Cockpit card باید مشخص کند:

- source module
- source data
- related Task count
- related DecisionItem count
- risk/confidence
- last updated
- drill-down target
- action status
- audit status

Cockpit نباید خودش source of truth باشد و نباید مستقیم data را mutate کند، مگر اینکه در آینده approval مستقل و command boundary مصوب دریافت کند.

## 8. Task/Decision Routing Rules

- هر ماژول می‌تواند Task بسازد اگر کار قابل انجام تولید کند.
- هر ماژول می‌تواند DecisionItem بسازد اگر نیاز به تصمیم مدیر دارد.
- DecisionItem باید `sourceModule` و `sourceReference` داشته باشد.
- DecisionItem با priority بحرانی/فوری یا risk بحرانی باید در Cockpit دیده شود.
- AI-generated DecisionItem باید human-approved باشد.
- DecisionItem با status `resolved` باید روی entity یا Task مربوطه اثر ثبت‌شده داشته باشد.

## 9. Boundary Rules

- Mahak/Product direct merge ممنوع است.
- Finance/Audit direct merge ممنوع است.
- Cockpit implementation بدون approval ممنوع است.
- AI auto-decision ممنوع است.
- mobile app implementation بدون contract ممنوع است.
- database implementation بدون central model approval ممنوع است.
- هر module implementation باید ابتدا contract و interaction map داشته باشد.

## 10. V1 Interaction Boundary

V1 مجاز:

- Workforce → Cockpit summary
- Task → DecisionItem
- Product/Material → MediaAsset concept
- Payment/Transaction → DecisionItem concept
- DecisionItem → Cockpit queue concept
- Audit event concept

V1 غیرمجاز:

- full production automation
- full finance auto reconciliation
- direct cockpit mutation
- AI auto approval
- direct subproject merge
- mobile offline sync implementation
- database migration

## 11. Architecture Risks

- اگر Cockpit زود ساخته شود، ویترین بدون موتور می‌شود.
- اگر Product/Finance مستقیم merge شوند، سیستم دوپاره می‌شود.
- اگر Task و Decision در هر ماژول جدا تعریف شوند، تصمیم‌ها گم می‌شوند.
- اگر MediaAsset جدا از Product/Payment باشد، عکس‌ها قاطی و بی‌ارزش می‌شوند.
- اگر Audit ضعیف باشد، تصمیم‌ها و rollback قابل اعتماد نیستند.
- اگر owner و reference روشن نباشد، چند منبع حقیقت متناقض ایجاد می‌شود.

## 12. Recommended Next Action

پیشنهاد بعدی:

`CORE-P05 — Master Gem V1 Build Boundary and No-Code Freeze Rules`

دلیل: پس از نقشه تعامل، باید دقیقاً مشخص شود V1 چه چیزهایی را اجازه می‌دهد و چه چیزهایی را ممنوع می‌کند تا پیش از بازگشت به کدنویسی، شلوغی و توسعه زودهنگام ایجاد نشود.

CORE-P05 نیز فعلاً docs-only باشد، مگر Project Core بعداً خلاف آن را صریحاً تایید کند.
