# Phase Log

آخرین به‌روزرسانی: 2026-06-29

## جدول فازهای WF

| فاز | وضعیت | خلاصه خروجی |
|---|---|---|
| WF-P0 | انجام شده | اسکلت داشبورد، مسیرهای اصلی، RTL، dark mode و UI اولیه WF |
| WF-P1 | انجام شده | مدل داده، CRUD، localStorage و data service داخلی |
| WF-P2 | انجام شده | موتور تحلیل واقعی اولیه برای ظرفیت، تمرکز، ایمنی، فروشگاه و تداخل‌ها |
| WF-P3 | انجام شده | صفحه جزئیات تحلیل و تنظیمات تحلیل |
| WF-P4 | انجام شده | سازگاری کار/فضا و قوانین compatibility |
| WF-P5 | انجام شده | simulator سبک برنامه |
| WF-P6 | انجام شده | recommendation engine |
| WF-P7 | انجام شده | decision queue |
| WF-P8 | انجام شده | decision reports |
| WF-P9 | انجام شده | report archive/comparison |
| WF-P10 | انجام شده | monthly health |
| WF-P11 | انجام شده | preventive alerts |
| WF-P12 | انجام شده | data center، backup، import/restore و snapshot |
| WF-P13 | انجام شده | maintenance analyzer/service/page |
| WF-P14 | انجام شده | operational readiness |
| WF-P15 | انجام شده | launch checklist |
| WF-P16 | انجام شده | launch signoff و baseline bundle |
| WF-P17 | انجام شده | baseline drift و operational resignoff |
| WF-P18 | انجام شده | operational history |
| WF-P19 | انجام شده | history retention/archive |
| WF-P20 | انجام شده | operations calendar |
| WF-P21 | انجام شده | control policy، export و in-app notification |
| WF-P22 | انجام شده | route registry، lazy routes، loading/error boundary |
| WF-P23 | نیاز به تأیید دستی | شواهد مستقیم کافی در repo ثبت نشده است |
| WF-P24 | انجام شده | project control docs و current state audit اولیه |
| WF-P25 | انجام شده | backup coverage و recovery audit |
| WF-P26 | انجام شده | baseline compatibility و migration notes |
| WF-P27 | انجام شده | operator guidance برای legacy baseline |
| WF-P28 | انجام شده | page entry split برای صفحات سیستم و component extraction سبک |
| WF-P29 | انجام و verify شد | `MaintenancePage` و `HistoryRetentionPage` قبلاً از `WorkforcePages.tsx` جدا شده بودند؛ فایل‌های مستقل موجودند؛ test/build موفق؛ route/storage/UI تغییر نکرد. |
| WF-P30 | انجام و verify شد | `OperationalHistoryPage` واقعاً از `WorkforcePages.tsx` خارج شد؛ `WorkforcePages.tsx` از `4733` خط به `4614` خط رسید؛ test/build موفق؛ route/storage/UI تغییر نکرد. |
| WF-P31 | انجام و verify شد | `DataCenterPage` از adapter به صفحه واقعی تبدیل شد؛ `WorkforcePages.tsx` از `4331` خط به `4119` خط رسید؛ test/build موفق؛ route/storage/docs تغییر نکرد. |

## جدول فازهای CONTROL

