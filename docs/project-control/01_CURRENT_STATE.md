# Current State

آخرین به‌روزرسانی: 2026-06-29

## وضعیت فعلی پروژه

پروژه فعلی یک داشبورد مدیریتی فارسی، راست‌به‌چپ و dark mode برای ماژول نیروی انسانی مستر جم است. تمرکز اجرایی فعلی روی شاخه `WF` است: «داشبورد هفتگی تحلیل‌گر مکان و زمان کارمندان».

اپ با React، TypeScript و Vite ساخته شده و فعلاً backend، Supabase، login، sync خارجی یا notification واقعی ندارد. داده‌ها local-first هستند و با serviceهای داخلی و localStorage مدیریت می‌شوند.

## آخرین P قطعی

آخرین P اجرایی و کدی verify شده: **WF-P31**

آخرین کار کنترل پروژه تکمیل‌شده: **CONTROL-P28-BATCH**

## وضعیت CONTROL-P28-BATCH

CONTROL-P28-BATCH انجام شد. در این فاز فقط `docs/project-control` تغییر کرد و هیچ کد اجرایی، prototype واقعی، repo، route، UI، component، migration، auth، database، localStorage، داده واقعی یا schema محک اضافه نشد.

- فایل Product Import Prototype Approval Review ساخته شد: `docs/project-control/79_PRODUCT_IMPORT_PROTOTYPE_APPROVAL_REVIEW.md`
- فایل Product Import Design Lab Transition Plan ساخته شد: `docs/project-control/80_PRODUCT_IMPORT_DESIGN_LAB_TRANSITION_PLAN.md`
- فایل Product Import Implementation Hold Policy ساخته شد: `docs/project-control/81_PRODUCT_IMPORT_IMPLEMENTATION_HOLD_POLICY.md`
- وضعیت رسمی `DESIGN_REVIEW_APPROVED` و `Design Lab Planning: APPROVED` ثبت شد.
- وضعیت `Prototype Build: NOT_APPROVED` و `Implementation: NOT_APPROVED` باقی ماند.
- خروجی‌های مجاز Design Lab و شرایط سخت‌گیرانه رفع Implementation Hold طراحی شدند.

## وضعیت CONTROL-P27-BATCH

CONTROL-P27-BATCH انجام شد. در این فاز فقط `docs/project-control` تغییر کرد و هیچ کد اجرایی، prototype واقعی، repo، route، UI، component، migration، auth، database، localStorage، داده واقعی یا schema محک اضافه نشد.

- فایل Product Import Prototype Charter ساخته شد: `docs/project-control/76_PRODUCT_IMPORT_PROTOTYPE_CHARTER.md`
- فایل Product Import Synthetic Data Protocol ساخته شد: `docs/project-control/77_PRODUCT_IMPORT_SYNTHETIC_DATA_PROTOCOL.md`
- فایل Product Import Prototype Isolation Boundary ساخته شد: `docs/project-control/78_PRODUCT_IMPORT_PROTOTYPE_ISOLATION_BOUNDARY.md`
- هدف، پرسش‌ها، خروجی‌ها، معیار موفقیت و توقف prototype آینده ثبت شد.
- سناریوها و قرارداد sampleهای synthetic data بدون اطلاعات واقعی طراحی شدند.
- مرز جدایی prototype از main data، production storage، محک، auth، route و approval واقعی ثبت شد.

## وضعیت CONTROL-P26-BATCH

CONTROL-P26-BATCH انجام شد. در این فاز فقط `docs/project-control` تغییر کرد و هیچ کد اجرایی، route، UI واقعی، component، migration، auth، database، localStorage یا schema محک اضافه نشد.

- فایل Product Import Batch Split Flow ساخته شد: `docs/project-control/73_PRODUCT_IMPORT_BATCH_SPLIT_FLOW.md`
- فایل Product Data Quality Threshold Policy ساخته شد: `docs/project-control/74_PRODUCT_DATA_QUALITY_THRESHOLD_POLICY.md`
- فایل Product Import Architecture Readiness Report ساخته شد: `docs/project-control/75_PRODUCT_IMPORT_ARCHITECTURE_READINESS_REPORT.md`
- جریان split برای approved، review، quarantine، rejected و correction-required sub-batch با parent/audit continuity طراحی شد.
- thresholdهای کیفیت، سطح‌های excellent تا blocked و blockerهای قطعی ثبت شدند؛ هیچ مقدار اجرایی hardcode نشد.
- معماری Product Import برای Design Lab/prototype ایزوله آینده آماده ارزیابی شد، اما پیاده‌سازی واقعی همچنان نیازمند approval جداگانه است.

## وضعیت CONTROL-P25-BATCH

CONTROL-P25-BATCH انجام شد. در این فاز فقط `docs/project-control` تغییر کرد و هیچ کد اجرایی، route، UI واقعی، component، migration، auth، database، localStorage یا schema محک اضافه نشد.

