# Parallel Workstream Control

آخرین به‌روزرسانی: 2026-06-30

## قواعد کار همزمان

- کار همزمان فقط با branch جدا مجاز است.
- هر workstream باید owner، branch، status و scope مشخص داشته باشد.
- فایل‌های مجاز و ممنوع هر مسیر باید پیش از شروع ثبت شوند.
- دو مسیر نباید همزمان یک فایل حساس مشترک را تغییر دهند.
- اگر دو مسیر به یک فایل حساس نیاز دارند، یکی باید متوقف شود و مالکیت زمان‌بندی‌شده بگیرد.
- merge چند branch همزمان ممنوع است؛ هر merge مستقل review می‌شود.
- هر مسیر باید گزارش پایان، commit، push status و rollback داشته باشد.

## فایل‌ها و ناحیه‌های حساس

- `docs/project-control/01_CURRENT_STATE.md`
- `docs/project-control/02_ARCHITECTURE_DECISIONS.md`
- `docs/project-control/03_PHASE_LOG.md`
- `docs/project-control/08_BACKLOG.md`
- `src/`
- `package.json`
- database و migrationها
- auth و permissionها
- branch `main`

## قانون مالکیت فایل حساس

مالکیت فایل حساس باید پیش از تغییر مشخص شود. یک فایل حساس در هر لحظه فقط یک owner فعال دارد. handoff مالکیت باید با git status پاک و commit/push مشخص انجام شود.

## Workstreamهای فعلی

| Track | Owner | Branch | Scope | Status | Forbidden |
|---|---|---|---|---|---|
| Cockpit Review Track | Code Room | `prototype/cockpit-overview-isolated` | P48 تا P50 | `ACTIVE` | main merge، src، route، database، auth، storage، API، real data |
| Project Operating Rules Track | Control Room | `prototype/cockpit-overview-isolated` فقط برای bootstrap صریح OPS-01 | `docs/project-control` | `ACTIVE_FOR_OPS_01_BOOTSTRAP` | code، prototype، src، package، database، auth، main |
| Mahak/Product Data Track | تعیین در زمان activation | `data/mahak-analysis-safe` | تحلیل امن داده/معماری محک | `PLANNED` | merge مستقیم، real import، main/database changes |
| Production Engine Planning Track | تعیین در زمان activation | `docs/production-engine-planning` | docs-only planning | `PLANNED` | engine code، database، main |
| Inventory Photo Flow Track | تعیین در زمان activation | `docs/inventory-photo-flow` | docs-only flow design | `PLANNED` | upload واقعی، storage، API، main |

## استثنای Bootstrap OPS-01

OPS-01 طبق دستور صریح مرکز کنترل روی branch فعلی ثبت می‌شود. پس از این commit، ادامه Project Operating Rules Track باید branch مستقل و مالکیت جدا برای فایل‌های حساس داشته باشد؛ هم‌زیستی دائمی دو track فعال روی یک branch مجاز نیست.

## Conflict Protocol

1. تغییر مشترک یا فایل حساس تشخیص داده شود.
2. هر دو مسیر پیش از edit متوقف شوند.
3. اتاق فرمان owner و ترتیب اجرا را تعیین کند.
4. مسیر اول commit و push و handoff تمیز ارائه دهد.
5. مسیر دوم فقط پس از sync و تایید scope ادامه دهد.
