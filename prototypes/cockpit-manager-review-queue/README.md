# Manager Review Queue - Isolated Prototype

این پوشه نمونه نمایشی مستقل و mock-only صفحه «صف بررسی مدیر» در کابین مرکزی مستر جم است.

## مرز ایزوله

- هیچ route یا navigation اصلی ندارد.
- به database، backend، API، auth، localStorage یا sessionStorage متصل نیست.
- هیچ داده واقعی مالی، کالا، بانک، محک، کارمند یا مشتری ندارد.
- هیچ approve، reject، hold، escalation، write یا status change واقعی انجام نمی‌دهد.
- تمام review itemها، evidenceها، تاریخ‌ها و اعداد ساختگی هستند.
- به Overview prototype یا فایل‌های production وابسته نیست.

## اجرای دستی

فایل زیر را مستقیماً در مرورگر باز کنید:

`prototypes/cockpit-manager-review-queue/index.html`

## محدوده نمایش

- خلاصه صف و priority lanes
- فیلترهای مفهومی priority، risk و audit
- فهرست ۱۰ review item ساختگی
- detail panel انتخاب‌شده
- پیشنهاد mock هوش مصنوعی
- risk، confidence و audit state
- decisionOptions صرفاً مفهومی
- decision reason placeholder
- audit timeline concept

## Rollback

حذف کامل پوشه زیر همه آثار prototype را پاک می‌کند:

`prototypes/cockpit-manager-review-queue/`