- فایل Product Import Batch Decision Contract ساخته شد: `docs/project-control/70_PRODUCT_IMPORT_BATCH_DECISION_CONTRACT.md`
- فایل Product Review Metrics Read Model ساخته شد: `docs/project-control/71_PRODUCT_REVIEW_METRICS_READ_MODEL.md`
- فایل Product Import Manager Decision Report ساخته شد: `docs/project-control/72_PRODUCT_IMPORT_MANAGER_DECISION_REPORT.md`
- تصمیم‌های batch برای import کامل، فقط معتبرها، پس از review، quarantine، reject، split، correction و dry-run طراحی شد.
- مدل read-only شاخص‌های review، blocker، duplicate، auto-fix، escalation، confidence و issue/source quality ثبت شد.
- گزارش مدیریتی برای Quality Gate، blockerها، review، duplicate/conflict، AI suggestion، risk و approval طراحی شد.

## وضعیت CONTROL-P24-BATCH

CONTROL-P24-BATCH انجام شد. در این فاز فقط `docs/project-control` تغییر کرد و هیچ کد اجرایی، route، UI واقعی، component، migration، auth، database، localStorage یا schema محک اضافه نشد.

- فایل Product Feature Review UI Contract ساخته شد: `docs/project-control/67_PRODUCT_FEATURE_REVIEW_UI_CONTRACT.md`
- فایل Product Import Quality Gate ساخته شد: `docs/project-control/68_PRODUCT_IMPORT_QUALITY_GATE.md`
- فایل Product Feature Decision Audit Model ساخته شد: `docs/project-control/69_PRODUCT_FEATURE_DECISION_AUDIT_MODEL.md`
- قرارداد UI آینده برای نمایش raw/normalized value، validation، confidence، risk، source، AI suggestion و duplicate/conflict signals طراحی شد.
- شرط‌های عبور، تصمیم‌ها و blockerهای Quality Gate ورود کالا ثبت شد.
- audit تصمیم reviewer/manager، manager override و approval boundary برای featureهای حساس طراحی شد.

## وضعیت CONTROL-P23-BATCH

CONTROL-P23-BATCH انجام شد. در این فاز فقط `docs/project-control` تغییر کرد و هیچ کد اجرایی، route، UI، migration، auth، database، localStorage یا schema محک اضافه نشد.

- فایل Product Feature Review Queue ساخته شد: `docs/project-control/64_PRODUCT_FEATURE_REVIEW_QUEUE.md`
- فایل Product Attribute Validation Report ساخته شد: `docs/project-control/65_PRODUCT_ATTRIBUTE_VALIDATION_REPORT.md`
- فایل Product Feature Auto-fix Decision Flow ساخته شد: `docs/project-control/66_PRODUCT_FEATURE_AUTOFIX_DECISION_FLOW.md`
- صف review برای feature ناشناخته/ناقص، type/unit نامعتبر، وزن مشکوک، duplicate barcode، mismatch سنگ/گروه، conflict و low confidence طراحی شد.
- گزارش read-only اعتبارسنجی برای import dry-run، cockpit، manager review، AI snapshot و خروجی آینده محک ثبت شد.
- مرز auto-fix کم‌ریسک، review اجباری تغییرهای حساس و correction/audit trail طراحی شد.

## وضعیت CONTROL-P22-BATCH

CONTROL-P22-BATCH انجام شد. در این فاز فقط `docs/project-control` تغییر کرد و هیچ کد اجرایی، route، UI، migration، auth، database، localStorage یا schema محک اضافه نشد.

- فایل Product Feature Validation Rules ساخته شد: `docs/project-control/61_PRODUCT_FEATURE_VALIDATION_RULES.md`
- فایل Product Feature AI Snapshot ساخته شد: `docs/project-control/62_PRODUCT_FEATURE_AI_SNAPSHOT.md`
- فایل Product Feature Import Mapping and Review Boundary ساخته شد: `docs/project-control/63_PRODUCT_FEATURE_IMPORT_MAPPING_AND_REVIEW_BOUNDARY.md`
- قوانین validation برای required، type، unit، range، enum، reference، duplicate-sensitive، pricing-impact، production-impact، inventory-impact و AI-risk طراحی شد.
- snapshot مخصوص AI برای featureSummary، requiredFeatureStatus، missingFeatures، validationWarnings، duplicateSignals، pricing/production/inventory impact و confidence/risk summary ثبت شد.
- مرز import mapping و review برای featureهای ناشناخته، واحد اشتباه، وزن مشکوک، بارکد تکراری، mismatch سنگ/گروه، conflict و low confidence طراحی شد.

## وضعیت CONTROL-P21-BATCH

CONTROL-P21-BATCH انجام شد. در این فاز فقط `docs/project-control` تغییر کرد و هیچ کد اجرایی، route، UI، migration، auth، database، localStorage یا schema محک اضافه نشد.

- فایل Product Feature Engine ساخته شد: `docs/project-control/58_PRODUCT_FEATURE_ENGINE.md`
- فایل Core Product Attribute Model ساخته شد: `docs/project-control/59_CORE_PRODUCT_ATTRIBUTE_MODEL.md`
- فایل Product Variant, Pricing and Production Feature Boundary ساخته شد: `docs/project-control/60_PRODUCT_VARIANT_PRICING_AND_PRODUCTION_FEATURE_BOUNDARY.md`
- Product Feature Engine به عنوان لایه مفهومی ویژگی‌های قابل توسعه کالا، validation rule، searchable/reportable feature و AI-ready summary طراحی شد.
- Core Product Attribute Model شامل attributeId، productId، attributeKey، attributeType، attributeValue، validationStatus، confidenceLevel، riskFlags و auditReference ثبت شد.
- مرز variant، pricing و production feature بدون پیاده‌سازی pricing engine یا production formula مشخص شد.

