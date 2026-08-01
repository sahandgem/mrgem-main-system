# Master Gem Task and Decision Core Contract

آخرین به‌روزرسانی: 2026-06-30

## 1. Purpose

این سند قرارداد مرکزی `Task` و `DecisionItem` است. هدف آن ساخت کد نیست؛ هدف، تعریف ستون فقرات عملیات مستر جم است.

- `Task` یعنی کاری که باید انجام شود.
- `DecisionItem` یعنی موردی که نیاز به تصمیم، تایید، رد، hold، اصلاح یا escalation مدیر دارد.

این قرارداد بین قطعات زیر مشترک است:

- Workforce Operations Engine
- Production Engine
- Product + Inventory Core
- Finance + Cashflow Core
- Visual Inventory + Media
- Sales + Friday Market
- AI Review + Decision Queue
- Central Cockpit
- Audit/Backup/History

## 2. Core Decision

از این پس هیچ عملیات مهمی نباید در سیستم گم شود. هر فعالیت باید یکی از مسیرهای زیر را داشته باشد:

- تبدیل به Task
- تبدیل به DecisionItem
- تبدیل به Audit Event
- تبدیل به Alert
- یا اتصال روشن و قابل ردیابی به یکی از این موارد

قانون اولویت ساخت: اگر یک صفحه خروجی تصمیمی یا اثر عملیاتی قابل ردیابی ندارد، فعلاً اولویت ساخت ندارد.

## 3. Task Definition

`Task` یک کار مشخص، قابل انجام، قابل پیگیری و قابل تایید است که به یک نیرو، زمان، پروژه، تولید، کالا، مالی، انبار یا تصمیم وصل می‌شود.

Task می‌تواند از منابع زیر ساخته شود:

- برنامه روزانه Workforce
- دستور تولید
- کمبود موجودی
- فروش بالا
- تصمیم مدیر
- عکس یا رسید ارسال‌شده
- هشدار مالی
- ایده یا تست تولید
- اصلاح کالا
- آماده‌سازی جمعه‌بازار
- کار دستی مدیر

## 4. Task Required V1 Fields

فیلدهای پیشنهادی قرارداد V1 برای Task:

| Field | Contract meaning |
|---|---|
| `id` | شناسه داخلی پایدار Task |
| `code` | کد انسانی و قابل جست‌وجو |
| `title` | عنوان کوتاه کار |
| `description` | شرح هدف و خروجی مورد انتظار |
| `taskType` | نوع مصوب Task |
| `status` | وضعیت lifecycle Task |
| `priority` | اولویت اجرا |
| `assignedToEmployeeId` | نیروی مسئول، در صورت تخصیص |
| `relatedProductId` | مرجع کالای مرتبط |
| `relatedMaterialId` | مرجع ماده مرتبط |
| `relatedComponentId` | مرجع قطعه مرتبط |
| `relatedWorkOrderId` | مرجع دستور کار/تولید |
| `relatedSaleId` | مرجع فروش مرتبط |
| `relatedPaymentId` | مرجع پرداخت/تراکنش مرتبط |
| `relatedMediaAssetId` | مرجع عکس، رسید یا evidence |
| `relatedDecisionItemId` | مرجع تصمیم لازم یا نتیجه تصمیم |
| `sourceModule` | ماژول تولیدکننده Task |
| `sourceReference` | مرجع پایدار منبع ایجاد |
| `dueDate` | موعد انجام |
| `plannedStart` | شروع برنامه‌ریزی‌شده |
| `plannedEnd` | پایان برنامه‌ریزی‌شده |
| `actualStart` | شروع واقعی |
| `actualEnd` | پایان واقعی |
| `estimatedMinutes` | زمان تخمینی |
| `actualMinutes` | زمان واقعی ثبت‌شده |
| `confidence` | اطمینان به داده یا پیشنهاد سازنده Task |
| `createdAt` | زمان ایجاد |
| `updatedAt` | زمان آخرین تغییر |
| `createdBy` | actor انسانی یا سیستمی ایجادکننده |
| `approvedBy` | تاییدکننده، در صورت نیاز |
| `approvedAt` | زمان تایید، در صورت نیاز |
| `notes` | یادداشت کنترل‌شده تکمیلی |

این فیلدها implementation، schema دیتابیس یا TypeScript model نیستند؛ فقط contract مفهومی هستند.

## 5. Task Types

