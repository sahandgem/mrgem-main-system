# Master Gem Resume Candidate Decision

آخرین به‌روزرسانی: 2026-07-01

## 1. Purpose

این سند تصمیم رسمی Project Core درباره امکان خروج محدود از No-Code Freeze است.

این سند implementation نیست. این سند `CORE-RESUME` نیست. این سند فقط تعیین می‌کند کدام مسیر برای قدم بعدی امن‌تر است.

## 2. Current State

- Code Main paused است.
- فقط docs-only taskها مجازند.
- CORE-P01 تا CORE-P06 کامل شده‌اند.
- P55 انجام شده است.
- P55A هنوز اجرا نشده است.
- P56 تا روشن‌شدن نتیجه P55 توسط P55A ممنوع است.
- `WorkforcePages.tsx` هنوز بدهی معماری دارد.
- Cockpit frozen است.
- Product/Mahak و Finance/Audit فقط subproject/design هستند.
- main قفل است.
- merge ممنوع است.

## 3. Decision Options

### Option A — Continue Docs Freeze

ادامه‌دادن docs-only و جلو بردن contractهای Product، Finance، Production و Media.

* Benefit: بدون ریسک کد، مرزهای دامنه‌ای کامل‌تر می‌شوند و ambiguity آینده کاهش می‌یابد.
* Risk: بدهی تاییدنشده P55 و ابهام extraction در Workforce باقی می‌ماند.
* Required approval: دستور docs-only Project Core.
* Allowed scope: فقط `docs/project-control`، contract، mapping و readiness.
* Forbidden scope: هر کد، refactor، prototype، implementation، merge یا push.
* Recommendation: گزینه امن و معتبر جایگزین است، اما ابهام کوچک P55 را حل نمی‌کند.

### Option B — Resume Code For P55A Only

بازکردن کد فقط برای verification/cleanup مربوط به P55A.

* Benefit: پیش از extraction بعدی، کیفیت و کامل‌بودن P55 با کمترین blast radius روشن می‌شود.
* Risk: هر خروج از scope می‌تواند freeze را بشکند یا refactor ناخواسته ایجاد کند.
* Required approval: دستور جداگانه و صریح `CORE-RESUME-P55A`.
* Allowed scope: verification صفحه OperationalHistory، cleanup dead code مرتبط در صورت اثبات، tests و build.
* Forbidden scope: P56، extraction جدید، feature، UI، route، storage، model/service/analyzer، prototype و سایر ماژول‌ها.
* Recommendation: تنها code resume candidate پیشنهادی؛ این سند مجوز اجرای آن نیست.

### Option C — Start New Feature/Module

شروع Cockpit، Product، Finance، Production، Mobile یا P56.

* Benefit: خروجی ظاهری یا دامنه‌ای جدید سریع‌تر دیده می‌شود.
* Risk: بسیار بالا؛ contract/data readiness ناکافی، duplicate ownership و Cockpit بدون موتور محتمل است.
* Required approval: چند approval مستقل معماری، داده، implementation و در مواردی security؛ در وضعیت فعلی صادر نشده‌اند.
* Allowed scope: هیچ scope اجرایی در وضعیت فعلی ندارد.
* Forbidden scope: تمام implementationهای ذکرشده، P56 و direct subproject merge.
* Recommendation: رد شود و frozen/blocked بماند.

## 4. Evaluation Matrix

امتیاز `5` بهترین وضعیت هر معیار است؛ در ستون Code risk، `5` به معنی ریسک کمتر است.

| Option | Business value | Architecture safety | Data readiness | Code risk | V1 fit | Freeze compatibility | Recommended? |
|---|---:|---:|---:|---:|---:|---:|---|
| Option A — Continue Docs Freeze | 4 | 5 | 4 | 5 | 4 | 5 | YES, safe fallback |
| Option B — Resume Code For P55A Only | 4 | 4 | 5 | 4 | 5 | 3 | YES, preferred candidate with separate resume |
| Option C — Start New Feature/Module | 3 | 1 | 1 | 1 | 1 | 1 | NO |