## وضعیت CONTROL-P20-BATCH

CONTROL-P20-BATCH انجام شد. در این فاز فقط `docs/project-control` تغییر کرد و هیچ کد اجرایی، route، UI، migration، auth، database، localStorage یا schema محک اضافه نشد.

- فایل Document Status and Approval Model ساخته شد: `docs/project-control/55_DOCUMENT_STATUS_AND_APPROVAL_MODEL.md`
- فایل Document Audit Trail and Change Log Boundary ساخته شد: `docs/project-control/56_DOCUMENT_AUDIT_TRAIL_AND_CHANGE_LOG_BOUNDARY.md`
- فایل Reporting View Layer and Read Model Strategy ساخته شد: `docs/project-control/57_REPORTING_VIEW_LAYER_AND_READ_MODEL_STRATEGY.md`
- وضعیت‌های سند و تایید مدیر برای draft، submitted، under_review، correction_requested، approved، rejected، finalized، cancelled و archived طراحی شد.
- audit trail سند برای actionTypeهای create، submit، approve، reject، request_correction، update، finalize، cancel، rollback، attach_receipt و import_from_staging ثبت شد.
- reporting layer به عنوان لایه read-only از event، snapshot، document و audit data طراحی شد.

## وضعیت CONTROL-P19-BATCH

CONTROL-P19-BATCH انجام شد. در این فاز فقط `docs/project-control` تغییر کرد و هیچ کد اجرایی، route، UI، migration، auth، database، localStorage یا schema محک اضافه نشد.

- فایل Core Document Architecture ساخته شد: `docs/project-control/52_CORE_DOCUMENT_ARCHITECTURE.md`
- فایل Master Data Registry ساخته شد: `docs/project-control/53_MASTER_DATA_REGISTRY.md`
- فایل Core Business Event Bus ساخته شد: `docs/project-control/54_CORE_BUSINESS_EVENT_BUS.md`
- BaseDocument و BaseDocumentItem به صورت مفهومی و مستقل از محک طراحی شدند.
- master dataهای اصلی شامل Product، ProductGroup، Stone، Person، Customer، Supplier، Employee، BankAccount، CashBox، Currency، Unit، Warehouse، ProductionFormula، CostCenter و Branch ثبت شدند.
- Central Business Event Bus به عنوان event bus مفهومی برای Automation-First، AI-Assisted و Central Cockpit طراحی شد.

## وضعیت CONTROL-P18-BATCH

CONTROL-P18-BATCH انجام شد. در این فاز فقط `docs/project-control` تغییر کرد و هیچ کد اجرایی، route، UI اصلی، migration، auth، database، repo یا localStorage تغییر داده نشد.

- فایل Cockpit Dashboard Card Map ساخته شد: `docs/project-control/48_COCKPIT_DASHBOARD_CARD_MAP.md`
- فایل Manager Review UI Concept ساخته شد: `docs/project-control/49_MANAGER_REVIEW_UI_CONCEPT.md`
- فایل AI Suggestion UI and Risk Visual Language ساخته شد: `docs/project-control/50_AI_SUGGESTION_UI_AND_RISK_VISUAL_LANGUAGE.md`
- کارت‌های اصلی cockpit شامل Financial Pressure، Cash-in/Cash-out، Bank Import Status، Installment Confirmation، Manager Review Queue، Product Import Warning، Inventory Shortage، Production Risk، Workforce Risk، Mobile Receipt Queue، AI Suggestion و Crisis Signal طراحی شد.
- مفهوم UI تصمیم مدیر برای weak match، conflict، duplicate، auto-fix candidate، mismatch، formula risk، workforce risk و mobile receipt issue ثبت شد.
- زبان دیداری risk و confidence برای low، medium، high، conflict و manual only طراحی شد.

## وضعیت CONTROL-MAHAK-ARCH-01

CONTROL-MAHAK-ARCH-01 انجام شد. در این فاز فقط `docs/project-control` تغییر کرد و هیچ کد اجرایی، route، UI، migration، auth، database، repo، localStorage یا merge پروژه محک انجام نشد.

- فایل Mahak Architecture Knowledge Extraction ساخته شد: `docs/project-control/51_MAHAK_ARCHITECTURE_KNOWLEDGE_EXTRACTION.md`
- ثبت شد که محک بخشی از معماری مستر جم نیست و فقط مرجع دانش معماری، تجربه طراحی و داده تاریخی است.
- الگوهای قابل استفاده ثبت شد: Header/Detail، BaseDocument، BaseDocumentItem، Master Data، Feature Based Product Model، Audit Trail، Status Based Soft Delete، View Based Reporting و Multi Currency Ready Design.
- انتقال مستقیم جدول‌ها، ستون‌ها، schema، queryها و viewهای محک ممنوع ثبت شد.
- استفاده مجاز از داده‌های استخراج‌شده فقط برای طراحی مدل داده، اعتبارسنجی هسته، تست import، مهاجرت داده تاریخی و تحلیل رفتار کسب‌وکار ثبت شد.

