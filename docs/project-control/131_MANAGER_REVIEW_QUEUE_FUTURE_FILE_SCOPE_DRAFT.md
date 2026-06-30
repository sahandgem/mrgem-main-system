# Manager Review Queue Future File Scope Draft

آخرین به‌روزرسانی: 2026-06-30

## وضعیت

این سند فقط `DRAFT` است و مجوز ساخت فایل، prototype، UI یا component نیست.

## پوشه پیشنهادی آینده

`prototypes/cockpit-manager-review-queue/`

این مسیر فقط پس از approval مستقل مرکز کنترل قابل ایجاد است.

## فایل‌های احتمالی مجاز

- `README.md`
- `index.html`
- `styles.css`
- `mock-review-items.js`
- `prototype.js`
- `manual-test-checklist.md`

## مسئولیت فایل‌های احتمالی

| فایل | مسئولیت محدود |
|---|---|
| README.md | boundary، اجرای دستی و rollback |
| index.html | shell مستقل RTL و mock-only |
| styles.css | style صرفاً prototype و بدون dependency خارجی |
| mock-review-items.js | fixtureهای synthetic طبق سند 122 |
| prototype.js | render و interaction مفهومی بدون storage/fetch |
| manual-test-checklist.md | تست isolation، stateها و rollback |

## فایل‌ها و ناحیه‌های ممنوع

- `src/` و همه فایل‌های production
- production routes، registry و navigation
- `package.json` و dependencyها
- database، migration و backend files
- auth، roles و permission files
- storage services و production localStorage keys
- API/fetch services
- adapterهای واقعی مالی، کالا، بانک، محک، کارمند یا مشتری
- Overview prototype frozen files

## قوانین Naming و Dependency

- نام پوشه و فایل‌ها باید mock/prototype/demo بودن را روشن کند.
- هیچ dependency به main یا production مجاز نیست.
- فقط asset، fixture و service محلی همان پوشه قابل استفاده است.
- CDN، font خارجی، API و package جدید ممنوع‌اند.
- تغییر scope نیازمند توقف و approval جدید است.

## Rollback پیشنهادی

حذف کامل `prototypes/cockpit-manager-review-queue/` باید همه آثار prototype احتمالی را حذف کند.
