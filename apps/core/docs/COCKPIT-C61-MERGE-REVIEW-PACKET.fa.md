# C61 — بسته بازبینی پیش از ادغام شاخه آزمایشی هسته

تاریخ: 2026-10-12؛ فقط `sahandgem/mrgem-main-system`.

## مسیر و مرزهای قابل پیگیری
- Worktree آزمایشی: `C:\Users\danesh\Documents\MasterGem-Dev\Core-C50-AuthRace-20261012`
- شاخه آزمایشی: `feat/core-c50-auth-race-20261012`
- شاخه توسعه مقصد: `codex/dev-core` در Worktree اصلی `Core`
- پایه قبل از C50: `ae0e041`. مراحل C50 تا C55 پیش‌تر ثبت شدند؛ C56 تا C60 نیز Commit مستقل دارند.
- اجرای گزارش محلی: `node.exe apps/core/scripts/c61-local-merge-packet.mjs --summary`.

## چک‌لیست ادغام (برای زمان صدور مجوز جداگانه)
۱. Fetch با مجوز جداگانه، سپس بررسی مجدد Git و شاخه‌ها؛ این بسته فقط بر کش محلی تکیه می‌کند.
۲. حفاظت از فایل C9 ثبت‌نشده در Worktree اصلی؛ از checkout/reset/clean روی آن محل خودداری شود.
۳. تغییر C73 پروژه تولید دست‌نخورده بماند و پروژه‌های Workforce، حسابداری و محک خارج از دامنه‌اند.
۴. بازبینی امنیت نشست سمت سرور، 401/403، JWT و RLS لازم است؛ C57 فقط guard کلاینت را تقویت کرده است.
۵. اجرای دوباره تست Core، Build و Chrome C46/C54 بعد از بررسی ادغام.
۶. Merge، Push، Deploy، Migration، اتصال واقعی و تغییر Production هرکدام **نیازمند مجوز مستقل** هستند.

## معیار تصمیم
خروجی `LOCAL_REVIEW_READY` فقط بدین معناست که شاخه توسعه محلی ancestor است، Worktree تمیز است و تغییرات به محدوده مجاز محدودند. این نتیجه **GO برای Merge یا Production نیست**. خروجی گزارش وضعیت تازهٔ ریموت را تأیید نمی‌کند.

شواهد آزمون‌های C60 در `COCKPIT-C60-OFFLINE-REGRESSION.fa.md` موجود است.
