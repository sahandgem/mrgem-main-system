# Master Gem Module Readiness Scorecard

آخرین به‌روزرسانی: 2026-07-01

## 1. Purpose

این سند Scorecard آمادگی ماژول‌های مستر جم است. هدف آن انتخاب کدنویسی نیست؛ هدف، تشخیص وضعیت هر قطعه پیش از هر resume است.

این سند از CORE-P01 تا CORE-P05 پیروی می‌کند.

## 2. Current Freeze State

- Code Main paused است.
- فقط docs-only taskها مجازند.
- P55A/P56 paused هستند.
- Cockpit implementation ممنوع است.
- Product/Mahak direct merge ممنوع است.
- Finance/Audit direct merge ممنوع است.
- main قفل است.
- merge ممنوع است.
- هر خروج از freeze نیازمند `CORE-RESUME` جداگانه است.

## 3. Scoring Scale

| Score | Meaning |
|---|---|
| `0` | نامشخص یا بدون سند قابل اتکا |
| `1` | ایده خام و فاقد contract پایدار |
| `2` | contract اولیه دارد، اما مرزها یا وابستگی‌ها ناقص‌اند |
| `3` | interaction و data boundary مشخص است |
| `4` | آماده طراحی اجرایی محدود و verification دقیق است |
| `5` | آماده implementation کنترل‌شده با `CORE-RESUME` است |

امتیاز `5` به معنی اجازه خودکار کدنویسی نیست. حتی امتیاز `5` نیز به task کامل و `CORE-RESUME` مستقل نیاز دارد.

## 4. Readiness Criteria

| Criterion | توضیح |
|---|---|
| Architecture clarity | نقش، مسئولیت و مرز ماژول چقدر روشن است. |
| Central data model alignment | موجودیت‌ها و referenceها چقدر با قرارداد مرکزی هماهنگ‌اند. |
| Task/Decision alignment | کارها و تصمیم‌های مدیر چقدر به Task/DecisionItem متصل‌اند. |
| Interaction map alignment | ورودی، خروجی و اتصال ماژول به سایر قطعات چقدر مشخص است. |
| Source of truth clarity | مالک واقعی داده و مرز جلوگیری از duplicate ownership چقدر روشن است. |
| Data availability | داده معتبر، synthetic یا قابل استخراج برای طراحی/تست وجود دارد یا نه. |
| Existing code readiness | کد موجود چقدر مستقل، تست‌پذیر و کم‌ریسک است. |
| UI dependency risk | ماژول چقدر در معرض UI زودهنگام یا ویترین بدون موتور است. |
| Subproject merge risk | وابستگی یا خطر merge مستقیم پروژه فرعی چقدر است. |
| Audit/rollback readiness | تغییر، تصمیم و rollback چقدر قابل ردیابی و برگشت است. |
| V1 fit | ماژول چقدر زنجیره V1 را اثبات می‌کند. |
| Implementation risk | blast radius، ابهام و احتمال تغییر ناخواسته چقدر است. |

## 5. Module Scorecard Table

امتیازها readiness مفهومی هستند و مجوز اجرا محسوب نمی‌شوند.