| Task type | توضیح |
|---|---|
| `workforce_daily_task` | کار روزانه برنامه‌ریزی‌شده برای نیروی انسانی |
| `production_step` | یک مرحله مشخص از اجرای WorkOrder یا تولید |
| `inventory_check` | بررسی مقدار، موقعیت یا مغایرت موجودی |
| `inventory_photo_capture` | تهیه تصویر کنترل‌شده از کالا یا موجودی |
| `product_data_cleanup` | تکمیل یا اصلاح داده کالا پس از validation |
| `pricing_review_prepare` | آماده‌سازی شواهد و اطلاعات لازم برای بررسی قیمت |
| `finance_evidence_check` | بررسی رسید، سند یا evidence مالی |
| `bank_transaction_review` | بررسی و تطبیق تراکنش بانکی |
| `sale_reconciliation` | تطبیق فروش، موجودی و پرداخت |
| `friday_market_prepare` | آماده‌سازی کالا، قیمت، media و عملیات جمعه‌بازار |
| `customer_followup` | پیگیری مشخص و زمان‌دار مشتری |
| `media_capture` | ثبت عکس یا فایل مورد نیاز یک entity |
| `manager_followup` | پیگیری اقدام تعیین‌شده توسط مدیر |
| `audit_check` | بررسی trail، تغییر یا انطباق عملیاتی |
| `maintenance_check` | کنترل نگهداری، سلامت یا آمادگی سیستم/عملیات |
| `idea_experiment_step` | گام کنترل‌شده یک ایده یا آزمایش کسب‌وکار |

## 6. Task Status Model

| Status | توضیح |
|---|---|
| `draft` | کار هنوز برای اجرا آماده یا تایید نشده است. |
| `planned` | کار برنامه‌ریزی شده ولی هنوز تخصیص قطعی ندارد. |
| `assigned` | مسئول کار مشخص شده است. |
| `in_progress` | اجرای کار آغاز شده است. |
| `waiting_for_input` | ادامه کار به داده، فایل یا ورودی دیگری وابسته است. |
| `waiting_for_decision` | ادامه کار نیازمند DecisionItem و تصمیم مدیر است. |
| `done` | اجرا تمام شده ولی ممکن است تایید نهایی لازم باشد. |
| `approved` | خروجی کار توسط مرجع لازم تایید شده است. |
| `rejected` | خروجی یا اجرای کار رد شده و دلیل باید ثبت شود. |
| `blocked` | مانع مشخص اجازه ادامه نمی‌دهد. |
| `cancelled` | کار با دلیل لغو شده است. |
| `archived` | کار از جریان فعال خارج و برای history حفظ شده است. |

قانون: Task با status برابر `waiting_for_decision` باید به یک `DecisionItem` متصل باشد.

## 7. DecisionItem Definition

`DecisionItem` هر موردی است که بدون تصمیم مدیر نباید جلو برود.

نمونه‌ها:

- تایید تولید
- تایید قیمت
- تایید خرید
- تایید رسید یا پرداخت
- تایید اصلاح موجودی
- تایید عکس کالا
- تایید توقف پروژه
- تایید ادامه ایده
- تایید کار انجام‌شده نیرو
- escalation از AI یا سیستم هشدار

## 8. DecisionItem Required V1 Fields

| Field | Contract meaning |
|---|---|
| `id` | شناسه داخلی پایدار DecisionItem |
| `code` | کد انسانی و قابل جست‌وجو |
| `title` | عنوان کوتاه تصمیم |
| `description` | شرح مسئله، شواهد و اثر تصمیم |
| `decisionType` | نوع تصمیم مورد انتظار |
| `status` | وضعیت lifecycle تصمیم |
| `priority` | اولویت بررسی |
| `riskLevel` | سطح ریسک عدم تصمیم یا تصمیم اشتباه |
| `confidence` | میزان اطمینان به داده و پیشنهاد |
| `sourceModule` | ماژول درخواست‌کننده تصمیم |
| `sourceReference` | مرجع پایدار رخداد یا داده مبدا |
| `relatedTaskId` | Task مرتبط |
| `relatedProductId` | کالای مرتبط |
| `relatedMaterialId` | ماده مرتبط |
| `relatedComponentId` | قطعه مرتبط |
| `relatedWorkOrderId` | دستور کار مرتبط |
| `relatedSaleId` | فروش مرتبط |
| `relatedPaymentId` | پرداخت/تراکنش مرتبط |
| `relatedMediaAssetId` | evidence تصویری یا سند مرتبط |
| `suggestedAction` | اقدام پیشنهادی rule/system |
| `aiSuggestion` | پیشنهاد AI، بدون اختیار تصمیم نهایی |
| `humanDecision` | تصمیم ثبت‌شده انسان مجاز |
| `decisionReason` | دلیل تصمیم نهایی |
| `decidedBy` | تصمیم‌گیرنده انسانی |
| `decidedAt` | زمان تصمیم |
| `expiresAt` | مهلت تصمیم، در صورت کاربرد |
| `createdAt` | زمان ایجاد |
| `updatedAt` | زمان آخرین تغییر |
| `createdBy` | actor ایجادکننده |
| `notes` | یادداشت تکمیلی کنترل‌شده |

