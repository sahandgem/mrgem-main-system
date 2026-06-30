# Master Gem V1 Build Boundary and No-Code Freeze Rules

آخرین به‌روزرسانی: 2026-07-01

## 1. Purpose

این سند مرز V1 و قوانین freeze پروژه مستر جم است. هدف آن جلوگیری از شلوغ‌شدن پروژه، کدنویسی زودهنگام، ساخت Cockpit بدون موتور و merge مستقیم subprojectهاست.

این سند implementation نیست. این سند قانون ورود به implementation است.

## 2. Current Core State

- Project Core فعال است.
- Code Main paused است.
- P55 انجام شده، اما P55A هنوز تایید و اجرا نشده است.
- P56 متوقف است.
- Cockpit prototypeها frozen هستند.
- Product/Mahak subproject مجوز direct merge ندارد.
- Finance/Audit subproject مجوز direct merge ندارد.
- branch `main` قفل است.
- merge ممنوع است.
- push فقط با دستور جداگانه و صریح انجام می‌شود.

## 3. What V1 Means

V1 نسخه کامل سیستم نیست. V1 اولین ستون فقرات امن سیستم‌عامل مستر جم است.

V1 باید بتواند زنجیره زیر را ثابت کند:

`Data Entity → Task → DecisionItem → Audit → Cockpit Summary → Human Action`

اگر یک قابلیت به این زنجیره وصل نیست، در V1 اولویت ندارد.

## 4. V1 Primary Goal

هدف اصلی V1 ساخت پایه‌ای است که بعداً تولید، مالی، کالا، عکس، جمعه‌بازار، AI و Cockpit روی آن سوار شوند.

V1 نباید دنبال کامل‌کردن همه ماژول‌ها باشد. V1 باید ثابت کند که:

- زبان داده مشترک قفل شده است.
- Task و DecisionItem بین ماژول‌ها مشترک‌اند.
- Interaction Map رعایت می‌شود.
- Workforce به‌عنوان موتور موجود تثبیت می‌شود.
- Cockpit فقط read-only summary دریافت می‌کند.
- subprojectها فقط از طریق contract وارد می‌شوند.

## 5. V1 Allowed Tracks

| Track | Status | Allowed in V1? | Conditions | Forbidden parts | Required approval |
|---|---|---|---|---|---|
| Project Core Docs / Contracts | Active | YES | فقط `docs/project-control` و scope دقیق | هر تغییر اجرایی ضمن docs | دستور docs-only Project Core |
| Workforce Operations Engine Stabilization | Paused | YES, but paused until explicit resume | فقط پس از دستور Project Core؛ P55A verification قبل از P56 | feature، route، storage، model یا UI redesign جدید | `CORE-RESUME` یا phase صریح |
| Task + Decision Core Implementation | Contract ready | DESIGN ONLY for now | contract و data boundary کامل؛ implementation approval جدا | model/service/schema/UI اجرایی | Implementation Approval مستقل |
| Central Cockpit | Prototypes frozen | READ-ONLY DESIGN ONLY | summary از data/task/decision/audit | mutation یا action واقعی | Cockpit Implementation Approval مستقل |
| Product + Inventory | Subproject/design | CONTRACT/DESIGN ONLY | ورود فقط با data contract؛ direct merge ممنوع | import واقعی، DB و merge مستقیم | Project Core + implementation approval |
| Finance + Cashflow | Subproject/design | CONTRACT/DESIGN ONLY | ورود فقط با finance data contract؛ direct merge ممنوع | auth/DB، reconciliation واقعی و merge مستقیم | Project Core + implementation approval |
| Production Engine | Design needed | DESIGN ONLY | Recipe/BOM، WorkOrder، InventoryMovement و Task flow ابتدا قفل شوند | workflow/automation اجرایی | Contract Approval سپس Implementation Approval |
| Visual Inventory + Media | Design needed | DESIGN ONLY | MediaAsset contract و capture flow ابتدا قفل شوند | upload/storage/mobile اجرایی | Contract Approval سپس Implementation Approval |
| Sales + Friday Market | Design needed | DESIGN ONLY | Sale، Payment/Transaction، InventoryMovement و reconciliation contract لازم است | جریان فروش اجرایی | Contract Approval سپس Implementation Approval |
| AI Review + Decision Queue | Concept/design | CONCEPT/DESIGN ONLY | AI فقط پیشنهاد می‌دهد | auto approval و mutate source of truth | AI Safety + Implementation Approval مستقل |

## 6. V1 Explicitly Allowed Now

فعلاً فقط موارد زیر مجازند:

- `docs/project-control` updates
- architecture contracts
- decision rules
- module maps
- readiness matrices
- build boundary documents
- non-code review of existing reports
- future Codex prompts prepared by Project Core

فعلاً موارد زیر مجاز نیستند:

- کدنویسی
- refactor جدید
- P55A/P56
- route یا UI
- Cockpit implementation
- database/model implementation
- subproject merge
- push، merge یا main change

## 7. No-Code Freeze Rules

`No-Code Freeze` یعنی Codex بدون دستور صریح Project Core اجازه تغییر هیچ فایل اجرایی را ندارد.

در دوره freeze:

- `src` ممنوع است.
- prototype ممنوع است.
- package و lock file ممنوع است.
- database/backend/auth/API/storage ممنوع است.
- UI/CSS ممنوع است.
- route ممنوع است.
- localStorage/sessionStorage/fetch ممنوع است.
- merge ممنوع است.
- main ممنوع است.
- push ممنوع است، مگر با دستور جداگانه.

