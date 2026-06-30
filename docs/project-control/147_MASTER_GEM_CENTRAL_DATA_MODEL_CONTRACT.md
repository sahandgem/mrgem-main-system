# Master Gem Central Data Model Contract

آخرین به‌روزرسانی: 2026-06-30

## 1. وضعیت و هدف

`CORE-P02` قرارداد مفهومی داده مرکزی مستر جم را میان Workforce، Product/Inventory، Finance، Production، Media، Decision و Central Cockpit قفل می‌کند.

این سند schema دیتابیس، TypeScript interface، API، migration یا مجوز implementation نیست. هدف آن ایجاد یک زبان مشترک پایدار است تا هر ماژول مالک داده خود باقی بماند و از طریق reference، event و snapshot کنترل‌شده با سایر قطعات پازل ارتباط بگیرد.

## 2. اصول مادر قرارداد

1. هر موجودیت یک شناسه داخلی پایدار و مستقل از شناسه سیستم‌های خارجی دارد.
2. هر رکورد باید مالک دامنه‌ای، منبع، وضعیت، زمان ایجاد و آخرین تغییر قابل تشخیص داشته باشد.
3. ماژول‌ها داده مالکیت‌شده ماژول دیگر را مستقیم mutate نمی‌کنند.
4. ارتباط بین ماژول‌ها با reference پایدار، business event نسخه‌دار یا snapshot خواندنی انجام می‌شود.
5. داده خارجی ابتدا staging، normalization، validation، conflict/duplicate check و approval لازم را طی می‌کند.
6. confidence با approval یکی نیست؛ confidence بالا نیز تصمیم حساس را خودکار مجاز نمی‌کند.
7. هر تغییر حساس باید auditReference، actor، reason و قابلیت پیگیری داشته باشد.
8. حذف دائمی پیش‌فرض نیست؛ inactive، archived، superseded یا merged باید قابل ردیابی باشد.
9. Central Cockpit و AI مصرف‌کننده read model و snapshot هستند و مالک master data یا transaction data نیستند.
10. این قرارداد مستقل از UI، storage technology، database vendor و پروژه‌های فرعی است.

## 3. پوش مشترک موجودیت‌ها

هر مدل مرکزی در صورت کاربرد باید این مفاهیم پایه را داشته باشد:

| مفهوم | هدف |
|---|---|
| `id` | شناسه داخلی پایدار و یکتا |
| `entityType` | نوع موجودیت در زبان مشترک دامنه |
| `status` | وضعیت lifecycle مصوب همان دامنه |
| `source` | منبع ایجاد: manual، module، approved import یا system |
| `sourceReference` | نگاشت اختیاری به منبع خارجی، بدون جایگزینی شناسه داخلی |
| `createdAt` / `updatedAt` | زمان ایجاد و آخرین تغییر |
| `createdBy` / `updatedBy` | actor انسانی یا سیستمی مسئول |
| `version` | نسخه منطقی قرارداد یا رکورد در نقاط حساس |
| `auditReference` | مرجع trail برای تغییر، import، review یا rollback |
| `confidenceLevel` | کیفیت/اطمینان داده در موارد derived یا imported |
| `riskFlags` | ریسک‌های شناخته‌شده بدون تبدیل آن‌ها به تصمیم نهایی |

وجود دقیق هر فیلد در schema اجرایی باید در فاز جدا تصویب شود. این جدول فقط semantic contract است.

## 4. رجیستری موجودیت‌های مرکزی

