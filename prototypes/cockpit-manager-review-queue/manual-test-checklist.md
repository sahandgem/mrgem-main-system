# Manager Review Queue Prototype - Manual Test Checklist

## نمایش

- [ ] `index.html` مستقیماً باز می‌شود.
- [ ] banner «نمونه نمایشی ایزوله — داده‌ها ساختگی هستند» واضح است.
- [ ] رابط فارسی، RTL و dark-first است.
- [ ] هر ۱۰ review item مصنوعی قابل مشاهده‌اند.
- [ ] summary و priority lanes تعدادهای درست نشان می‌دهند.
- [ ] فیلترهای priority، risk و audit کار می‌کنند.
- [ ] صفحه در desktop و mobile خوانا و بدون overlap است.

## Item و Detail

- [ ] کلیک روی item فقط detail panel مفهومی را تغییر می‌دهد.
- [ ] risk، confidence و audit مستقل نمایش داده می‌شوند.
- [ ] evidence summary ساختگی دیده می‌شود.
- [ ] AI فقط suggestion است و decision نهایی نیست.
- [ ] decisionOptions فقط عنوان concept دارند.
- [ ] decision reason فقط placeholder است و چیزی ذخیره نمی‌شود.
- [ ] audit timeline فقط concept است.

## Block Rules

- [ ] `audit_missing` حالت blocked نشان می‌دهد.
- [ ] `conflict` auto-action را block می‌کند.
- [ ] `manual_only` تصمیم انسانی می‌خواهد.
- [ ] `low confidence` نیاز به review انسانی را نشان می‌دهد.
- [ ] هیچ approve، reject، write یا status change واقعی وجود ندارد.

## Isolation

- [ ] هیچ داده واقعی در fixtureها وجود ندارد.
- [ ] هیچ localStorage یا sessionStorage استفاده نمی‌شود.
- [ ] هیچ fetch، XMLHttpRequest، API یا backend call وجود ندارد.
- [ ] هیچ database، auth، route یا main integration وجود ندارد.
- [ ] هیچ import از فایل‌های production وجود ندارد.
- [ ] Overview prototype و `src` تغییر نکرده‌اند.
- [ ] `package.json` تغییر نکرده است.

## Rollback

- [ ] حذف کامل `prototypes/cockpit-manager-review-queue/` همه آثار prototype را پاک می‌کند.
- [ ] پس از rollback هیچ dependency یا state باقی نمی‌ماند.
