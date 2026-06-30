# Project Operating Rules

آخرین به‌روزرسانی: 2026-06-30

## هدف

این سند قانون مادر عملیات پروژه مستر جم برای کنترل اجرای Codex، branchها، approvalها، rollback و merge است. این قواعد در محدوده governance داخلی پروژه اعمال می‌شوند و تابع دستورات بالادستی system/developer هستند.

## مسیر ثابت کار

`اتاق فرمان → اتاق کد → Codex → گزارش برگشتی → اتاق فرمان`

## قواعد مادر

1. هیچ دستور اجرایی Codex بدون gate اتاق کد اجرا نشود، مگر مرکز کنترل آن را صریحاً `docs-only` و `safe` اعلام کند.
2. branch `main` همیشه locked است و تغییر مستقیم آن ممنوع است.
3. merge به main فقط با approval مستقل و صریح انجام می‌شود.
4. approvalهای Design، Prototype، Implementation و Merge مستقل‌اند و هیچ‌کدام جای دیگری را نمی‌گیرند.
5. هر کار باید branch، owner، scope و فایل‌های مجاز/ممنوع روشن داشته باشد.
6. هر کار باید rollback path و stop rules قابل اجرا داشته باشد.
7. اگر working tree dirty باشد، کار پیش از هر تغییر متوقف می‌شود.
8. اگر Codex برای تکمیل کار نیازمند خروج از scope باشد، باید توقف و گزارش کند.
9. prototypeها فقط mock-only هستند مگر approval مستقل خلاف آن را مشخص کند.
10. داده واقعی در prototype ممنوع است.
11. storage، API، backend، database و auth بدون approval مستقل ممنوع‌اند.
12. prototype تاییدشده پس از review باید freeze شود و تغییر بعدی approval جدا می‌خواهد.
13. گزارش یا فاز تکمیل‌شده نباید بدون دلیل و دستور صریح دوباره اجرا شود.
14. commit باید کوچک، قابل فهم و محدود به فایل‌های مصوب باشد.
15. push فقط به branch ماموریت انجام می‌شود؛ push به main یا merge ضمنی ممنوع است.

## قفل Main

- هر تغییر main نیازمند Merge Approval مستقل است.
- آمادگی design، prototype یا test مجوز merge نیست.
- Main checkpoint باید قبل و بعد از هر ماموریت گزارش شود.
- تغییر ناخواسته main یک stop condition فوری است.

## قانون Approval

| Approval | چه چیزی را مجاز می‌کند | چه چیزی را مجاز نمی‌کند |
|---|---|---|
| Design Approval | ادامه concept و specification | prototype، implementation، merge |
| Prototype Approval | build ایزوله در scope مصوب | production integration، merge |
| Implementation Approval | اجرای واقعی فقط در scope مصوب | merge خودکار |
| Merge Approval | merge مشخص و بازبینی‌شده | توسعه خارج از merge scope |

## قانون Rollback

پیش از شروع هر کار باید checkpoint، affected files، rollback owner و verification پس از rollback مشخص باشند. اگر rollback قابل توضیح نیست، کار نباید آغاز شود.

## قانون عدم اجرای تکراری

پیش از هر اجرا، phase log، commit history و current state بررسی شوند. اگر خروجی قبلاً انجام و verify شده باشد، اجرا متوقف و فقط وضعیت گزارش می‌شود؛ مگر دستور صریح برای اصلاح یا اجرای مجدد وجود داشته باشد.