| موجودیت | تعریف مرکزی | مالک اصلی | مصرف‌کنندگان اصلی |
|---|---|---|---|
| `Product` | کالای قابل فروش، تولید، نگهداری و تحلیل | Product | Inventory، Production، Sales، Finance، Cockpit |
| `Material` | ماده خام یا ورودی مصرفی | Product/Production | Production، Inventory، Finance |
| `Component` | جزء قابل ترکیب در محصول یا فرمول | Product/Production | Production، Inventory |
| `Recipe/BOM` | نسخه کنترل‌شده ترکیب مواد و اجزا | Production | Inventory، Finance، AI |
| `WorkOrder` | دستور کنترل‌شده تولید، تعمیر یا عملیات | Production | Workforce، Inventory، Finance، Cockpit |
| `Task` | کار برنامه‌پذیر با زمان، نقش و context عملیاتی | Workforce | Production، Sales، Cockpit |
| `Employee` | عضو تیم با وضعیت، نقش و قابلیت‌ها | Workforce | Production، Finance، Decision |
| `InventoryMovement` | رویداد ورود، خروج، انتقال یا اصلاح موجودی | Inventory | Product، Production، Finance، Cockpit |
| `Sale` | رخداد تجاری فروش به مشتری/کانال | Sales | Product، Inventory، Finance، Cockpit |
| `Payment/Transaction` | دریافت، پرداخت، انتقال یا اثر نقدینگی | Finance | Sales، Production، Workforce، Cockpit |
| `MediaAsset` | عکس، رسید یا evidence با metadata و مالکیت روشن | Media | Product، Finance، Inventory، AI |
| `DecisionItem` | مورد نیازمند review، approval یا اقدام مدیر | Decision | همه ماژول‌ها و Cockpit |
| `Idea/Experiment` | فرضیه یا آزمایش کنترل‌شده کسب‌وکار | Project Core | Product، Sales، Production، Decision |

## 5. مرز مالکیت ماژول‌ها

### Workforce Operations Engine

- مالک: Employee، Task، schedule context، workforce finding و تاریخچه عملیاتی مرتبط.
- تولید می‌کند: وضعیت ظرفیت/ریسک، نیاز تصمیم، ارجاع به WorkOrder یا Task.
- مصرف می‌کند: WorkOrder reference، location/space context و Decision outcome.
- مجاز نیست: تغییر مستقیم موجودی، رویداد مالی یا Product master.

### Product + Inventory Core

- Product مالک هویت و ویژگی‌های مصوب کالا، ماده و component است.
- Inventory مالک quantity state و movement history است؛ quantity نباید داخل Product master منبع حقیقت باشد.
- تولید می‌کند: product reference، availability snapshot، shortage/duplicate signal.
- مصرف می‌کند: approved production output، sale/purchase reference و MediaAsset evidence.

### Finance + Cashflow Core

- مالک Payment/Transaction، financial event، approval و liquidity read model است.
- مبلغ عملیاتی باید currency، source، counterparty و وضعیت تایید روشن داشته باشد.
- مصرف می‌کند: Sale، WorkOrder cost، Employee/payroll reference و receipt MediaAsset.
- مجاز نیست: تغییر مستقیم Product، Employee یا InventoryMovement.

### Production Engine

- مالک Recipe/BOM، WorkOrder، مصرف/خروجی تولید و وضعیت اجرای تولید است.
- تولید می‌کند: material requirement، output reference، cost evidence و production risk.
- مصرف می‌کند: Product/Material/Component reference، Inventory availability و Workforce assignment.
- تغییر موجودی و مالی فقط از طریق قرارداد رویداد/سند مربوط انجام می‌شود.

### Visual Inventory + Media

- مالک MediaAsset و metadata فایل است، نه حقیقت تجاری محتوای فایل.
- هر asset باید purpose، relatedEntity، source، capture time، status و audit reference داشته باشد.
- استخراج AI از تصویر یک suggestion/snapshot است و تا validation جای داده مصوب را نمی‌گیرد.

### Decision + Central Cockpit

- Decision Core مالک DecisionItem، review status، manager decision و decision audit است.
- Cockpit فقط read model، event، snapshot، alert و DecisionItem را نمایش می‌دهد.
- Cockpit حق تغییر مستقیم master/transaction data را ندارد؛ action باید به فرمان دامنه مالک تبدیل شود.

## 6. روابط مرکزی و قواعد مرجع

