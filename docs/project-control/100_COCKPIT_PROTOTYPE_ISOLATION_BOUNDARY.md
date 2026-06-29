# Cockpit Prototype Isolation Boundary

آخرین به‌روزرسانی: 2026-06-29

## وضعیت

این سند خروجی CONTROL-P34-BATCH است و مرز ایزوله‌سازی prototype احتمالی آینده کابین خلبانی را تعریف می‌کند. این سند مجوز ساخت prototype، UI، route، component، storage یا اتصال واقعی نیست.

## Cockpit Prototype Isolation Boundary چیست؟

این مرز مجموعه قواعدی است که تضمین می‌کند یک prototype احتمالی فقط محیطی نمایشی، برگشت‌پذیر و مستقل باشد و هیچ اثر اجرایی روی برنامه اصلی، داده واقعی یا تصمیم مدیریتی واقعی نگذارد.

## مواردی که باید جدا بمانند

- routeهای برنامه اصلی
- componentهای production
- کلیدهای production در localStorage
- database و migrationها
- auth و نقش‌های واقعی
- داده مالی واقعی
- داده کالا و موجودی واقعی
- داده واقعی کارمندان
- داده واقعی محک
- داده واقعی بانک و رسید
- actionها و approvalهای واقعی مدیر

## قواعد ایزوله‌سازی

- `no production write`: هیچ نوشتنی روی داده یا سرویس production مجاز نیست.
- `no real route`: prototype نباید route اصلی یا production بسازد یا تغییر دهد.
- `no shared storage key`: استفاده از کلید storage مشترک با main ممنوع است.
- `no database dependency`: prototype نباید به database یا migration وابسته باشد.
- `no auth dependency`: استفاده از auth و نقش‌های واقعی ممنوع است.
- `no real manager approval mutation`: تصمیم نمایشی مدیر نباید approval واقعی ایجاد یا تغییر دهد.
- `no irreversible action`: هیچ action برگشت‌ناپذیر مجاز نیست.
- `no direct main integration`: اتصال مستقیم به main ممنوع است.
- `no direct Design Lab merge`: خروجی Design Lab نباید مستقیم merge شود.

## الزامات prototype احتمالی آینده

- banner واضح prototype
- برچسب دائمی demo/mock
- استفاده انحصاری از mock/synthetic data
- mock service ایزوله و بدون production persistence
- امکان reset و پاک‌سازی کامل demo state
- نمایش روشن risk، confidence و audit state مصنوعی
- رفتار deterministic و سناریوهای قابل تکرار
- فهرست فایل‌های محدود و مالک مشخص

## کنترل قبل از approval

پیش از هر approval برای ساخت prototype، مرکز کنترل باید این boundary، فایل‌های درگیر، storage plan، داده mock، test plan و rollback/exit plan را بررسی و صریحاً تایید کند. آماده بودن این سند به تنهایی مجوز ساخت نیست.

## وضعیت نهایی

`Cockpit Prototype = ON_HOLD`  
`Cockpit Implementation = NOT_APPROVED`