## وضعیت CONTROL-P17-BATCH

CONTROL-P17-BATCH انجام شد. در این فاز فقط `docs/project-control` تغییر کرد و هیچ کد اجرایی، route، UI اصلی، migration، auth، database، repo یا localStorage تغییر داده نشد.

- فایل Design Lab Launch Blueprint ساخته شد: `docs/project-control/45_DESIGN_LAB_LAUNCH_BLUEPRINT.md`
- فایل Central Cockpit UI UX Strategy ساخته شد: `docs/project-control/46_CENTRAL_COCKPIT_UI_UX_STRATEGY.md`
- فایل Design Tokens and Component Pattern Strategy ساخته شد: `docs/project-control/47_DESIGN_TOKENS_AND_COMPONENT_PATTERN_STRATEGY.md`
- Design Lab به عنوان فضای جدا برای cockpit prototype، dashboard cards، design tokens، component patterns، layout experiments، mobile concepts، finance/product dashboards و production/inventory concepts تعریف شد.
- کابین مرکزی برای financial pressure، cash-in/cash-out، product/import warnings، inventory shortage، production risk، workforce risk، mobile receipt queue، AI suggestions، manager review queue و crisis signals طراحی مفهومی شد.
- قانون ثبت شد که هیچ component یا prototype از Design Lab مستقیم وارد main نشود و ابتدا باید pattern/spec تایید شود.

## وضعیت CONTROL-P16-BATCH

CONTROL-P16-BATCH انجام شد. در این فاز فقط `docs/project-control` تغییر کرد و هیچ کد اجرایی، route، UI، migration، auth، database، repo یا localStorage تغییر داده نشد.

- فایل Import Dry-run Report Standard ساخته شد: `docs/project-control/42_IMPORT_DRY_RUN_REPORT_STANDARD.md`
- فایل Quarantine Review Flow ساخته شد: `docs/project-control/43_QUARANTINE_REVIEW_FLOW.md`
- فایل Import Simulation Test Cases ساخته شد: `docs/project-control/44_IMPORT_SIMULATION_TEST_CASES.md`
- استاندارد dry-run شامل import batch id، source، parsed/valid/invalid items، duplicate candidates، conflicts، auto-fix suggestions، needs review، blocked items، confidence summary، risk flags، affected records و rollback readiness ثبت شد.
- جریان quarantine برای parse error، unknown format، missing required fields، conflict، low confidence، suspicious duplicate، unauthorized import attempt، unsafe auto action، failed validation و mapping ناسازگار طراحی شد.
- سناریوهای شبیه‌سازی import برای Bank Excel، Mobile receipt، Product Excel، Stone bank، Group codes، Production formula و Inventory import ثبت شد.

## وضعیت CONTROL-P15-BATCH

CONTROL-P15-BATCH انجام شد. در این فاز فقط `docs/project-control` تغییر کرد و هیچ کد اجرایی، route، UI، migration، auth، database، repo یا localStorage تغییر داده نشد.

- فایل External Data Staging Policy ساخته شد: `docs/project-control/39_EXTERNAL_DATA_STAGING_POLICY.md`
- فایل Approved Import Flow and Import Gate ساخته شد: `docs/project-control/40_APPROVED_IMPORT_FLOW_AND_IMPORT_GATE.md`
- فایل Import Error Handling and Rollback Policy ساخته شد: `docs/project-control/41_IMPORT_ERROR_HANDLING_AND_ROLLBACK_POLICY.md`
- وضعیت‌های staging شامل raw_received، parsed، normalized، validation_failed، duplicate_candidate، conflict، needs_review، auto_fix_suggested، approved_for_import، imported، rejected و quarantined ثبت شد.
- Import Gate با شرط‌های validation passed، no unresolved conflict، no blocking duplicate، confidence acceptable، required fields complete، manager approval if sensitive، audit reference و rollback plan طراحی شد.
- سیاست خطا و rollback برای parse error، validation error، duplicate conflict، wrong mapping، format changed، missing required field، low confidence، unauthorized import attempt و partial import failure ثبت شد.

## وضعیت CONTROL-P14-BATCH

CONTROL-P14-BATCH انجام شد. در این فاز فقط `docs/project-control` تغییر کرد و هیچ کد اجرایی، route، UI، migration، auth، database، repo یا localStorage تغییر داده نشد.

- فایل Cross-module AI Snapshot Strategy ساخته شد: `docs/project-control/36_CROSS_MODULE_AI_SNAPSHOT_STRATEGY.md`
- فایل Module Data Producer/Consumer Contracts ساخته شد: `docs/project-control/37_MODULE_DATA_PRODUCER_CONSUMER_CONTRACTS.md`
- فایل Staging Review and Safe Import Boundary ساخته شد: `docs/project-control/38_STAGING_REVIEW_AND_SAFE_IMPORT_BOUNDARY.md`
- استاندارد snapshot شامل source، normalizedData، validationStatus، confidenceLevel، riskFlags، relatedEntities، summaryForAI، auditReference، generatedAt و version ثبت شد.
- قرارداد تولید/مصرف داده برای Finance، Product، Production، Inventory، Workforce، Mobile و Central Cockpit ثبت شد.
- مسیر امن ورود داده خارجی از raw input تا staging، normalize، validate، duplicate/conflict check، confidence score، review، approved import و audit trail طراحی شد.