| رابطه | قرارداد |
|---|---|
| Product ↔ InventoryMovement | movement به Product reference و location معتبر اشاره می‌کند؛ Product مقدار موجودی را نگهداری نمی‌کند. |
| Recipe/BOM ↔ Material/Component/Product | BOM فقط reference و quantity/unit نسخه‌دار دارد؛ تغییر master data نسخه BOM قبلی را بازنویسی نمی‌کند. |
| WorkOrder ↔ Recipe/BOM | WorkOrder به نسخه مشخص BOM و snapshot لازم در زمان اجرا متصل است. |
| WorkOrder ↔ Task/Employee | Production نیاز را اعلام می‌کند؛ Workforce تخصیص و زمان‌بندی را مالک است. |
| Sale ↔ Product/Inventory | Sale به item snapshot اشاره می‌کند و پس از rule/approval رویداد موجودی می‌سازد. |
| Sale ↔ Payment/Transaction | تعهد فروش و جابه‌جایی پول دو حقیقت جدا اما قابل reconciliation هستند. |
| Payment/Transaction ↔ MediaAsset | receipt evidence قابل اتصال است؛ فایل به‌تنهایی اثبات نهایی پرداخت نیست. |
| Entity ↔ DecisionItem | DecisionItem reference، reason، evidence، confidence، risk و required approval دارد. |
| Entity/Event ↔ Cockpit | Cockpit از read model/snapshot استفاده می‌کند و جزئیات را با reference قابل drill-down نشان می‌دهد. |

## 7. قرارداد وضعیت و lifecycle

وضعیت‌ها باید دامنه‌ای باشند، اما semantics مشترک زیر حفظ شود:

- `draft`: هنوز حقیقت عملیاتی تاییدشده نیست.
- `active`: معتبر و قابل استفاده در دامنه مالک.
- `inactive`: برای استفاده جدید غیرفعال، ولی قابل ردیابی.
- `under_review`: نیازمند بررسی انسانی یا rule validation.
- `approved`: تایید لازم دریافت شده، ولی لزوماً finalized نیست.
- `rejected`: برای اقدام جاری رد شده و دلیل دارد.
- `finalized`: اثر عملیاتی نهایی ثبت شده است.
- `cancelled`: عملیات لغو شده و history باقی می‌ماند.
- `archived`: از جریان روزمره خارج، اما حفظ‌شده برای history/audit.
- `conflict` یا `quarantined`: تا رفع تعارض وارد جریان اصلی نمی‌شود.

هر دامنه می‌تواند subset یا statusهای تخصصی داشته باشد، اما mapping آن‌ها به semantics بالا باید مستند شود.

## 8. قرارداد تبادل بین ماژول‌ها

### Entity Reference

حداقل شامل `entityType`، `entityId` و در صورت نیاز `version` یا `snapshotAt` است. reference خارجی باید جداگانه و namespaced باشد.

### Business Event

حداقل شامل `eventId`، `eventType`، `sourceModule`، `relatedEntity`، `timestamp`، `actor`، `auditReference`، `confidenceLevel`، `riskFlags` و `payloadSummary` است. Event اعلان واقعیت رخ‌داده است، نه فرمان پنهان برای mutate نامحدود.

### Read Model / AI-ready Snapshot

- فقط خواندنی، زمان‌دار و دارای source است.
- داده خام حساس را بدون نیاز منتشر نمی‌کند.
- confidence، freshness، contractVersion و auditReference را حمل می‌کند.
- AI suggestion را از approved fact جدا نگه می‌دارد.

### Command / Decision Request

درخواست اقدام باید target owner، requested action، actor، reason، idempotency reference، approval requirement و audit reference داشته باشد. اجرای command فقط با قوانین دامنه مالک انجام می‌شود.

## 9. کیفیت، confidence و حل تعارض

- داده ناقص یا نامعتبر به عنوان approved fact منتشر نمی‌شود.
- duplicate candidate تا تصمیم review merge یا حذف نمی‌شود.
- تعارض بین sourceها باید source reliability، freshness و evidence را نشان دهد.
- `High confidence` فقط اجازه اقدام خودکار کم‌ریسک و auditشده را می‌دهد.
- `Medium confidence` وارد review queue می‌شود.
- `Low confidence` review یا block می‌شود.
- `Conflict` تا تصمیم مدیر blocked است.
- `Manual only` هرگز auto action ندارد.

