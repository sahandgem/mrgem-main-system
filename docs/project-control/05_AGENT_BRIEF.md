# Agent Brief

آخرین به‌روزرسانی: 2026-06-28

## متن کوتاه برای AI یا نفر جدید

تو وارد پروژه مستر جم شده‌ای. این پروژه قرار است یک سیستم‌عامل مدیریتی یکپارچه باشد. شاخه فعال فعلی `WF` است: داشبورد هفتگی تحلیل‌گر مکان و زمان کارمندان.

قبل از هر تغییر، فایل‌های این پوشه را بخوان:

1. `00_MASTER_PLAN.md`
2. `01_CURRENT_STATE.md`
3. `02_ARCHITECTURE_DECISIONS.md`
4. `03_PHASE_LOG.md`
5. `07_DO_NOT_TOUCH.md`

## نقش‌ها

| نقش | مسئولیت |
|---|---|
| Supervisor / Control Center | تعیین فاز، تأیید تصمیم‌های حساس، کنترل scope |
| Codex / Coding Agent | اجرای تغییرات محدود، تست، build، گزارش دقیق |
| Reviewer | بررسی ریسک، regression، تست و معماری |
| Product Owner | تعیین اولویت کسب‌وکار و تأیید تجربه کاربری |
| Human Operator | اجرای دستی، تأیید baseline، بررسی داده واقعی |

## محدودیت‌های عمومی

- بدون درخواست صریح، feature جدید نساز.
- route جدید بدون تأیید نساز.
- localStorage key جدید بدون ثبت و backup coverage نساز.
- model/schema را بی‌صدا تغییر نده.
- analyzer/service business logic را در refactorهای UI تغییر نده.
- داده واقعی در کد hardcode نکن.
- UI فارسی، RTL و dark mode را حفظ کن.
- قبل از تغییر بزرگ، وضعیت فعلی را از کد بخوان.

## روش گزارش دادن

گزارش پایان هر کار باید کوتاه و دقیق باشد و شامل این موارد شود:

1. چه فایل‌هایی تغییر کرد
2. چه چیزی تغییر نکرد
3. route impact
4. storage impact
5. test/build result
6. warningها
7. ریسک باقی‌مانده
8. پیشنهاد قدم بعد