## وضعیت CONTROL-P13-BATCH

CONTROL-P13-BATCH انجام شد. در این فاز فقط `docs/project-control` تغییر کرد و هیچ کد اجرایی، route، UI، migration، auth، database، repo یا localStorage تغییر داده نشد.

- فایل Cross-module Automation Map ساخته شد: `docs/project-control/33_CROSS_MODULE_AUTOMATION_MAP.md`
- فایل Confidence Scoring Model ساخته شد: `docs/project-control/34_CONFIDENCE_SCORING_MODEL.md`
- فایل Auto Action Safety Matrix ساخته شد: `docs/project-control/35_AUTO_ACTION_SAFETY_MATRIX.md`
- جریان داده و اتوماسیون بین Finance، Product، Production، Inventory، Workforce، Mobile و Central Cockpit طراحی شد.
- معیارهای confidence شامل data completeness، validation result، rule match strength، duplicate risk، conflict risk، source reliability، historical consistency، manager-approved rule، match quality و AI suggestion certainty ثبت شد.
- مرز auto action، review required و manual only برای اقدام‌های بین‌ماژولی مشخص شد.

## وضعیت CONTROL-P12-BATCH

CONTROL-P12-BATCH انجام شد. در این فاز فقط `docs/project-control` تغییر کرد و هیچ کد اجرایی، route، UI، migration، auth، database، repo یا localStorage تغییر داده نشد.

- فایل اصل معماری Automation-First و AI-Assisted ساخته شد: `docs/project-control/30_AUTOMATION_FIRST_AI_ASSISTED_ARCHITECTURE.md`
- فایل Human-in-the-loop و confidence rules ساخته شد: `docs/project-control/31_HUMAN_IN_THE_LOOP_AND_CONFIDENCE_RULES.md`
- فایل AI Analysis Pipeline و audit trail ساخته شد: `docs/project-control/32_AI_ANALYSIS_PIPELINE_AND_AUDIT_TRAIL.md`
- اصل مشترک ثبت شد: data enters، system normalizes، system validates، system analyzes، system suggests، system auto-acts only when safe، human reviews risky or uncertain cases و everything is logged.
- این اصل برای Finance، Product، Production، Inventory، Workforce، Mobile و Central Cockpit تعریف شد.
- تأکید شد که AI کمک‌تحلیل‌گر است و تصمیم‌های حساس باید confidence، rule version، audit trail و در صورت نیاز تایید انسانی داشته باشند.

## وضعیت CONTROL-P11-BATCH

CONTROL-P11-BATCH انجام شد. در این فاز فقط `docs/project-control` تغییر کرد و هیچ کد اجرایی، route، UI، migration، auth، database یا localStorage تغییر داده نشد.

- فایل Financial Review Queue و decision workflow ساخته شد: `docs/project-control/27_FINANCIAL_REVIEW_QUEUE_AND_DECISION_WORKFLOW.md`
- فایل Bank Excel Format Test Plan ساخته شد: `docs/project-control/28_BANK_EXCEL_FORMAT_TEST_PLAN.md`
- فایل Bank Rule Management و Installment Audit ساخته شد: `docs/project-control/29_BANK_RULE_MANAGEMENT_AND_INSTALLMENT_AUDIT.md`
- طراحی شد که mismatch رسید/بانک، duplicate candidate، weak bank match، تراکنش بدون رسید، قسط با اطمینان متوسط، پرداخت حساس و اصلاحیه مالی وارد صف review شوند.
- تست‌های ایمنی قالب اکسل بانک برای ستون‌های مهم، تغییر قالب، نبود ستون، جابه‌جایی ستون، مبلغ/تاریخ نامعتبر، توضیحات خالی، برداشت/واریز همزمان، duplicate transaction و فایل تکراری ثبت شد.
- تأکید شد که هر rule و هر auto confirm قسط باید version، reason، manager approval و audit trail داشته باشد.

## وضعیت CONTROL-P10-BATCH

CONTROL-P10-BATCH انجام شد. در این فاز فقط `docs/project-control` تغییر کرد و هیچ کد اجرایی، route، UI، migration، auth، database یا localStorage تغییر داده نشد.

- فایل validation و import decision flow مالی ساخته شد: `docs/project-control/23_FINANCIAL_VALIDATION_AND_IMPORT_DECISION_FLOW.md`
- فایل receipt review و bank match confidence ساخته شد: `docs/project-control/24_RECEIPT_REVIEW_AND_BANK_MATCH_CONFIDENCE.md`
- فایل liquidity alert و manager approval boundary ساخته شد: `docs/project-control/25_FINANCIAL_LIQUIDITY_ALERT_AND_APPROVAL_RULES.md`
- فایل bank Excel automation و rule matcher ساخته شد: `docs/project-control/26_BANK_EXCEL_AUTOMATION_AND_RULE_MATCHER.md`
- طراحی شد که اکسل گردش بانکی روزانه در آینده فقط پس از staging، normalizing، validation، rule matching، duplicate check و review/approval وارد جریان مالی شود.
- تأکید شد که auto confirm قسط فقط برای اطمینان خیلی بالا، قانون مصوب مدیر و بدون conflict/duplicate مجاز است.
- `audit-app` merge نشد و auth/database/migration در این فاز تغییر نکرد.

