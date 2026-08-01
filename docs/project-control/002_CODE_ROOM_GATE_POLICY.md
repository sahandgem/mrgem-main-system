# Code Room Gate Policy

آخرین به‌روزرسانی: 2026-06-30

## نقش اتاق کد

اتاق کد gate فنی پیش از اجرای Codex است. هدف آن بررسی امکان اجرای امن ماموریت، نه تغییر تصمیم معماری مادر است.

## کنترل‌های اجباری Gate

- branch دقیق ماموریت
- پاک بودن working tree
- owner و workstream
- فایل‌های مجاز و ممنوع
- scope رفتاری و داده‌ای
- نیاز یا عدم نیاز به code/UI/database/auth/storage/API
- rollback path و rollback owner
- stop rules
- test/build/manual review requirements
- commit message و push target
- merge policy

## اختیارات اتاق کد

- تایید فنی شروع ماموریت در scope داده‌شده
- شکستن ماموریت به چند گام کوچک و قابل rollback
- توقف ماموریت در صورت ambiguity، conflict یا scope expansion
- درخواست بازگشت تصمیم به اتاق فرمان

## محدودیت اختیارات

- اتاق کد حق تایید merge به main ندارد.
- حق تایید implementation واقعی خارج از approval اتاق فرمان ندارد.
- حق تغییر جهت پروژه، architecture decision یا module priority ندارد.
- حق گسترش خودکار scope یا افزودن dependency ندارد.
- فقط داخل ماموریت مصوب می‌تواند چند مرحله جلو برود.

## Return-to-Control-Room Conditions

ماموریت باید به اتاق فرمان برگردد اگر:

- به تصمیم مدیریتی یا product tradeoff برسد.
- نیاز به merge، production integration یا real data پیدا کند.
- branch/file ownership conflict رخ دهد.
- rollback نامشخص باشد.
- scope مصوب برای تکمیل کافی نباشد.
- stop rule فعال شود.

## استثنای Docs-only Safe

مرکز کنترل می‌تواند ماموریت را صریحاً `docs-only` و `safe` اعلام کند. حتی در این حالت preflight Git، file scope، عدم تغییر code و گزارش پایان الزامی هستند.