`aiSuggestion` فقط پیشنهاد است. تصمیم نهایی باید human-approved باشد، مگر اینکه در آینده برای یک اقدام کم‌ریسک approval جدا و صریح صادر شود.

## 9. Decision Types

| Decision type | توضیح |
|---|---|
| `approve_task` | تایید نتیجه یا عبور Task به مرحله بعد |
| `approve_production` | تایید شروع، ادامه یا خروجی تولید |
| `approve_pricing` | تایید قیمت یا تغییر حساس قیمت |
| `approve_purchase` | تایید خرید کالا، مواد یا خدمات |
| `approve_inventory_adjustment` | تایید اصلاح یا مغایرت موجودی |
| `approve_payment` | تایید پرداخت، به‌ویژه موارد حساس |
| `approve_receipt` | تایید اعتبار و اتصال رسید |
| `approve_media` | تایید کیفیت یا ارتباط MediaAsset |
| `approve_product_data` | تایید ایجاد یا اصلاح داده کالا |
| `hold_project` | توقف موقت پروژه یا جریان با امکان ادامه |
| `stop_project` | توقف کنترل‌شده پروژه یا آزمایش |
| `continue_experiment` | اجازه ادامه یک ایده یا آزمایش |
| `escalate_risk` | انتقال ریسک به سطح مدیریتی بالاتر |
| `resolve_conflict` | حل تعارض بین داده، evidence یا پیشنهادها |
| `manual_review` | بررسی انسانی وقتی automation مجاز یا مطمئن نیست |

## 10. DecisionItem Status Model

| Status | توضیح |
|---|---|
| `open` | تصمیم ایجاد شده و هنوز بررسی شروع نشده است. |
| `in_review` | مدیر یا reviewer در حال بررسی شواهد است. |
| `approved` | اقدام پیشنهادی تایید شده است. |
| `rejected` | اقدام پیشنهادی رد شده و دلیل ثبت شده است. |
| `hold` | تصمیم موقتاً متوقف و نیازمند ورودی یا زمان بیشتر است. |
| `escalated` | تصمیم به سطح اختیار یا ریسک بالاتر منتقل شده است. |
| `needs_correction` | داده یا اقدام قبل از تصمیم نهایی نیازمند اصلاح است. |
| `resolved` | تصمیم و اثر آن روی Task/entity ثبت شده است. |
| `archived` | تصمیم بسته‌شده برای history و audit نگهداری می‌شود. |

## 11. Task To Decision Flow

1. Input arrives.
2. System creates or updates Task.
3. Task is assigned or scheduled.
4. Task progresses.
5. If decision is needed, DecisionItem is created.
6. Manager reviews DecisionItem.
7. Decision result updates Task.
8. Audit event is recorded.
9. Cockpit shows summary/read-only state.
10. AI can suggest but cannot finalize without approval.

## 12. Module Flows

### Workforce Operations Engine

- Task روزانه تولید می‌کند.
- انجام کار را پیگیری می‌کند.
- موارد مشکوک را به DecisionItem منتقل می‌کند.
- Task و تصمیم را به calendar، readiness و history متصل می‌کند.

### Production Engine

- WorkOrder را به Taskهای مرحله‌ای تبدیل می‌کند.
- توقف یا ادامه تولید را با DecisionItem کنترل می‌کند.
- Task و تصمیم را به مواد، عکس، خروجی و قیمت متصل می‌کند.

### Product + Inventory Core

- برای تکمیل اطلاعات کالا Task می‌سازد.
- برای عکس‌برداری موجودی Task می‌سازد.
- اصلاح موجودی یا تایید داده کالا را با DecisionItem کنترل می‌کند.

### Finance + Cashflow Core

- برای بررسی تراکنش Task می‌سازد.
- پرداخت، رسید یا هزینه غیرعادی را به DecisionItem می‌فرستد.

### Visual Inventory + Media

- برای گرفتن عکس Task می‌سازد.
- کیفیت عکس یا اتصال آن به کالا/رسید را با DecisionItem تایید می‌کند.

### Sales + Friday Market

- برای آماده‌سازی کالا Task می‌سازد.
- برای تطبیق فروش Task می‌سازد.
- کسری، اختلاف پرداخت یا پیشنهاد تامین مجدد را به DecisionItem تبدیل می‌کند.

