# Manager Review Queue Final File Scope

آخرین به‌روزرسانی: 2026-06-30

## پوشه مجاز برای Build آینده

`prototypes/cockpit-manager-review-queue/`

تمام فایل‌های build آینده باید داخل همین پوشه باشند.

## فایل‌های مجاز

- `README.md`
- `index.html`
- `styles.css`
- `mock-review-items.js`
- `prototype.js`
- `manual-test-checklist.md`

## مسئولیت محدود فایل‌ها

| فایل | مسئولیت |
|---|---|
| README.md | معرفی mock-only، اجرای دستی، boundary و rollback |
| index.html | shell مستقل، فارسی، RTL و dark-first |
| styles.css | style standalone بدون CDN یا dependency خارجی |
| mock-review-items.js | ده item synthetic مصوب |
| prototype.js | render و interaction مفهومی بدون storage/fetch |
| manual-test-checklist.md | static، interaction، isolation و rollback checks |

## فایل‌ها و ناحیه‌های ممنوع

- `src/`
- production routes، registry و navigation
- `package.json` و dependencyها
- database، migration و backend files
- auth، roles و permission files
- storage services و production keys
- API/fetch services
- adapterهای واقعی
- تمام فایل‌های Overview prototype
- هر فایل خارج از پوشه مصوب

## قواعد

- Overview prototype نباید تغییر کند.
- main و production behavior نباید تغییر کنند.
- نام‌ها و banner باید mock/prototype/demo بودن را واضح کنند.
- dependency فقط به فایل‌های محلی همین پوشه مجاز است.
- تغییر scope نیازمند توقف و approval مستقل جدید است.

## Rollback Boundary

حذف کامل `prototypes/cockpit-manager-review-queue/` باید همه آثار build احتمالی را حذف کند.
