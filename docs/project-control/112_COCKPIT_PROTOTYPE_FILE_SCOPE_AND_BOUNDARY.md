# Cockpit Prototype File Scope and Boundary

آخرین به‌روزرسانی: 2026-06-29

## وضعیت سند

این سند ناحیه‌های مجاز و ممنوع build احتمالی آینده را تعریف می‌کند. مسیر دقیق فایل‌ها باید در دستور اجرایی مستقل بعدی تایید شود؛ CONTROL-P37 هیچ فایل کدی ایجاد نمی‌کند.

## Prototype File Scope چیست؟

فهرست بسته‌ای از نوع فایل‌ها و وابستگی‌هایی است که prototype آینده اجازه ایجاد یا استفاده از آن‌ها را دارد. هر فایل خارج از scope، blocker و محرک توقف است.

## ناحیه‌های مجاز در build آینده

- isolated prototype folder با نام واضح prototype/demo
- mock data fixture file
- isolated mock service file
- prototype-only screen/component files
- prototype-only style file در صورت ضرورت
- prototype README شامل boundary، reset و اجرای تست
- testهای محدود به mock behavior و isolation boundary

## ناحیه‌های ممنوع

- production routes و route registry
- production navigation و shell اصلی
- production page/component behavior
- database، backend و migration files
- auth و permission files
- storage services و production localStorage registry
- real API services
- adapterهای واقعی مالی، کالا، کارمند، محک و بانک
- analyzer/service business logic فعلی
- هر فایل موثر بر رفتار main app

## قانون naming

- نام هر فایل و export باید واژه روشن `prototype`، `mock` یا `demo` داشته باشد.
- هیچ نامی نباید production readiness یا main integration را القا کند.
- fixtureها باید synthetic و به‌وضوح غیرواقعی باشند.

## قانون dependency

- dependency فقط به mock fixture/service و utilityهای عمومی بدون side effect مجاز است.
- prototype نباید به database، auth، main route، production storage یا adapter واقعی وابسته شود.
- service، analyzer یا مدل production نباید برای پشتیبانی prototype تغییر کند.
- import معکوس از main به prototype ممنوع است.

## قانون scope change

اگر build آینده به فایل یا dependency خارج از این boundary نیاز داشت، کار باید متوقف شود و approval جدید مرکز کنترل دریافت شود.