فقط `docs/project-control` مجاز است.

## 8. How Code Can Be Resumed

خروج از freeze فقط با یک دستور `CORE-RESUME` یا phase اجرایی صریح ممکن است.

هر task برای خروج از freeze باید همه موارد زیر را داشته باشد:

- Phase name
- Why code is needed
- Target module
- Exact branch
- Exact files allowed
- Exact files forbidden
- Data entities touched
- Task/Decision impact
- UI impact
- Storage impact
- Route impact
- Test plan
- Build plan
- Rollback plan
- Report template
- Approval source

اگر حتی یکی از موارد بالا ناقص باشد، Codex باید stop کند و هیچ فایل اجرایی را تغییر ندهد.

## 9. P55A/P56 Rule

P55 انجام شده است، اما به‌خاطر برابرماندن line count در `WorkforcePages.tsx`، قبل از P56 باید P55A انجام شود.

در وضعیت فعلی:

- P55A paused است.
- P56 ممنوع است.
- بازگشت به refactor فقط با `CORE-RESUME` جدا ممکن است.

اگر Project Core در آینده اجازه داد، اولویت احتمالی کدنویسی این است:

1. P55A verification/cleanup
2. فقط اگر P55A سالم بود، P56 extraction
3. بدون feature جدید
4. بدون UI redesign
5. بدون route/storage/model/service/analyzer change

## 10. Cockpit Freeze Rule

Cockpit prototypeها frozen هستند و Cockpit implementation فعلاً ممنوع است.

Cockpit فقط وقتی می‌تواند باز شود که:

- source data مشخص باشد.
- Task count مشخص باشد.
- DecisionItem count مشخص باشد.
- risk/confidence مشخص باشد.
- audit source مشخص باشد.
- read-only boundary مشخص باشد.
- approval جدا صادر شود.

کابین گرافیکی باید بهترین UI آینده باشد، اما بدون data/task/decision/audit نباید ساخته شود.

## 11. Subproject Freeze Rule

### Mahak/Product

- direct merge ممنوع است.
- فقط contract، extraction plan و source mapping مجاز است.
- implementation به approval جدا نیاز دارد.

### Finance/Audit

- direct merge ممنوع است.
- فقط contract، transaction mapping و cashflow design مجاز است.
- implementation به approval جدا نیاز دارد.

### Mobile/Photo

- implementation ممنوع است.
- فقط MediaAsset و capture contract مجاز است.

### n8n/Automation

- automation execution ممنوع است.
- فقط automation design و trigger map مجاز است.

## 12. V1 Build Gate

پیش از هر build واقعی، تمام پرسش‌های زیر باید پاسخ `YES` داشته باشند:

- Does it use central data model?
- Does it create/read/update Task?
- Does it create/read/update DecisionItem if decision needed?
- Does it create audit trail?
- Does it have source of truth?
- Does it avoid duplicate ownership?
- Does it avoid direct subproject merge?
- Does it have rollback?
- Does it keep Cockpit read-only unless approved?
- Does it pass tests/build if code changes?
- Does it respect main lock?

اگر پاسخ حتی یکی `NO` باشد، build ممنوع است. مورد Task یا DecisionItem فقط با دلیل معماری دقیق می‌تواند `NOT_APPLICABLE` شود و این استثناء باید توسط Project Core تایید شود.

## 13. Page/Feature Acceptance Rule

هر page یا feature آینده باید پیش از ساخت این فرم را کامل کند:

- Problem:
- Input data:
- Source module:
- Owner:
- Processing:
- Output:
- Related entity:
- Related Task:
- Related DecisionItem:
- Audit event:
- Cockpit visibility:
- User action:
- V1 or later:
- Risk if skipped:
- Simplest safe version:

اگر Related Task یا Related DecisionItem ندارد، باید دلیل دقیق داشته باشد. اگر Cockpit visibility دارد ولی audit ندارد، ساخت آن ممنوع است.

## 14. V1 Allowed Output

خروجی‌های مجاز V1:

- docs معماری
- contracts
- interaction maps
- readiness scorecards
- refactor verification reports
- read-only summary design
- data extraction plans
- source system maps
- audit rules
- rollback rules

خروجی‌های فعلاً غیرمجاز V1:

- full Cockpit
- full production
- full finance
- full inventory system
- mobile app
- AI automation execution
- direct database schema
- direct subproject merge
- full UI rebuild

## 15. Priority After CORE-P05

پس از CORE-P05 هنوز implementation نباید شروع شود.

پیشنهاد بعدی:

`CORE-P06 — Master Gem Module Readiness Scorecard`

دلیل: پس از freeze و V1 boundary، هر ماژول باید scorecard داشته باشد که نشان دهد data و contract دارد یا نه، risk و dependency آن چیست، و وضعیت مناسب آن docs، design، code، prototype یا paused است.

## 16. Non-Goals

CORE-P05 هیچ‌کدام از موارد زیر را انجام نمی‌دهد:

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

## 17. Final Lock Statement

تا پیش از دستور بعدی Project Core:

- Code Main paused می‌ماند.
- فقط docs-only taskها مجازند.
- P55A/P56 متوقف‌اند.
- Cockpit implementation متوقف است.
- subproject merge متوقف است.
- main قفل است.
- هر خروج از freeze باید explicit approval داشته باشد.
