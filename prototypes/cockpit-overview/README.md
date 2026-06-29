# Central Cockpit Overview - Isolated Prototype

این پوشه یک نمونه نمایشی مستقل و mock-only برای صفحه مفهومی «کابین مرکزی مستر جم» است.

## مرز ایزوله

- به route یا navigation برنامه اصلی متصل نیست.
- از database، backend، API، auth، localStorage و sessionStorage استفاده نمی‌کند.
- هیچ داده واقعی مالی، کالا، موجودی، تولید، کارمند، محک یا بانک ندارد.
- هیچ approve، reject، import، write یا تصمیم واقعی انجام نمی‌دهد.
- تمام اعداد، عنوان‌ها، زمان‌ها و signalها ساختگی هستند.

## اجرای دستی

فایل زیر را مستقیماً در مرورگر باز کنید:

`prototypes/cockpit-overview/index.html`

یا از ریشه پروژه یک static server ساده اجرا کنید و همین مسیر را باز کنید.

## محدوده نمایش

- نوار وضعیت کلی
- هشت signal مصنوعی
- کارت‌های بحرانی و عملیاتی
- پیشنهاد mock هوش مصنوعی
- صف بررسی مفهومی مدیر
- خلاصه risk، confidence و audit
- پنل drill-down مفهومی بدون عملیات واقعی

## محدودیت‌ها

این prototype فقط برای ارزیابی چیدمان، زبان دیداری و مرز تصمیم است. ورود آن به main، اتصال به داده واقعی یا تبدیل actionهای نمایشی به عملیات اجرایی مجاز نیست.

## Rollback

Rollback کامل برابر است با حذف پوشه زیر:

`prototypes/cockpit-overview`