### AI Review + Decision Queue

- AI فقط پیشنهاد می‌دهد.
- موارد low confidence باید DecisionItem شوند.
- AI نباید source of truth باشد.

### Central Cockpit

- Cockpit مالک Task یا DecisionItem نیست.
- فقط summary، risk، queue و drill-down را نشان می‌دهد.
- action واقعی در Cockpit نیازمند approval جداگانه آینده است.

### Audit/Backup/History

- هر تغییر مهم در Task و DecisionItem باید audit شود.
- تصمیم‌های مدیر باید با actor، زمان، دلیل و اثر قابل ردیابی باشند.

## 13. Relationship Rules

- هر DecisionItem باید حداقل یک `sourceModule` و `sourceReference` داشته باشد.
- هر DecisionItem بهتر است به حداقل یک entity مرتبط وصل باشد.
- هر Task بهتر است `assignedToEmployeeId` یا `sourceModule` مشخص داشته باشد.
- Task بدون owner نباید مدت طولانی active بماند و باید alert یا escalation تولید کند.
- DecisionItem بدون status نهایی نباید در سیستم گم شود.
- DecisionItem با status `resolved` باید روی Task یا entity مربوطه اثر ثبت‌شده داشته باشد.
- اتصال‌ها باید reference باشند؛ یک ماژول حق mutate مستقیم داده مالکیت‌شده ماژول دیگر را ندارد.

## 14. Priority And Risk Rules

Priority:

- `low`
- `normal`
- `high`
- `urgent`
- `crisis`

Risk level:

- `low`
- `medium`
- `high`
- `critical`

قوانین:

- priority برابر `crisis` باید در Cockpit دیده شود.
- riskLevel برابر `critical` باید در Decision Queue دیده شود.
- AI suggestion با confidence پایین باید `manual_review` شود.
- priority زمان رسیدگی را نشان می‌دهد؛ riskLevel شدت پیامد را نشان می‌دهد و این دو جای یکدیگر را نمی‌گیرند.

## 15. Visual/UI Rule

بهترین UI گرافیکی هدف است، اما UI فقط وقتی ساخته می‌شود که به Task/Decision وصل باشد.

برای هر card یا page آینده باید مشخص باشد:

- کدام Taskها را نشان می‌دهد.
- کدام DecisionItemها را نشان می‌دهد.
- action بعدی چیست.
- چه کسی مسئول است.
- چه چیزی audit می‌شود.

## 16. V1 Boundary

در نسخه اول، Task + Decision Core فقط موارد زیر را پوشش می‌دهد:

- Task روزانه نیرو
- Task عملیاتی ساده
- DecisionItem برای تایید/رد/hold
- اتصال به Employee
- اتصال به MediaAsset
- اتصال به Product
- اتصال به Payment/Transaction
- اتصال به Cockpit به شکل read-only summary
- audit ساده تصمیم‌ها

خارج از V1:

- automation execution
- auto-approval by AI
- full production workflow
- full finance reconciliation
- full mobile app
- direct cockpit action
- subproject merge

## 17. Non-Goals

CORE-P03 هیچ‌کدام از موارد زیر را انجام نمی‌دهد:

- database schema implementation
- TypeScript model implementation
- migration
- UI
- route
- prototype
- business logic
- analyzer logic
- storage key
- API/backend
- merge
- push
- source refactor
- P55A/P56

## 18. Risks

- اگر Task بدون DecisionItem باشد، موارد نیازمند تایید مدیر گم می‌شوند.
- اگر DecisionItem بدون audit باشد، تصمیم‌ها قابل پیگیری نیستند.
- اگر AI اجازه تصمیم نهایی داشته باشد، ریسک مدیریتی بالا می‌رود.
- اگر Cockpit زودتر از Task/Decision contract ساخته شود، فقط ویترین می‌شود.
- اگر هر ماژول Task خودش را جدا تعریف کند، سیستم چندتکه می‌شود.
- اگر اثر تصمیم روی Task/entity ثبت نشود، status ظاهری با واقعیت عملیات جدا می‌شود.

## 19. Recommended Next Action

پیشنهاد بعدی:

`CORE-P04 — Master Gem Module Interaction Map`

دلیل: پس از قرارداد Data Model و Task/Decision، باید نقشه اتصال ماژول‌ها مشخص شود؛ Workforce چگونه به Production، Product، Finance، Media، Sales و Cockpit وصل می‌شود.

CORE-P04 نیز فعلاً docs-only باشد، مگر Project Core بعداً خلاف آن را صریحاً تایید کند.