## 5. Required Decision

Recommended decision:

`Option B — Resume Code For P55A Only`

این سند اجازه اجرا نیست و فقط توصیه رسمی Project Core را ثبت می‌کند. اجرای واقعی فقط با دستور جداگانه `CORE-RESUME-P55A` مجاز است. تا صدور آن، Option B نیز عملاً frozen باقی می‌ماند.

## 6. Why P55A Is The Only Code Candidate

- P55 قبلاً انجام شده است.
- test و build در P55 با نتیجه PASS گزارش شده‌اند.
- line count در `WorkforcePages.tsx` قبل و بعد برابر گزارش شده است.
- پیش از هر P56 باید مشخص شود old OperationalHistory body یا dead code مرتبط کاملاً حذف شده است یا نه.
- P55A کوچک، محدود و verification-focused است.
- P55A feature جدید نیست.
- P55A Cockpit، Product، Finance یا Production را باز نمی‌کند.
- P55A فقط بدهی معماری موجود و صحت extraction قبلی را بررسی می‌کند.

## 7. Why P56 Is Not Allowed Yet

P56 extraction فعلاً مجاز نیست، زیرا:

- P55A هنوز اجرا نشده است.
- روشن نیست old OperationalHistory body کاملاً حذف شده یا dead code باقی مانده است.
- پیش از استخراج صفحه جدید، extraction قبلی باید verify شود.
- P56 کدنویسی واقعی است و بدون `CORE-RESUME` جدا ممنوع است.

## 8. Why Cockpit Is Still Frozen

Cockpit هنوز frozen است، زیرا:

- Cockpit نباید source of truth باشد.
- implementation بدون data/task/decision/audit خطر ویترین‌سازی دارد.
- read-only summary contract هنوز به‌صورت مستقل قفل نشده است.
- action واقعی در Cockpit به approval جدا نیاز دارد.

## 9. Why Product/Finance/Production Are Not Code-Ready

### Product/Mahak

- direct merge ممنوع است.
- detailed extraction/data contract لازم دارد.

### Finance/Audit

- direct merge ممنوع است.
- transaction mapping و finance data contract لازم دارد.

### Production

- Recipe/BOM + WorkOrder contract لازم دارد.
- هنوز implementation-ready نیست.

### Visual Inventory/Media

- MediaAsset capture flow contract لازم دارد.

## 10. Resume Gate For P55A

اگر Project Core در آینده `CORE-RESUME-P55A` صادر کرد، P55A باید این محدودیت‌ها را رعایت کند.

Allowed:

- فقط branch `refactor/workforce-core-stabilization-p55`
- فقط بررسی extraction مربوط به `OperationalHistoryPage`
- فقط cleanup dead code مرتبط با OperationalHistory، اگر وجود آن اثبات شد
- فقط testهای مرتبط
- فقط docs کنترلی در صورت cleanup واقعی
- `npm test`
- `npm run build`

Forbidden:

- P56
- page extraction جدید
- feature جدید
- route جدید
- UI/CSS redesign
- localStorage key
- model/service/analyzer logic change
- prototype
- package/lock
- database/auth/API/backend/storage
- merge/main/push
- Product/Finance/Cockpit/Production changes

## 11. Next Action Recommendation

پیشنهاد قدم بعد:

`CORE-RESUME-P55A — Verify OperationalHistory Extraction Cleanup`

این فقط پیشنهاد است و اجرای آن به دستور جداگانه Project Core نیاز دارد.

اگر Project Core تصمیم بگیرد freeze ادامه یابد، جایگزین docs-only بعدی می‌تواند یکی از موارد زیر باشد:

- `CORE-P08 — Product + Inventory Detailed Data Contract`
- `CORE-P08 — Finance Transaction Mapping Contract`

## 12. Final Decision Statement

CORE-P07 does not resume code.

CORE-P07 recommends only one safe code resume candidate: P55A verification.

All other code paths remain frozen. P56 remains blocked. Cockpit remains frozen. Subproject merge remains forbidden. main remains locked. Any code action requires a separate `CORE-RESUME` instruction.