| Module | Aircraft role | Current status | Architecture score | Data contract score | Task/Decision score | Interaction score | Source of truth score | Existing code score | Risk level | V1 fit | Recommended state | Reason |
|---|---|---|---:|---:|---:|---:|---:|---:|---|---|---|---|
| Project Core | مغز و قانون مادر | فعال در docs | 5 | 4 | 5 | 5 | 5 | 0 | low | high | docs_active | قرارداد و gateها روشن‌اند؛ مالک عملیات نیست. |
| Workforce Operations Engine | موتور کار و نیرو | کد موجود، freeze | 4 | 4 | 4 | 4 | 4 | 4 | medium | high | code_resume_candidate | قوی‌ترین کد موجود است؛ فقط P55A verification می‌تواند نامزد باشد. |
| Task + Decision Core | ستون فقرات کار/تصمیم | contract، بدون implementation | 4 | 3 | 5 | 4 | 3 | 0 | medium | high | readiness_review | contract قوی است؛ مدل اجرایی و approval ندارد. |
| Product + Inventory Core | بدنه کالا و موجودی | subproject/design | 3 | 3 | 3 | 3 | 2 | 1 | high | high | subproject_only | داده ارزشمند دارد، اما extraction و source mapping کامل نیست. |
| Finance + Cashflow Core | سوخت و فشار مالی | subproject/design | 3 | 3 | 3 | 3 | 2 | 1 | critical | high | subproject_only | حساس و ارزشمند است؛ transaction mapping و مرز تایید لازم دارد. |
| Production Engine | موتور تولید | design needed | 3 | 2 | 3 | 3 | 2 | 0 | high | high | design_next | BOM، WorkOrder و movement flow هنوز جزئی نشده‌اند. |
| Visual Inventory + Media | چشم و evidence | concept/design | 3 | 2 | 3 | 3 | 2 | 1 | medium | medium | design_next | MediaAsset و capture/quality rules لازم است. |
| Sales + Friday Market | موتور درآمد | design needed | 2 | 2 | 2 | 3 | 2 | 0 | high | medium | paused | به Product، Inventory و Finance پایدار وابسته است. |
| AI Review + Decision Queue | کمک‌خلبان تحلیل | concept/prototype | 3 | 2 | 4 | 3 | 2 | 1 | high | medium | prototype_only | فقط پیشنهاد؛ auto approval ممنوع است. |
| Central Cockpit | کابین مدیریتی | prototype frozen | 4 | 2 | 3 | 4 | 1 | 1 | high | medium | frozen | سطح نمایش آماده‌تر از موتورهای داده‌ای است. |
| Audit/Backup/History | جعبه سیاه | بخشی در Workforce | 3 | 3 | 3 | 3 | 3 | 3 | medium | high | readiness_review | برای V1 مهم است، اما قرارداد مرکزی event/rollback باید دقیق‌تر شود. |
| Mobile Evidence Capture | ورودی evidence میدانی | idea/design | 2 | 2 | 2 | 2 | 1 | 0 | high | medium | design_next | MediaAsset، offline و security boundary هنوز قفل نیستند. |
| n8n / Automation | سیم‌کشی اتوماسیون | idea/design | 2 | 1 | 2 | 2 | 1 | 0 | critical | low | paused | automation execution تا تثبیت contractها ممنوع است. |

## 6. Module Diagnosis

### Project Core

* Current role: تعیین معماری، approval، ترتیب ساخت و freeze.
* What exists now: CORE-P01 تا CORE-P05 و operating rules.
* What is missing: readiness decision دوره‌ای و approvalهای phase-specific آینده.
* Strong points: مالکیت و stop rule روشن.
* Risks: ورود به داده عملیاتی یا تبدیل‌شدن به مجری مبهم.
* V1 permission: docs_active.
* Required before code: task کامل و `CORE-RESUME`.
* Recommended next step: ادامه readiness governance.

### Workforce Operations Engine

* Current role: مدیریت Employee، schedule، Task، تحلیل و تاریخچه عملیات.
* What exists now: P0-P22، analyzerها، صفحات عملیاتی و extractionهای کنترل‌شده.
* What is missing: P55A verification و کاهش تدریجی بدهی `WorkforcePages.tsx`.
* Strong points: قوی‌ترین کد، داده و تست موجود پروژه.
* Risks: فایل بزرگ، coupling و توسعه خارج از scope.
* V1 permission: فقط code_resume_candidate؛ فعلاً paused.
* Required before code: `CORE-RESUME` با scope دقیق P55A، test/build و rollback.
* Recommended next step: P55A verification candidate؛ P56 هنوز ممنوع.

### Task + Decision Core

* Current role: زبان مشترک کار قابل انجام و تصمیم انسانی.
* What exists now: contract مرکزی type/status/flow و module routing.
* What is missing: data boundary اجرایی، audit contract و implementation approval.
* Strong points: V1 fit بالا و مرز AI/انسان روشن.
* Risks: duplicate definition داخل هر ماژول.
* V1 permission: design_next یا readiness_review.
* Required before code: مدل اجرایی محدود، impact map و approval مستقل.
* Recommended next step: readiness review، نه implementation.

### Product + Inventory Core

* Current role: هویت کالا، مواد، قطعات و movement موجودی.
* What exists now: اسناد Product، import safety و subproject ارزشمند Mahak/Product.
* What is missing: extraction mapping تاییدشده، source of truth و inventory contract جزئی.
* Strong points: داده و دانش دامنه‌ای ارزشمند.
* Risks: direct merge، duplicate کالا و اختلاط Product با موجودی.
* V1 permission: subproject_only/design_next.
* Required before code: detailed extraction/data contract و synthetic validation.
* Recommended next step: Product + Inventory detailed contract.

### Finance + Cashflow Core