## 10. قرارداد Audit و برگشت‌پذیری

برای create، update، approve، reject، finalize، cancel، merge، import و rollback حساس باید این اطلاعات قابل بازیابی باشد:

- entity/document/event reference
- action type
- actor و role
- timestamp
- before/after snapshot یا change summary
- reason
- source module
- rule/contract version
- confidence و risk flags در اقدام خودکار
- approval reference
- rollback result در صورت کاربرد

Audit log جای داده اصلی نیست و نباید قابل بازنویسی بی‌رد باشد.

## 11. مرز داده خارجی و زیرپروژه‌ها

- `mahak-web-version` و `audit-app` منبع استخراج ایده، mapping و contract هستند، نه منبع merge مستقیم.
- شناسه، schema، table یا naming خارجی نباید هویت مرکزی را تحمیل کند.
- ورودی Mahak، Bank Excel، receipt، inventory file یا workforce external input ابتدا staging می‌شود.
- فقط داده `approved_for_import` با Import Gate، dry-run و rollback readiness می‌تواند در آینده وارد domain owner شود.
- هیچ داده واقعی در این فاز وارد نشده است.

## 12. سازگاری و نسخه‌بندی آینده

- هر قرارداد اجرایی آینده باید `contractVersion` داشته باشد.
- تغییر additive و backward-compatible بر breaking change ترجیح دارد.
- breaking change نیازمند impact map، migration plan، rollback plan و approval مستقل است.
- مصرف‌کننده نباید فیلد ناشناخته را باعث شکست کل payload کند.
- حذف فیلد ابتدا deprecate، سپس با evidence مصرف‌کنندگان و approval انجام می‌شود.
- historical snapshot باید با نسخه‌ای که در زمان تولید معتبر بوده قابل تفسیر بماند.

## 13. ماتریس Producer / Consumer

| داده/سیگنال | Producer مالک | Consumer مجاز | روش اتصال |
|---|---|---|---|
| Workforce risk | Workforce | Decision، Cockpit، AI | event + snapshot |
| Product identity | Product | Inventory، Production، Sales، Finance | entity reference |
| Inventory availability | Inventory | Production، Sales، Cockpit | read model + event |
| Production requirement/output | Production | Workforce، Inventory، Finance | command request + event |
| Financial pressure/payment state | Finance | Decision، Cockpit | read model + event |
| Receipt/product image | Media | Finance، Product، AI | MediaAsset reference |
| Review request/decision | Decision | domain owner، Cockpit | DecisionItem + audited event |
| Executive signal | domain owners/Decision | Cockpit | read-only snapshot |

## 14. معیار آمادگی هر ماژول برای اتصال

پیش از اتصال یک ماژول باید موارد زیر روشن و تایید شده باشند:

1. domain owner و source of truth
2. entity/reference contract
3. lifecycle و status mapping
4. validation و duplicate/conflict policy
5. event، command و read model boundary
6. approval و human-in-the-loop rule
7. audit و rollback boundary
8. security/data minimization requirements
9. contract version و compatibility plan
10. تست synthetic و عدم وابستگی مستقیم به زیرپروژه

## 15. ممنوعیت‌های CORE-P02

- تغییر `src`، prototype، route یا UI
- ساخت TypeScript model یا service اجرایی
- ساخت database، schema اجرایی، migration، API، backend یا auth
- ساخت یا تغییر localStorage/sessionStorage key
- import داده واقعی
- merge پروژه پول یا کالا
- implementation یا merge به main
- تلقی این سند به عنوان approval ساخت

## 16. تصمیم قفل‌شده و گام بعدی

این قرارداد، واژگان و مرز مالکیت مرکزی مستر جم را در سطح مفهومی قفل می‌کند. هر implementation باید در فاز جدا، برای یک vertical slice محدود، با approval مستقل Project Core انجام شود.

پیشنهاد بعدی:

`CORE-P03 — Task and Decision Core Contract`

این گام باید ابتدا docs-only بماند و رابطه Task، WorkOrder، DecisionItem، review، approval و cockpit signal را بدون کدنویسی دقیق کند.
