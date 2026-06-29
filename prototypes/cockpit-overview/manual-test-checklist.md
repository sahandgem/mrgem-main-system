# Cockpit Overview Prototype - Manual Test Checklist

## پیش‌شرط

- branch برابر `prototype/cockpit-overview-isolated` باشد.
- working tree پیش از ساخت از checkpoint پاک شروع شده باشد.
- فقط پوشه `prototypes/cockpit-overview` در build تغییر کرده باشد.

## تست‌های نمایش

- [ ] `index.html` مستقیماً یا با static server باز می‌شود.
- [ ] banner «نمونه نمایشی ایزوله — داده‌ها ساختگی هستند» واضح است.
- [ ] رابط فارسی، RTL و dark-first است.
- [ ] هر ۸ signal مصنوعی در کارت یا پنل مرتبط نمایش داده می‌شوند.
- [ ] risk و confidence به‌صورت badgeهای مستقل دیده می‌شوند.
- [ ] audit indicator در کارت‌ها و خلاصه پایین صفحه دیده می‌شود.
- [ ] layout در desktop و mobile خوانا است.

## تست‌های تعامل مفهومی

- [ ] کلیک روی هر کارت، پنل drill-down مفهومی را باز می‌کند.
- [ ] پنل مقصد مفهومی، پیشنهاد، audit، risk و confidence را نشان می‌دهد.
- [ ] پیام «هیچ عملیات واقعی انجام نمی‌شود» دیده می‌شود.
- [ ] conflict، manual_only و audit_missing حالت blocked نشان می‌دهند.
- [ ] AI فقط suggestion است و decision نهایی نمایش نمی‌دهد.
- [ ] دکمه بستن، backdrop و کلید Escape پنل را می‌بندند.

## تست‌های ایزوله‌سازی

- [ ] هیچ داده واقعی در fixtureها وجود ندارد.
- [ ] هیچ استفاده اجرایی از localStorage یا sessionStorage وجود ندارد.
- [ ] هیچ fetch، API یا backend call وجود ندارد.
- [ ] هیچ database، auth یا migration dependency وجود ندارد.
- [ ] هیچ route یا main navigation ساخته یا تغییر داده نشده است.
- [ ] هیچ فایل `src`، `package.json` یا production تغییر نکرده است.
- [ ] refresh صفحه هیچ state واقعی را نگه نمی‌دارد.

## Rollback

- [ ] حذف کامل `prototypes/cockpit-overview` همه آثار prototype را پاک می‌کند.
- [ ] پس از rollback هیچ route، storage key یا dependency باقی نمی‌ماند.