## وضعیت CONTROL-P9-BATCH

CONTROL-P9-BATCH انجام شد. در این فاز فقط `docs/project-control` تغییر کرد و هیچ کد اجرایی، route، UI، migration، auth، database یا localStorage تغییر داده نشد.

- فایل schema و adapter boundary مالی ساخته شد: `docs/project-control/20_FINANCIAL_SCHEMA_AND_ADAPTER_BOUNDARY.md`
- فایل approval و liquidity flow ساخته شد: `docs/project-control/21_FINANCIAL_APPROVAL_AND_LIQUIDITY_FLOW.md`
- فایل receipt و bank transaction mapping ساخته شد: `docs/project-control/22_RECEIPT_AND_BANK_TRANSACTION_MAPPING.md`
- طراحی شد که رویداد مالی آینده چگونه به receipt، bank transaction، employee، product، production، وضعیت پرداخت، وضعیت تایید مدیر، dataSource و audit trail وصل شود.
- تأکید شد که `audit-app` merge نمی‌شود و auth/database/migration در این فاز تغییر نمی‌کند.

## وضعیت CONTROL-P8-BATCH

CONTROL-P8-BATCH انجام شد. در این فاز فقط `docs/project-control` تغییر کرد و هیچ کد اجرایی، route، UI، migration، database، localStorage یا repo جدید ایجاد نشد.

- استراتژی workstream و repoهای آینده ثبت شد: `docs/project-control/17_PARALLEL_WORKSTREAM_AND_REPO_STRATEGY.md`
- پروتکل handoff چند Codex ثبت شد: `docs/project-control/18_MULTI_CODEX_HANDOFF_PROTOCOL.md`
- checklist تأیید merge ثبت شد: `docs/project-control/19_MERGE_APPROVAL_CHECKLIST.md`
- نقش repo اصلی `mrgem-main-system` و labهای آینده product، finance، design، mobile و production/inventory مشخص شد.
- قانون اصلی ثبت شد: هیچ دو Codex نباید همزمان یک فایل مشترک را تغییر دهند.
- Design Lab به عنوان فضای جدا برای UI/UX و pattern exploration ثبت شد و merge مستقیم آن ممنوع است.

## وضعیت CONTROL-P7-BATCH

CONTROL-P7-BATCH انجام شد. در این فاز فقط `docs/project-control` تغییر کرد و هیچ کد اجرایی، route، UI، migration، database یا localStorage تغییر داده نشد.

- بسته ایمنی ورود کالا تکمیل شد.
- فایل validator و duplicate detector موجود بود و به عنوان بخش A بسته ثبت شد: `docs/project-control/14_PRODUCT_IMPORT_VALIDATOR_AND_DUPLICATE_DETECTOR.md`
- فایل auto-fix و review queue ساخته شد: `docs/project-control/15_PRODUCT_AUTOFIX_AND_REVIEW_QUEUE.md`
- فایل Mahak export و AI product snapshot ساخته شد: `docs/project-control/16_MAHAK_EXPORT_AND_AI_PRODUCT_SNAPSHOT.md`
- هدف بسته ثبت شد: جلوگیری از ورود کالای خراب یا تکراری، جدا نگه داشتن barcode و mahakCode، کنترل وزن/اجرت/سنگ/گروه، حفاظت خروجی محک و آماده‌سازی داده تمیز برای AI.

## وضعیت CONTROL-P7

CONTROL-P7 انجام شد. در این فاز فقط `docs/project-control` تغییر کرد و هیچ کد اجرایی، route، UI، migration، database یا localStorage تغییر داده نشد.

- فایل طراحی validator و duplicate detector کالا ساخته شد: `docs/project-control/14_PRODUCT_IMPORT_VALIDATOR_AND_DUPLICATE_DETECTOR.md`
- قوانین اعتبارسنجی ورود کالا برای `productCode`، `barcode`، `name`، `groupCode`، `mahakCode`، `weight`، `wage`، `basePrice`، `salePrice`، `stoneName`، `stoneType`، `inventoryStatus`، `productionStatus` و `dataSource` ثبت شد.
- معیارهای تشخیص تکراری ثبت شد: barcode، productCode، mahakCode، ترکیب نام/وزن/سنگ/گروه، شباهت نام، اختلاف نگارشی سنگ/گروه و کالاهای ظاهراً متفاوت اما محتمل یکسان.
- خروجی‌های مورد انتظار ثبت شد: `ProductImportReport`، `DuplicateProductWarning`، `ProductValidationError`، `ProductAutoFixSuggestion` و `ProductImportDecision`.
- تصمیم‌های ورود کالا ثبت شد: import allowed، import blocked، needs review، merge candidate، update existing product و create new product.

## وضعیت CONTROL-P6

CONTROL-P6 انجام شد. در این فاز فقط `docs/project-control` تغییر کرد و هیچ کد اجرایی، route، UI، migration، database یا localStorage تغییر داده نشد.

