# Cockpit Prototype Build Stop Rules

آخرین به‌روزرسانی: 2026-06-29

## Build Stop Rules چیست؟

شرایط غیرقابل مذاکره‌ای هستند که build آینده را فوراً متوقف می‌کنند تا approval محدود prototype به تغییر production تبدیل نشود.

## محرک‌های توقف فوری

- working tree قبل از شروع پاک نباشد.
- checkpoint یا file scope نامشخص باشد.
- نیاز به route یا navigation اصلی ایجاد شود.
- نیاز به database، backend یا migration ایجاد شود.
- نیاز به auth یا نقش واقعی ایجاد شود.
- نیاز به production localStorage key یا shared storage ایجاد شود.
- داده واقعی لازم یا مشاهده شود.
- component prototype به main یا production component متصل شود.
- action، approval، import یا write واقعی ساخته شود.
- service/analyzer business logic اصلی نیازمند تغییر شود.
- AI به عنوان تصمیم نهایی نمایش داده شود.
- audit، risk یا confidence حذف، پنهان یا گمراه‌کننده شود.
- reset demo state یا rollback path قابل اجرا نباشد.

## اقدام پس از توقف

- هیچ commit یا push برای build ناقض boundary انجام نشود.
- علت و فایل‌های متاثر گزارش شوند.
- تغییرهای همان build طبق rollback plan یا reset مصوب بازگردانده شوند.
- پاک بودن main و production storage تایید شود.
- approval جدید با scope اصلاح‌شده از مرکز کنترل درخواست شود.

## نتیجه‌های مجاز توقف

- `blocked`
- `needs_revision`
- `frozen`
- `rolled_back`

## قانون نهایی

تصمیم `APPROVED_FOR_ISOLATED_BUILD` مجوز عبور از هیچ stop rule نیست. مشاهده هر محرک، approval جاری را برای آن مسیر نامعتبر می‌کند.
