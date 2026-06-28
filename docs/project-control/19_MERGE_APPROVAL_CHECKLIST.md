# Merge Approval Checklist

آخرین به‌روزرسانی: 2026-06-29

## هدف

این سند checklist تأیید merge به `main` را ثبت می‌کند. هیچ خروجی lab، Codex یا زیرپروژه‌ای نباید بدون این بررسی‌ها وارد `mrgem-main-system` شود.

## checklist قبل از هر merge به main

| مورد | باید بررسی شود |
|---|---|
| docs وجود دارد | آیا تغییر در docs/project-control یا سند مرتبط ثبت شده است؟ |
| boundary مشخص است | آیا محدوده module/repo/file روشن است؟ |
| test موفق است | اگر کد اجرایی تغییر کرده، test مرتبط موفق بوده است؟ |
| build موفق است | اگر لازم بوده، build موفق بوده است؟ |
| route تغییر ناخواسته ندارد | route جدید/حذف/تغییر بدون approval وجود ندارد؟ |
| localStorage جدید ندارد | key جدید بدون registry و approval اضافه نشده؟ |
| migration مجاز است یا نه | migration فقط با اجازه مرکز فرمان انجام شده؟ |
| rollback plan دارد | مسیر برگشت یا revert مشخص است؟ |
| commit کوچک و قابل فهم است | commit بزرگ و مخلوط نیست؟ |
| approval مرکز فرمان دارد | تصمیم نهایی ثبت شده؟ |

## دسته‌بندی mergeها

| نوع merge | قانون |
|---|---|
| docs-only | بدون test/build مگر مرکز فرمان بخواهد؛ باید فقط docs تغییر کرده باشد. |
| refactor کوچک | test/build لازم است؛ behavior نباید تغییر کند. |
| feature جدید | نیازمند فاز مصوب، docs، test/build و approval جداگانه است. |
| schema/model | نیازمند design doc، impact analysis و approval است. |
| route/storage/db/auth | بدون approval صریح مرکز فرمان ممنوع است. |
| lab output | مستقیم merge نمی‌شود؛ ابتدا extract idea/model/schema/pattern می‌شود. |

## rollback plan

قبل از merge باید مشخص شود:

- commit hash چیست؟
- revert یک commit کافی است یا چند commit؟
- داده کاربر تحت تأثیر قرار می‌گیرد یا نه؟
- localStorage/database تغییر کرده یا نه؟
- آیا snapshot/backup لازم است؟

## موارد توقف merge

merge باید متوقف شود اگر:

- working tree تمیز نیست.
- فایل‌های خارج از محدوده تغییر کرده‌اند.
- route یا localStorage ناخواسته تغییر کرده است.
- migration بدون approval وجود دارد.
- test/build لازم اجرا نشده یا شکست خورده است.
- زیرپروژه پول یا کالا مستقیم merge شده است.
- توضیح rollback وجود ندارد.
- approval مرکز فرمان ثبت نشده است.

## قالب گزارش merge approval

```text
Merge candidate:
Scope:
Files changed:
Docs updated:
Executable code changed:
Routes changed:
localStorage keys changed:
Migration:
Tests:
Build:
Rollback:
Approval:
Risk:
```

## پیشنهاد مرکز کنترل

این checklist باید قبل از هر merge کدی یا ورود خروجی lab به main استفاده شود. برای docs-only کنترل پروژه، کافی است working tree تمیز باشد و فقط docs تغییر کرده باشد.