- فایل طراحی schema و adapter کالا ساخته شد: `docs/project-control/13_PRODUCT_SCHEMA_AND_ADAPTER_BOUNDARY.md`
- `Product Schema Draft` با فیلدهای پیشنهادی کالا برای database آینده ثبت شد.
- `Product Adapter Boundary` برای اتصال آینده `mahak-web-version` بدون merge مستقیم طراحی شد.
- ورودی‌های adapter ثبت شد: خروجی Excel محک، بانک سنگ، کد گروه‌ها، بارکدها، فایل‌های کالا و خروجی AI-ready.
- خروجی‌های adapter ثبت شد: `ProductNormalizedRecord`، `ProductImportReport`، `DuplicateProductWarning`، `MahakExportPreview` و `AIProductSnapshot`.
- ریسک‌های اصلی ثبت شد: تکراری شدن کالا، اختلاف کد محک و کد داخلی، خطای بارکد، خطای وزن/اجرت، خراب شدن خروجی محک و وابستگی مستقیم به فایل‌های قدیمی پروژه کالا.

## وضعیت CONTROL-P5

CONTROL-P5 انجام شد. در این فاز فقط `docs/project-control` تغییر کرد و هیچ کد اجرایی، route، UI، migration، auth، database یا localStorage تغییر داده نشد.

- فایل طراحی مدل مرکزی رویداد مالی ساخته شد: `docs/project-control/12_CORE_FINANCIAL_EVENT_MODEL.md`
- `Core Financial Event Model` برای دریافت، پرداخت، خرید، فروش، هزینه، حقوق، بدهی، طلب، انتقال بانکی، چک، نقدینگی، هزینه تولید، اصلاحیه مالی و تایید مدیر طراحی مفهومی شد.
- تصمیم ثبت شد که `audit-app` فعلاً merge نشود و فقط مدل نقدینگی، schema مالی، نقش‌ها، RLS، تایید مدیر، داشبورد بحران نقدینگی و flow ثبت/بررسی/تأیید بعداً بررسی شوند.
- ترتیب امن آینده ثبت شد: مدل مفهومی، schema پیشنهادی، adapter boundary، تست با داده نمونه، UI، اتصال رسیدها، و در آخر migration فقط با اجازه مرکز فرمان.

## وضعیت CONTROL-P4

CONTROL-P4 انجام شد. در این فاز فقط `docs/project-control` تغییر کرد و هیچ کد اجرایی، route، UI، migration، database یا localStorage تغییر داده نشد.

- فایل طراحی مدل مرکزی کالا ساخته شد: `docs/project-control/11_CORE_PRODUCT_MODEL.md`
- `Core Product Model` برای کالا، بارکد، گروه کالا، سنگ، وزن، اجرت، قیمت، موجودی، تولید، خروجی محک و AI-ready export طراحی مفهومی شد.
- تصمیم ثبت شد که `mahak-web-version` فعلاً merge نشود و فقط ایده، مدل، schema، بانک سنگ، barcode strategy و خروجی محک بعداً بررسی شوند.
- ترتیب امن آینده ثبت شد: مدل مفهومی، schema پیشنهادی، adapter boundary، تست روی داده نمونه، UI، و در آخر migration فقط با اجازه مرکز فرمان.

## وضعیت CONTROL-P3

CONTROL-P3 انجام شد. در این فاز فقط `docs/project-control` تغییر کرد و هیچ کد اجرایی، route، UI، migration یا localStorage تغییر داده نشد.

- فایل نقشه آینده ماژول‌ها ساخته شد: `docs/project-control/10_FUTURE_MODULES_ROADMAP.md`
- آینده شاخه‌های Workforce، Finance، Product، Production، Inventory، Receipts، Mahak Integration، Mobile App، AI Analysis و Central Cockpit ثبت شد.
- تصمیم قطعی ثبت شد که قبل از کاهش بدهی معماری WF، ماژول جدید شروع نشود.
- وابستگی‌های کلیدی آینده ثبت شد: `Core Product Model`، `Core Financial Event Model`، `Core Inventory Model`، `Receipt Capture Flow` و `Mahak Integration Boundary`.
- پروژه پول و پروژه کالا همچنان Subproject می‌مانند و merge مستقیم ندارند.

## وضعیت WF-P31

WF-P31 انجام شد و verify شد. در این فاز فقط extraction معماری انجام شد و رفتار برنامه تغییر نکرد.

- `DataCenterPage` از adapter به صفحه واقعی تبدیل شد.
- فایل صفحه: `src/pages/workforce/system/DataCenterPage.tsx`
- فایل‌های تغییرکرده در WF-P31:
  - `src/WorkforcePages.tsx`
  - `src/pages/workforce/system/DataCenterPage.tsx`
  - `src/pages/workforce/workforcePageUtils.ts`
  - `tests/analysis.test.ts`
- `WorkforcePages.tsx` از `4331` خط به `4119` خط رسید.
- کاهش تقریبی: `212` خط.
- route تغییر نکرد.
- localStorage key جدید ساخته نشد.
- docs در زمان اجرای WF-P31 تغییر نکرده بود.
- `npm test` موفق بود.
- `npm run build` موفق بود.
- build warning جدی نداشت.
- commit اجرایی WF-P31: `85d0df5 refactor: extract DataCenterPage`

## وضعیت WF-P30