* Current role: Payment/Transaction، cashflow، approval و pressure.
* What exists now: Financial Event contract، bank/receipt design و audit-app به‌عنوان منبع تحقیق.
* What is missing: transaction mapping نهایی، source of truth و approval boundary اجرایی.
* Strong points: اسناد safety و review گسترده.
* Risks: حساسیت مالی، auth/RLS و merge مستقیم.
* V1 permission: subproject_only/design_next.
* Required before code: finance data contract و transaction mapping تاییدشده.
* Recommended next step: Finance transaction mapping contract.

### Production Engine

* Current role: تبدیل مواد، ظرفیت و دستور ساخت به خروجی.
* What exists now: جایگاه معماری و interaction flow مفهومی.
* What is missing: Recipe/BOM، WorkOrder، InventoryMovement و Task flow جزئی.
* Strong points: نقش حیاتی و ارتباط مرکزی روشن.
* Risks: automation زودهنگام و تغییر مستقیم موجودی.
* V1 permission: design_next.
* Required before code: contracts نسخه‌دار تولید و test scenario مصنوعی.
* Recommended next step: Production Recipe/BOM + WorkOrder contract.

### Visual Inventory + Media

* Current role: عکس، رسید و evidence قابل اتصال به entity.
* What exists now: MediaAsset concept و Design Lab ideas.
* What is missing: capture flow، quality/identity rule، privacy و storage boundary.
* Strong points: اتصال طبیعی به Product، Finance و Decision.
* Risks: فایل بی‌مرجع، داده حساس و AI extraction نادرست.
* V1 permission: design_next.
* Required before code: MediaAsset contract و capture/review flow.
* Recommended next step: Visual Inventory + Media capture contract.

### Sales + Friday Market

* Current role: Sale، کانال درآمد و بازخورد بازار.
* What exists now: interaction concept و جایگاه معماری.
* What is missing: Sale contract، reconciliation و dependencyهای Product/Finance.
* Strong points: اثر مستقیم کسب‌وکار.
* Risks: ثبت فروش بدون movement/payment reconciliation.
* V1 permission: design_next یا paused؛ فعلاً paused ترجیح دارد.
* Required before code: Product و Finance contracts پایدار.
* Recommended next step: بعد از Product/Finance design ادامه یابد.

### AI Review + Decision Queue

* Current role: پیشنهاد، confidence، risk و review candidate.
* What exists now: مفهوم AI pipeline و prototype صف تصمیم.
* What is missing: approved input contract، evaluation و audit event جزئی.
* Strong points: human-in-the-loop روشن.
* Risks: AI به‌عنوان source of truth یا auto approval.
* V1 permission: prototype_only/design_next.
* Required before code: safety matrix، audit contract و implementation approval.
* Recommended next step: فقط design/readiness؛ auto approval ممنوع.

### Central Cockpit

* Current role: read-only summary، risk، queue و drill-down.
* What exists now: دو prototype تاییدشده برای iteration و frozen.
* What is missing: source data واقعی، Task/Decision count و read model contract اجرایی.
* Strong points: جهت UI/UX روشن.
* Risks: ویترین بدون موتور و mutation مستقیم.
* V1 permission: frozen/prototype_only.
* Required before code: Cockpit read-only summary contract و approval مستقل.
* Recommended next step: frozen بماند؛ implementation فعلاً ممنوع.

### Audit/Backup/History

* Current role: traceability، snapshot، rollback و operational history.
* What exists now: قابلیت‌های متعدد داخل Workforce و اسناد audit/rollback.
* What is missing: audit event contract مرکزی و cross-module retention boundary.
* Strong points: کد و تجربه عملی موجود در Workforce.
* Risks: audit پراکنده یا rollback بدون approval.
* V1 permission: readiness_review.
* Required before code: event contract و ownership مرکزی روشن.
* Recommended next step: Audit Event Contract.

### Mobile Evidence Capture

* Current role: ثبت عکس رسید/کالا و evidence از میدان.
* What exists now: ایده و وابستگی‌های مستند.
* What is missing: MediaAsset contract، offline queue، security و retry policy اجرایی.
* Strong points: کاهش ورود دستی و اتصال evidence.
* Risks: داده حساس، فایل گمشده و sync conflict.
* V1 permission: design_next.
* Required before code: capture contract و boundary امنیت/storage.
* Recommended next step: design فقط، بدون mobile implementation.

### n8n / Automation

