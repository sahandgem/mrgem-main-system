# Cockpit Isolated Prototype Build Approval Decision

آخرین به‌روزرسانی: 2026-06-29

## وضعیت تصمیم

این سند خروجی CONTROL-P37-BATCH و تصمیم رسمی مرکز کنترل برای اجازه محدود ساخت prototype ایزوله در یک مرحله اجرایی مستقل آینده است. در این مرحله هیچ کد یا prototype ساخته نمی‌شود.

| موضوع | وضعیت |
|---|---|
| Prototype Build Decision | `APPROVED_FOR_ISOLATED_BUILD` |
| Build Started | `NO` |
| Main Integration | `NOT_APPROVED` |
| Real Implementation | `NOT_APPROVED` |
| Production Data Usage | `NOT_APPROVED` |

## Cockpit Isolated Prototype Build Approval Decision چیست؟

تصمیمی محدود و قابل لغو است که فقط اجازه می‌دهد در یک دستور آینده و مستقل، prototype نمایشی Central Cockpit Overview Screen در boundary ایزوله و با داده مصنوعی ساخته شود. این approval هیچ مجوزی برای main، production یا action واقعی ایجاد نمی‌کند.

## محدوده approval

- فقط Central Cockpit Overview Screen
- فقط mock/synthetic signals مصوب
- فقط محیط ایزوله و prototype-only
- فقط demo/read-only behavior
- بدون تصمیم، approval، reject یا mutation واقعی
- بدون write یا import واقعی
- بدون route و navigation اصلی
- بدون database، backend و migration
- بدون auth و نقش واقعی
- بدون production localStorage key یا shared storage
- بدون داده واقعی مالی، کالا، موجودی، کارمند، محک یا بانک

## دلیل approval محدود

- Design Lab Rulebook آماده است.
- Screen Spec و Layout/Card Behavior Spec آماده‌اند.
- Mock Dataset Spec آماده است.
- Isolation Boundary آماده است.
- Test Plan آماده است.
- Rollback/Exit Plan آماده است.
- Pre-build Checklist آماده است.
- File Scope و Execution Guardrails در همین بسته ثبت می‌شوند.

## شرایط استفاده از approval

- build فقط با دستور اجرایی مستقل بعدی آغاز می‌شود.
- پیش از شروع باید checkpoint پاک، file scope دقیق و mock fixture تایید شوند.
- خروج از scope یا نیاز به production dependency approval را فوراً متوقف می‌کند.
- نتیجه این تصمیم قابل انتقال به main implementation نیست.

## قانون نهایی

این approval فقط `APPROVED_FOR_ISOLATED_BUILD` است. Main Integration و Real Implementation همچنان `NOT_APPROVED` هستند و هر توسعه خارج از scope باید متوقف و دوباره به مرکز کنترل ارجاع شود.