| فاز | وضعیت | خلاصه خروجی |
|---|---|---|
| CONTROL-P1 | انجام شده | ساخت/تکمیل docs/project-control به عنوان منبع حقیقت مستر جم و sync تصمیم مرکز کنترل |
| CONTROL-P2 | انجام شده | ساخت `09_SOURCE_INTEGRATION_MAP.md` و ثبت نقشه ادغام منابع بدون merge کد |
| CONTROL-P3 | انجام شده | ساخت `10_FUTURE_MODULES_ROADMAP.md` و ثبت نقشه آینده ماژول‌های مستر جم بدون کدنویسی یا ادغام کد |
| CONTROL-P4 | انجام شده | ساخت `11_CORE_PRODUCT_MODEL.md` و طراحی مستند مدل مرکزی کالا بدون کدنویسی، migration یا merge پروژه کالا |
| CONTROL-P5 | انجام شده | ساخت `12_CORE_FINANCIAL_EVENT_MODEL.md` و طراحی مستند مدل مرکزی رویداد مالی بدون کدنویسی، auth/database change یا merge پروژه پول |
| CONTROL-P6 | انجام شده | ساخت `13_PRODUCT_SCHEMA_AND_ADAPTER_BOUNDARY.md` و طراحی schema پیشنهادی کالا و adapter boundary بدون کدنویسی یا merge پروژه کالا |
| CONTROL-P7 | انجام شده | ساخت `14_PRODUCT_IMPORT_VALIDATOR_AND_DUPLICATE_DETECTOR.md` و طراحی قوانین اعتبارسنجی ورود کالا و تشخیص تکراری بدون کدنویسی یا merge پروژه کالا |
| CONTROL-P7-BATCH | انجام شده | تکمیل بسته ایمنی ورود کالا با auto-fix، review queue، Mahak export و AI product snapshot بدون کدنویسی یا merge پروژه کالا |
| CONTROL-P8-BATCH | انجام شده | طراحی parallel workstream، multi-Codex handoff و merge approval checklist بدون کدنویسی یا ساخت repo جدید |
| CONTROL-P9-BATCH | انجام شده | طراحی financial schema، adapter boundary، approval/liquidity flow و receipt/bank mapping بدون کدنویسی یا merge پروژه پول |
| CONTROL-P10-BATCH | انجام شده | طراحی financial validation، import decision flow، receipt review، bank match confidence، liquidity approvals و bank Excel rule matcher بدون کدنویسی یا merge پروژه پول |
| CONTROL-P11-BATCH | انجام شده | طراحی financial review queue، bank Excel format test plan، bank rule management و installment audit بدون کدنویسی یا merge پروژه پول |
| CONTROL-P12-BATCH | انجام شده | ثبت اصل Automation-First و AI-Assisted، Human-in-the-loop، confidence rules و AI audit trail برای کل پروژه بدون کدنویسی |
| CONTROL-P13-BATCH | انجام شده | طراحی Cross-module Automation Map، Confidence Scoring Model و Auto Action Safety Matrix بدون کدنویسی |
| CONTROL-P14-BATCH | انجام شده | طراحی AI Snapshot Strategy، Module Data Producer/Consumer Contracts و Staging/Safe Import Boundary بدون کدنویسی |
| CONTROL-P15-BATCH | انجام شده | طراحی External Data Staging Policy، Approved Import Flow، Import Gate و Rollback Policy بدون کدنویسی |
| CONTROL-P16-BATCH | انجام شده | طراحی Import Dry-run Report، Quarantine Review Flow و Import Simulation Test Cases بدون کدنویسی |
| CONTROL-P17-BATCH | انجام شده | طراحی Design Lab Launch Blueprint، Central Cockpit UI/UX Strategy و Design Tokens/Component Pattern Strategy بدون کدنویسی یا ساخت repo |
| CONTROL-MAHAK-ARCH-01 | انجام شده | ثبت دانش معماری استخراج‌شده از محک به عنوان reference-only، بدون merge، بدون schema dependency و بدون کدنویسی |
| CONTROL-P18-BATCH | انجام شده | طراحی Cockpit Dashboard Card Map، Manager Review UI Concept و AI Suggestion/Risk Visual Language بدون کدنویسی یا تغییر UI اصلی |
| CONTROL-P19-BATCH | انجام شده | طراحی Core Document Architecture، Master Data Registry و Core Business Event Bus بدون کدنویسی یا کپی schema محک |

## P فعلی قطعی

آخرین P اجرایی و کدی verify شده: **WF-P31**

آخرین P کنترل پروژه: **CONTROL-P19-BATCH**

## جزئیات ثبت CONTROL-P19-BATCH

فایل‌های جدید:

- `docs/project-control/52_CORE_DOCUMENT_ARCHITECTURE.md`
- `docs/project-control/53_MASTER_DATA_REGISTRY.md`
- `docs/project-control/54_CORE_BUSINESS_EVENT_BUS.md`

نتیجه:

- Core Document Architecture با الگوی Header/Detail مستقل از محک طراحی شد.
- BaseDocument و BaseDocumentItem مفهومی برای سندهای Financial، Purchase، Sales، Production، InventoryMovement، Payroll و Adjustment ثبت شد.
- Master Data Registry برای Product، ProductGroup، Stone، Person، Customer، Supplier، Employee، BankAccount، CashBox، Currency، Unit، Warehouse، ProductionFormula، CostCenter و Branch طراحی شد.
- Central Business Event Bus و eventهای آینده مثل FinancialEventCreated، PaymentApproved، ProductImported، InventoryShortageDetected، ReceiptUploaded، ManagerDecisionSubmitted و CrisisSignalRaised ثبت شد.
- کد اجرایی، route، UI، auth، database، migration، localStorage و schema محک تغییر نکرد.

## جزئیات ثبت CONTROL-P18-BATCH

فایل‌های جدید:

- `docs/project-control/48_COCKPIT_DASHBOARD_CARD_MAP.md`
- `docs/project-control/49_MANAGER_REVIEW_UI_CONCEPT.md`
- `docs/project-control/50_AI_SUGGESTION_UI_AND_RISK_VISUAL_LANGUAGE.md`

نتیجه:

- نقشه کارت‌های cockpit برای financial pressure، cash-in/cash-out، bank import، installment، manager review، product warning، inventory، production، workforce، mobile receipt، AI suggestion و crisis signal ثبت شد.
- برای هر کارت هدف، داده ورودی، خروجی/اقدام، risk، confidence، drill-down و نیاز review طراحی شد.
- Manager Review UI برای weak match، receipt/bank conflict، installment medium confidence، duplicate، auto-fix، inventory mismatch، production formula risk، workforce risk و mobile receipt issue طراحی شد.
- AI Suggestion UI با suggestion، reason، confidence، risk flags، related data، required approval و audit reference ثبت شد.
- کد اجرایی، route، UI اصلی، auth، database، migration، repo و localStorage تغییر نکرد.

## جزئیات ثبت CONTROL-MAHAK-ARCH-01

فایل جدید:

- `docs/project-control/51_MAHAK_ARCHITECTURE_KNOWLEDGE_EXTRACTION.md`

نتیجه:

- محک به عنوان architecture knowledge reference و historical data source ثبت شد، نه بخشی از معماری مستر جم.
- الگوهای قابل استفاده شامل Header/Detail، BaseDocument، BaseDocumentItem، Master Data، Feature Based Product Model، Audit Trail، Status Based Soft Delete، View Based Reporting و Multi Currency Ready Design ثبت شد.
- انتقال مستقیم table structure، table names، column names، SQL schema، queryها و viewهای محک ممنوع ثبت شد.
- استفاده مجاز از داده‌های استخراج‌شده برای طراحی مدل داده، اعتبارسنجی هسته، تست import، مهاجرت داده‌های تاریخی و تحلیل رفتار کسب‌وکار ثبت شد.
- کد اجرایی، route، UI، auth، database، migration، repo، localStorage و پروژه `mahak-web-version` تغییر نکرد.

## جزئیات ثبت CONTROL-P17-BATCH

فایل‌های جدید:

- `docs/project-control/45_DESIGN_LAB_LAUNCH_BLUEPRINT.md`
- `docs/project-control/46_CENTRAL_COCKPIT_UI_UX_STRATEGY.md`
- `docs/project-control/47_DESIGN_TOKENS_AND_COMPONENT_PATTERN_STRATEGY.md`

نتیجه:

- Design Lab به عنوان فضای جدا از main برای prototype، tokens، component patterns، UX flows، screenshots و approved specs طراحی شد.
- ممنوعیت merge مستقیم، تغییر route اصلی، تغییر auth/database، ساخت migration و وابسته‌کردن main به prototype ثبت شد.
- استراتژی cockpit مرکزی با financial pressure، cash-in/cash-out، product/import warnings، inventory shortage، production risk، workforce risk، mobile receipt queue، AI suggestions، manager review queue و crisis signals طراحی شد.
- tokenهای اولیه و patternهای KPI Card، Risk Alert Card، Review Queue Card، AI Suggestion Card، Import Status Card، Financial Pressure Card، Product Warning Card، Timeline/History Card و Manager Decision Panel ثبت شد.
- کد اجرایی، route، UI اصلی، auth، database، migration، repo و localStorage تغییر نکرد.

## جزئیات ثبت CONTROL-P16-BATCH

فایل‌های جدید:

- `docs/project-control/42_IMPORT_DRY_RUN_REPORT_STANDARD.md`
- `docs/project-control/43_QUARANTINE_REVIEW_FLOW.md`
- `docs/project-control/44_IMPORT_SIMULATION_TEST_CASES.md`

نتیجه:

- Import Dry-run Report برای نمایش batch id، source، parsed/valid/invalid items، duplicate، conflict، auto-fix، review، approval، blocked، confidence، risk، affected records و rollback readiness طراحی شد.
- Quarantine Review Flow برای parse error، unknown format، missing required fields، conflict، low confidence، suspicious duplicate، unauthorized import attempt، unsafe auto action و failed validation طراحی شد.
- تصمیم‌های manager در quarantine شامل approve after correction، reject permanently، request correction، mark duplicate، map manually، split batch، retry parse و archive as unsafe ثبت شد.
- Import Simulation Test Cases برای valid/invalid bank Excel، duplicate bank transaction، mobile receipt، product Excel، stone bank، group code، production formula، inventory import، low confidence، conflict و manual only طراحی شد.
- کد اجرایی، route، UI، auth، database، migration، repo و localStorage تغییر نکرد.

## جزئیات ثبت CONTROL-P15-BATCH

فایل‌های جدید:

- `docs/project-control/39_EXTERNAL_DATA_STAGING_POLICY.md`
- `docs/project-control/40_APPROVED_IMPORT_FLOW_AND_IMPORT_GATE.md`
- `docs/project-control/41_IMPORT_ERROR_HANDLING_AND_ROLLBACK_POLICY.md`

نتیجه:

- External Data Staging Policy برای Bank Excel، Mobile receipt، Product Excel، Mahak export/import، Stone bank، Group codes، Production formula input، Inventory import و Workforce external input طراحی شد.
- وضعیت‌های staging شامل raw_received، parsed، normalized، validation_failed، duplicate_candidate، conflict، needs_review، auto_fix_suggested، approved_for_import، imported، rejected و quarantined ثبت شد.
- Approved Import Flow و Import Gate با dry-run report، audit reference و rollback plan طراحی شد.
- Error Handling و Rollback Policy برای parse error، validation error، duplicate conflict، wrong mapping، format changed، missing required field، low confidence، unauthorized import attempt و partial import failure ثبت شد.
- کد اجرایی، route، UI، auth، database، migration، repo و localStorage تغییر نکرد.

## جزئیات ثبت CONTROL-P14-BATCH

فایل‌های جدید:

- `docs/project-control/36_CROSS_MODULE_AI_SNAPSHOT_STRATEGY.md`
- `docs/project-control/37_MODULE_DATA_PRODUCER_CONSUMER_CONTRACTS.md`
- `docs/project-control/38_STAGING_REVIEW_AND_SAFE_IMPORT_BOUNDARY.md`

نتیجه:

- AI Snapshot Strategy برای تحلیل AI روی داده normalize و validate شده ثبت شد.
- ساختار snapshot شامل source، normalizedData، validationStatus، confidenceLevel، riskFlags، relatedEntities، summaryForAI، auditReference، generatedAt و version طراحی شد.
- قرارداد producer/consumer برای Finance، Product، Production، Inventory، Workforce، Mobile و Central Cockpit ثبت شد.
- Staging Boundary برای Bank Excel، Mobile receipt، Product Excel/Mahak export، Stone bank، Group codes، Production formula input و Inventory import طراحی شد.
- تصمیم‌های staging شامل accept، reject، needs review، duplicate candidate، conflict، auto-fix suggested و approved for import ثبت شد.
- کد اجرایی، route، UI، auth، database، migration، repo و localStorage تغییر نکرد.

## جزئیات ثبت CONTROL-P13-BATCH

فایل‌های جدید:

- `docs/project-control/33_CROSS_MODULE_AUTOMATION_MAP.md`
- `docs/project-control/34_CONFIDENCE_SCORING_MODEL.md`
- `docs/project-control/35_AUTO_ACTION_SAFETY_MATRIX.md`

نتیجه:

- نقشه جریان داده و اتوماسیون بین Finance، Product، Production، Inventory، Workforce، Mobile و Central Cockpit ثبت شد.
- مثال‌های cross-module شامل mobile receipt to financial event، bank Excel to installment confirmation، product import to inventory readiness، production formula to material requirement، inventory shortage to finance alert و finance pressure to cockpit crisis signal طراحی شد.
- مدل confidence با معیارهای completeness، validation، rule strength، duplicate/conflict risk، source reliability، historical consistency، manager-approved rule، match quality و AI certainty ثبت شد.
- سطح‌های high، medium، low، conflict و manual only به تصمیم‌های auto action، review، blocked و never auto action وصل شدند.
- ماتریس ایمنی auto action، review required و manual only ثبت شد.
- کد اجرایی، route، UI، auth، database، migration، repo و localStorage تغییر نکرد.

## جزئیات ثبت CONTROL-P12-BATCH

فایل‌های جدید:

- `docs/project-control/30_AUTOMATION_FIRST_AI_ASSISTED_ARCHITECTURE.md`
- `docs/project-control/31_HUMAN_IN_THE_LOOP_AND_CONFIDENCE_RULES.md`
- `docs/project-control/32_AI_ANALYSIS_PIPELINE_AND_AUDIT_TRAIL.md`

نتیجه:

- اصل Automation-First ثبت شد: سیستم داده را دریافت، normalize، validate، analyze و suggest می‌کند و فقط وقتی امن است auto action انجام می‌دهد.
- اصل AI-Assisted ثبت شد: AI کمک‌تحلیل‌گر و کمک‌تصمیم‌گیر است، نه جایگزین کنترل مدیریتی.
- کاربرد اصل در Finance، Product، Production، Inventory، Workforce، Mobile و Central Cockpit ثبت شد.
- Human-in-the-loop و سطح‌های confidence شامل high، medium، low، conflict و manual only تعریف شد.
- AI Analysis Pipeline شامل raw data intake، normalize، validate، confidence score، rule check، AI suggestion، human approval و audit trail ثبت شد.
- کد اجرایی، route، UI، auth، database، migration، repo و localStorage تغییر نکرد.

## جزئیات ثبت CONTROL-P11-BATCH

فایل‌های جدید:

- `docs/project-control/27_FINANCIAL_REVIEW_QUEUE_AND_DECISION_WORKFLOW.md`
- `docs/project-control/28_BANK_EXCEL_FORMAT_TEST_PLAN.md`
- `docs/project-control/29_BANK_RULE_MANAGEMENT_AND_INSTALLMENT_AUDIT.md`

نتیجه:

- Financial Review Queue برای mismatch رسید/بانک، duplicate candidate، weak bank match، تراکنش بدون رسید، قسط با اطمینان متوسط، پرداخت حساس، اصلاحیه مالی و اختلاف مبلغ/تاریخ طراحی شد.
- تصمیم‌های مدیر شامل approve، reject، request correction، attach to existing event، create new event، confirm installment، mark as duplicate و ignore as irrelevant ثبت شد.
- Bank Excel Format Test Plan برای ستون‌های اصلی، تغییر قالب، نبود ستون، جابه‌جایی ستون‌ها، مبلغ/تاریخ نامعتبر، توضیحات خالی، برداشت/واریز همزمان، duplicate transaction و فایل تکراری طراحی شد.
- Bank Rule Management و Installment Auto Confirmation Audit با versioning، change log و محدودیت‌های auto confirm ثبت شد.
- کد اجرایی، route، UI، auth، database، migration و localStorage تغییر نکرد.

## جزئیات ثبت CONTROL-P10-BATCH

فایل‌های جدید:

- `docs/project-control/23_FINANCIAL_VALIDATION_AND_IMPORT_DECISION_FLOW.md`
- `docs/project-control/24_RECEIPT_REVIEW_AND_BANK_MATCH_CONFIDENCE.md`
- `docs/project-control/25_FINANCIAL_LIQUIDITY_ALERT_AND_APPROVAL_RULES.md`
- `docs/project-control/26_BANK_EXCEL_AUTOMATION_AND_RULE_MATCHER.md`

نتیجه:

- Financial Validation Rules و Financial Import Decision Flow برای تصمیم‌های allowed، blocked، review، attach، create، confirm installment، correction و duplicate candidate طراحی شد.
- Receipt Review Flow و Bank Match Confidence با سطح‌های exact، strong، weak، conflict و no match طراحی شد.
- Liquidity Alert Rules و Manager Approval Boundary برای پرداخت حساس، اختلاف رسید/بانک، پرداخت بدون سند و اصلاحیه مالی ثبت شد.
- Daily Bank Excel Import، Bank Transaction Normalizer، Transaction Description Matcher، Rule-based Financial Detection، Installment Auto Confirmation و Receipt Attachment Link طراحی شد.
- کد اجرایی، route، UI، auth، database، migration و localStorage تغییر نکرد.

## جزئیات ثبت CONTROL-P9-BATCH

فایل‌های جدید:

- `docs/project-control/20_FINANCIAL_SCHEMA_AND_ADAPTER_BOUNDARY.md`
- `docs/project-control/21_FINANCIAL_APPROVAL_AND_LIQUIDITY_FLOW.md`
- `docs/project-control/22_RECEIPT_AND_BANK_TRANSACTION_MAPPING.md`

نتیجه:

- Financial Schema Draft با ارتباط receipt، bank transaction، employee، product، production، paymentStatus، approvalStatus، dataSource و audit trail طراحی شد.
- Financial Adapter Boundary برای جلوگیری از merge مستقیم `audit-app` و ورود کنترل‌شده داده مالی ثبت شد.
- approval flow و liquidity model با نقش‌های recorder، reviewer، manager و admin طراحی شد.
- receipt attachment و bank transaction mapping با شماره پیگیری، تاریخ، مبلغ، مبدا، مقصد و توضیحات طراحی شد.
- کد اجرایی، route، UI، auth، database، migration و localStorage تغییر نکرد.

## جزئیات ثبت CONTROL-P8-BATCH

فایل‌های جدید:

- `docs/project-control/17_PARALLEL_WORKSTREAM_AND_REPO_STRATEGY.md`
- `docs/project-control/18_MULTI_CODEX_HANDOFF_PROTOCOL.md`
- `docs/project-control/19_MERGE_APPROVAL_CHECKLIST.md`

نتیجه:

- نقش repo اصلی `mrgem-main-system` و repoهای lab آینده ثبت شد.
- نقش Codexهای کد اصلی، کالا، پول، دیزاین و موبایل آینده ثبت شد.
- قانون کار همزمان ثبت شد: هیچ دو Codex نباید همزمان یک فایل مشترک را تغییر دهند.
- Design Lab به عنوان repo جدا برای UI/UX، tokens و component patterns ثبت شد؛ merge مستقیم ممنوع است.
- handoff protocol با git status، محدوده مجاز، گزارش استاندارد، commit hash و push status ثبت شد.
- merge approval checklist با docs، boundary، test/build، route/storage، migration، rollback و approval ثبت شد.
- کد اجرایی، route، UI، database، migration، localStorage و repo جدید تغییر/ساخته نشد.

## جزئیات ثبت CONTROL-P7-BATCH

فایل‌های بسته:

- `docs/project-control/14_PRODUCT_IMPORT_VALIDATOR_AND_DUPLICATE_DETECTOR.md`
- `docs/project-control/15_PRODUCT_AUTOFIX_AND_REVIEW_QUEUE.md`
- `docs/project-control/16_MAHAK_EXPORT_AND_AI_PRODUCT_SNAPSHOT.md`

نتیجه:

- بخش A بسته با فایل ۱۴ پوشش داده شد: validator، duplicate detector، سطح هشدارها و تصمیم‌های ورود کالا.
- بخش B ساخته شد: auto-fix rules، خطاهای قابل اصلاح، خطاهای نیازمند تأیید مدیر، review queue و correction log.
- بخش C ساخته شد: Mahak Export Adapter، کنترل‌های قبل از خروجی محک، ریسک‌های خروجی محک و AI Product Snapshot.
- backlog برای Product Correction Log، decision flow، duplicate resolution و Mahak Export Adapter تکمیل شد.
- کد اجرایی، route، UI، database، migration و localStorage تغییر نکرد.

## جزئیات ثبت CONTROL-P7

فایل جدید:

- `docs/project-control/14_PRODUCT_IMPORT_VALIDATOR_AND_DUPLICATE_DETECTOR.md`

نتیجه:

- `Product Import Validator` برای بررسی داده کالا قبل از ورود به مستر جم طراحی شد.
- قوانین اعتبارسنجی field-level برای کد کالا، بارکد، نام، گروه، کد محک، وزن، اجرت، قیمت، سنگ، statusها و dataSource ثبت شد.
- `Product Duplicate Detector` برای تشخیص تکراری بر اساس barcode، productCode، mahakCode، ترکیب نام/وزن/سنگ/گروه، شباهت نام و اختلاف نگارشی طراحی شد.
- سطح هشدارها ثبت شد: Error، Warning، Info و Auto-fix candidate.
- خروجی‌ها ثبت شد: `ProductImportReport`، `DuplicateProductWarning`، `ProductValidationError`، `ProductAutoFixSuggestion` و `ProductImportDecision`.
- تصمیم‌های ورود ثبت شد: Import allowed، Import blocked، Needs review، Merge candidate، Update existing product و Create new product.
- کد اجرایی، route، UI، database، migration و localStorage تغییر نکرد.

## جزئیات ثبت CONTROL-P6

فایل جدید:

- `docs/project-control/13_PRODUCT_SCHEMA_AND_ADAPTER_BOUNDARY.md`

نتیجه:

- `Product Schema Draft` برای ورود احتمالی کالا به database آینده طراحی شد.
- `Product Adapter Boundary` برای اتصال آینده `mahak-web-version` بدون merge مستقیم ثبت شد.
- ورودی‌های adapter ثبت شد: خروجی Excel محک، بانک سنگ، کد گروه‌ها، بارکدها، فایل‌های کالا و خروجی AI-ready.
- خروجی‌های adapter ثبت شد: `ProductNormalizedRecord`، `ProductImportReport`، `DuplicateProductWarning`، `MahakExportPreview` و `AIProductSnapshot`.
- قوانین امنیتی ثبت شد: هیچ داده‌ای مستقیم وارد database اصلی نشود؛ adapter اول normalize و سپس گزارش خطا/تکراری بسازد؛ UI یا migration فقط با تأیید مرکز فرمان.
- ریسک‌ها ثبت شد: تکراری شدن کالا، اختلاف کد محک با کد داخلی، خطای بارکد، خطای وزن/اجرت، خرابی خروجی محک و وابستگی مستقیم به فایل‌های قدیمی پروژه کالا.
- کد اجرایی، route، UI، database، migration و localStorage تغییر نکرد.

## جزئیات ثبت CONTROL-P5

فایل جدید:

- `docs/project-control/12_CORE_FINANCIAL_EVENT_MODEL.md`

نتیجه:

- `Core Financial Event Model` برای دریافت، پرداخت، خرید، فروش، هزینه، حقوق، بدهی، طلب، انتقال بانکی، چک، نقدینگی، هزینه تولید، اصلاحیه مالی و تایید مدیر طراحی شد.
- موارد قابل استخراج آینده از `audit-app` ثبت شد: مدل نقدینگی، schema مالی، نقش‌ها، RLS، تایید مدیر، داشبورد بحران نقدینگی و جریان ثبت/بررسی/تایید.
- موارد ممنوع ثبت شد: merge مستقیم `audit-app`، تغییر auth اصلی، تغییر database اصلی، ساخت migration، ساخت UI مالی، تغییر route و تغییر localStorage.
- ترتیب امن آینده ثبت شد: مدل مفهومی، schema پیشنهادی، adapter boundary، تست با داده نمونه، UI، اتصال رسیدها، و migration فقط با اجازه مرکز فرمان.
- کد اجرایی، route، UI، auth، database، migration و localStorage تغییر نکرد.

## جزئیات ثبت CONTROL-P4

فایل جدید:

- `docs/project-control/11_CORE_PRODUCT_MODEL.md`

نتیجه:

- `Core Product Model` برای کالا، بارکد، گروه کالا، سنگ، وزن، اجرت، قیمت، موجودی، تولید، خروجی محک و AI-ready export طراحی شد.
- موارد قابل استخراج آینده از `mahak-web-version` ثبت شد: مدل کالا، بارکد، بانک سنگ، کد گروه، خروجی Excel محک، کنترل تکراری و خروجی قابل تحلیل برای AI.
- موارد ممنوع ثبت شد: merge مستقیم `mahak-web-version`، تغییر database اصلی، ساخت UI کالا، migration، تغییر route و تغییر localStorage.
- ترتیب امن آینده ثبت شد: مدل مفهومی، schema پیشنهادی، adapter، تست روی داده نمونه، UI، و migration فقط با اجازه مرکز فرمان.
- کد اجرایی، route، UI، database، migration و localStorage تغییر نکرد.

