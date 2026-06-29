# Cockpit Prototype Execution Guardrails

آخرین به‌روزرسانی: 2026-06-29

## Execution Guardrails چیست؟

کنترل‌های اجباری قبل، هنگام و بعد از build ایزوله آینده‌اند تا approval محدود P37 به main integration، داده واقعی یا رفتار production گسترش پیدا نکند.

## قبل از build آینده

- git status باید پاک باشد.
- checkpoint تاییدشده پیش از تغییر وجود داشته باشد.
- file scope و مالک هر فایل تایید شده باشد.
- mock fixture مصنوعی و expected result تایید شده باشند.
- داده واقعی، main route و main navigation ممنوع باشند.
- production localStorage، database، auth و migration استفاده نشوند.
- production write یا action برگشت‌ناپذیر وجود نداشته باشد.
- reset demo state، prototype banner و visible demo label طراحی شده باشند.
- test command، rollback owner و exit criteria مشخص باشند.

## هنگام build آینده

- اگر route اصلی لازم شد: توقف.
- اگر database، backend یا migration لازم شد: توقف.
- اگر auth یا role واقعی لازم شد: توقف.
- اگر داده واقعی لازم شد: توقف.
- اگر production storage یا shared key لازم شد: توقف.
- اگر تصمیم، approval یا import واقعی لازم شد: توقف.
- اگر service/analyzer اصلی نیازمند تغییر شد: توقف.
- اگر AI به جای suggestion به decision تبدیل شد: توقف.

## بعد از build آینده

- testهای isolation و mock behavior اجرا شوند.
- فهرست فایل‌های تغییرکرده و محدودیت‌ها ثبت شود.
- عدم وجود route/storage/database/auth/real-data dependency بررسی شود.
- reset demo state و rollback path قابل اجرا باشند.
- خروجی prototype-only باقی بماند.
- commit کوچک، مستقل و قابل rollback باشد.
- هیچ merge یا main integration بدون approval جدید انجام نشود.

## enforcement

هر نقض guardrail نتیجه را `blocked` می‌کند. ادامه کار فقط پس از rollback/reset و تصمیم جدید مرکز کنترل مجاز است.