WF-P30 انجام شد و verify شد. در این فاز فقط extraction معماری انجام شد و رفتار برنامه تغییر نکرد.

- `OperationalHistoryPage` واقعاً از `src/WorkforcePages.tsx` خارج شد.
- فایل صفحه: `src/pages/workforce/system/OperationalHistoryPage.tsx`
- فایل‌های تغییرکرده در WF-P30:
  - `src/WorkforcePages.tsx`
  - `src/pages/workforce/system/OperationalHistoryPage.tsx`
  - `tests/analysis.test.ts`
- `WorkforcePages.tsx` از `4733` خط به `4614` خط رسید.
- route تغییر نکرد.
- localStorage key جدید ساخته نشد.
- `npm test` موفق بود.
- `npm run build` موفق بود.
- build warning نداشت.
- رفتار UI تغییر نکرد.

## وضعیت CONTROL-P2

CONTROL-P2 انجام شد. در این فاز فقط `docs/project-control` تغییر کرد و هیچ کد اجرایی ادغام یا تغییر داده نشد.

- فایل نقشه منابع ساخته شد: `docs/project-control/09_SOURCE_INTEGRATION_MAP.md`
- پروژه پول / `audit-app` به عنوان `FIN-AUDIT` ثبت شد و فعلاً Subproject باقی می‌ماند.
- پروژه کالا / `mahak-web-version` به عنوان `DATA-MAHAK` ثبت شد و فعلاً Subproject باقی می‌ماند.
- merge مستقیم هر دو زیرپروژه ممنوع است.
- پیشنهاد استخراج آینده فقط در سطح ایده، مدل، schema و الگو ثبت شد.

## وضعیت WF-P29

WF-P29 انجام و verify شد. دو صفحه زیر قبلاً از `src/WorkforcePages.tsx` جدا شده بودند و ثبت نهایی شدند:

- `MaintenancePage`
- `HistoryRetentionPage`

فایل‌های موجود:

- `src/pages/workforce/system/MaintenancePage.tsx`
- `src/pages/workforce/operations/HistoryRetentionPage.tsx`
- `src/pages/workforce/workforcePageUtils.ts`

نتیجه ثبت‌شده:

- `WorkforcePages.tsx` از حدود `5028` خط به `4733` خط رسیده است.
- `npm test` موفق است.
- `npm run build` موفق است.
- route جدید ساخته نشده است.
- localStorage key جدید ساخته نشده است.
- رفتار UI تغییر نکرده است.

## شاخه‌های فعال

| شاخه | وضعیت | توضیح |
|---|---|---|
| CORE | فعال کنترلی | route registry، shell، قوانین معماری و اتصال آینده به کابین مرکزی |
| WF | فعال اجرایی | ماژول نیروی انسانی تا WF-P31 تأیید و verify شده است |
| UI | فعال پشتیبان | RTL، dark mode و cockpit مدیریتی در UI فعلی حفظ شده است |
| DATA | نیمه‌فعال | localStorage registry، backup، import/restore و baseline compatibility وجود دارد |
| CONTROL | فعال | docs/project-control منبع حقیقت کنترل پروژه است |
| FIN | برنامه‌ریزی نشده | هنوز در محصول اصلی شروع نشده است |
| PROD | برنامه‌ریزی نشده | هنوز در محصول اصلی شروع نشده است |
| INV | برنامه‌ریزی نشده | هنوز در محصول اصلی شروع نشده است |
| MOBILE | برنامه‌ریزی نشده | هنوز در محصول اصلی شروع نشده است |

## زیرپروژه‌های ثبت‌شده

| کد | نام repo/پروژه | وضعیت | قاعده |
|---|---|---|---|
| FIN-AUDIT | `audit-app` / داشبورد بحران نقدینگی | Subproject | فعلاً merge نشود |
| DATA-MAHAK | `mahak-web-version` / ثبت کالا و خروجی محک | Subproject | فعلاً merge نشود |

## وضعیت معماری WF

- route manifest مرکزی وجود دارد.
- routeها lazy load می‌شوند.
- داده‌ها در localStorage و serviceهای داخلی هستند.
- analyzerها، recommendation، simulator، decision queue، report، backup، readiness، launch، drift، history، retention، operations calendar و maintenance وجود دارند.
- `MaintenancePage`، `HistoryRetentionPage`، `OperationalHistoryPage` و `DataCenterPage` از `WorkforcePages.tsx` جدا شده‌اند.
- `WorkforcePages.tsx` هنوز بزرگ است و نیازمند extraction مرحله‌ای بیشتر است.

## ریسک‌های فعلی

1. `WorkforcePages.tsx` هنوز بدهی معماری اصلی است.
2. زیرپروژه‌های `audit-app` و `mahak-web-version` نباید مستقیم merge شوند.
3. تست DOM/E2E رسمی برای routeهای مستقیم وجود ندارد.
4. پروژه هنوز local-only است؛ پاک شدن storage مرورگر باعث از دست رفتن داده محلی می‌شود.
5. backend، auth و sync هنوز طراحی/پیاده‌سازی نشده‌اند.

## P پیشنهادی بعدی

آغاز برنامه‌ریزی Design Lab فقط در سطح flow/wireframe/mock concept؛ ساخت prototype و implementation تا دستور مستقل در hold باقی می‌ماند.