* Current role: trigger و orchestration احتمالی آینده.
* What exists now: ایده Automation-First و flowهای مفهومی.
* What is missing: event contract، idempotency، retry، secret و rollback boundary.
* Strong points: امکان کاهش کار تکراری در آینده.
* Risks: اقدام ناخواسته، loop، duplicate و نشت secret.
* V1 permission: design_next/paused؛ فعلاً paused.
* Required before code: trigger map، safety policy و approval مستقل.
* Recommended next step: automation design فقط؛ execution ممنوع.

## 7. Expected Diagnosis Rules

- Project Core باید `docs_active` باشد و مالک داده عملیاتی نیست.
- Workforce قوی‌ترین کد موجود و `code_resume_candidate` است، اما فقط برای P55A verification پس از `CORE-RESUME`؛ P56 مجاز نیست.
- Task + Decision contract دارد ولی implementation ندارد و باید `readiness_review` بماند.
- Product/Inventory و Finance/Cashflow دارای subproject ارزشمندند، اما direct merge ممنوع و وضعیت آن‌ها `subproject_only` است.
- Production و Visual Media باید `design_next` باشند.
- Sales پس از Product/Finance اولویت می‌گیرد و فعلاً paused است.
- AI مالک تصمیم نیست و `prototype_only` باقی می‌ماند.
- Cockpit prototype دارد، frozen است و فقط read-only آینده مجاز خواهد بود.
- Audit/Backup/History برای V1 مهم و نیازمند readiness review مرکزی است.
- Mobile Evidence Capture design-next و n8n execution paused است.

## 8. V1 Candidate Ranking

| Rank | Candidate | Why candidate | What must happen first | Allowed next action |
|---:|---|---|---|---|
| 1 | Project Core docs | freeze و معماری را کنترل می‌کند | دستور docs-only مشخص | ادامه contracts/readiness |
| 2 | Workforce P55A verification | قوی‌ترین کد موجود و scope کوچک | `CORE-RESUME` دقیق، branch، tests/build، rollback | فقط verification/cleanup مصوب |
| 3 | Task + Decision Core | ستون فقرات V1 و contract موجود | readiness/data/audit boundary و approval | design/readiness review |
| 4 | Product/Finance/Production contracts | موتورهای اصلی آینده | contractهای جزئی و source mapping | docs/design فقط |
| 5 | Audit Event Contract | برای تصمیم و rollback ضروری | ownership و event semantics | docs/design فقط |
| 6 | Cockpit read-only contract | خروجی مدیریتی لازم است | موتورهای داده و summary contract | design فقط؛ implementation ممنوع |

## 9. Code Resume Candidate

کاندید احتمالی resume کد:

`Workforce Operations Engine — P55A verification only`

این عبارت اجازه اجرا نیست و فقط candidate را ثبت می‌کند. اجرا نیازمند `CORE-RESUME` جداگانه است.

شرط‌های لازم:

- branch دقیق مشخص شود.
- scope فقط P55A باشد.
- no feature.
- no UI redesign.
- no route/storage/model/service/analyzer change.
- test/build الزامی باشد.
- report template الزامی باشد.

## 10. Blocked Actions

- P56 extraction
- Cockpit implementation
- Product/Mahak merge
- Finance/Audit merge
- database schema implementation
- TypeScript model implementation
- mobile app implementation
- n8n automation execution
- AI auto approval
- production full workflow implementation
- finance full reconciliation implementation
- UI rebuild

## 11. Design-Next Candidates

- Product + Inventory detailed contract
- Finance transaction mapping contract
- Production Recipe/BOM + WorkOrder contract
- Visual Inventory + Media capture contract
- Audit event contract
- Cockpit read-only summary contract

## 12. Recommended Next Action

پس از CORE-P06 هنوز implementation نباید شروع شود.

پیشنهاد بعدی:

`CORE-P07 — Master Gem Resume Candidate Decision`

هدف آن این است که Project Core تصمیم بگیرد freeze ادامه یابد، P55A با `CORE-RESUME` باز شود، یا یک contract دیگر برای Product/Finance/Production پیش برود.

CORE-P07 نیز docs-only است، مگر Project Core جداگانه `CORE-RESUME` صادر کند.

## 13. Non-Goals

CORE-P06 هیچ‌کدام از موارد زیر را انجام نمی‌دهد:

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
- Cockpit implementation

## 14. Final Statement

Readiness Scorecard فقط تحلیل است. هیچ کدنویسی با این سند مجاز نمی‌شود. هر کدنویسی آینده به `CORE-RESUME` نیاز دارد. تا آن زمان Code Main paused می‌ماند.