## جزئیات ثبت WF-P31

فایل صفحه:

- `src/pages/workforce/system/DataCenterPage.tsx`

فایل‌های تغییرکرده در WF-P31:

- `src/WorkforcePages.tsx`
- `src/pages/workforce/system/DataCenterPage.tsx`
- `src/pages/workforce/workforcePageUtils.ts`
- `tests/analysis.test.ts`

نتیجه:

- `DataCenterPage` از adapter به صفحه واقعی تبدیل شد.
- `WorkforcePages.tsx`: `4331` خط به `4119` خط.
- کاهش تقریبی: `212` خط.
- `npm test`: موفق.
- `npm run build`: موفق.
- build warning جدی: ندارد.
- route جدید: ندارد.
- localStorage key جدید: ندارد.
- تغییر docs در زمان اجرای WF-P31: ندارد.
- تغییر رفتار UI: ندارد.
- commit اجرایی: `85d0df5 refactor: extract DataCenterPage`
- هشدار باقی‌مانده: `WorkforcePages.tsx` هنوز بزرگ است، ولی `MaintenancePage`، `HistoryRetentionPage`، `OperationalHistoryPage` و `DataCenterPage` جدا شده‌اند.

## جزئیات ثبت CONTROL-P3

فایل جدید:

- `docs/project-control/10_FUTURE_MODULES_ROADMAP.md`

نتیجه:

- نقشه آینده Workforce، Finance، Product، Production، Inventory، Receipts، Mahak Integration، Mobile App، AI Analysis و Central Cockpit ثبت شد.
- تصمیم ثبت شد که قبل از کاهش بدهی معماری WF، ماژول جدید شروع نشود.
- `audit-app` و `mahak-web-version` همچنان Subproject هستند و merge مستقیم ندارند.
- مدل‌های پایه آینده ثبت شدند: `Core Product Model`، `Core Financial Event Model`، `Core Inventory Model`، `Production Flow Model`، `Receipt Capture Flow` و `Central Cockpit Dashboard Map`.
- کد اجرایی، route، UI، migration و localStorage تغییر نکرد.

## جزئیات ثبت WF-P30

فایل صفحه:

- `src/pages/workforce/system/OperationalHistoryPage.tsx`

فایل‌های تغییرکرده در WF-P30:

- `src/WorkforcePages.tsx`
- `src/pages/workforce/system/OperationalHistoryPage.tsx`
- `tests/analysis.test.ts`

نتیجه:

- `WorkforcePages.tsx`: `4733` خط به `4614` خط.
- `npm test`: موفق.
- `npm run build`: موفق.
- build warning: ندارد.
- route جدید: ندارد.
- localStorage key جدید: ندارد.
- تغییر رفتار UI: ندارد.
- هشدار باقی‌مانده: `WorkforcePages.tsx` هنوز بزرگ است و `DataCenterPage` هنوز adapter/compat دارد.

## جزئیات ثبت WF-P29

فایل‌های موجود:

- `src/pages/workforce/system/MaintenancePage.tsx`
- `src/pages/workforce/operations/HistoryRetentionPage.tsx`
- `src/pages/workforce/workforcePageUtils.ts`

نتیجه:

- `WorkforcePages.tsx`: حدود `5028` خط به `4733` خط.
- `npm test`: موفق.
- `npm run build`: موفق.
- route جدید: ندارد.
- localStorage key جدید: ندارد.
- تغییر رفتار UI: ندارد.

## P پیشنهادی بعدی

طراحی `Document Approval Status Model` و `Document Audit Trail Boundary`، یا ادامه `Product Feature Engine` بدون کدنویسی، فقط پس از تأیید مرکز کنترل.

## قالب ثبت فاز بعدی

برای هر P جدید، این موارد ثبت شود:

- تاریخ اجرا
- شاخه و کد فاز
- هدف
- فایل‌های تغییرکرده
- route impact
- localStorage impact
- model/service/analyzer impact
- تست‌ها
- نتیجه build
- warningها
- ریسک باقی‌مانده
- پیشنهاد P بعدی
