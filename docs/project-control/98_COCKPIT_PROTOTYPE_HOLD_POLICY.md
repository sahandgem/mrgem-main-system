# Cockpit Prototype Hold Policy

آخرین به‌روزرسانی: 2026-06-29

## وضعیت

این سند سیاست توقف ساخت cockpit را ثبت می‌کند. Design concept تایید مستنداتی دارد، اما ساخت prototype و implementation هنوز مجاز نیست.

## Cockpit Prototype Hold Policy چیست؟

Cockpit Prototype Hold Policy مشخص می‌کند چه فعالیت‌هایی در حالت hold مجاز هستند، چه چیزهایی ممنوع‌اند و چه شرط‌هایی برای برداشتن hold لازم است.

## وضعیت رسمی

| بخش | وضعیت |
|---|---|
| Cockpit Prototype | ON_HOLD |
| Cockpit Implementation | NOT_APPROVED |
| Design Lab Concept | APPROVED |

## موارد مجاز

- screen spec
- flow map
- wireframe
- mock scenario
- layout study
- component pattern concept
- design token proposal

## موارد ممنوع

- ساخت UI واقعی
- ساخت route
- ساخت component
- اتصال به داده واقعی
- ذخیره‌سازی واقعی
- migration
- auth
- تغییر main
- merge مستقیم Design Lab output
- استفاده از localStorage production key
- اتصال به database یا backend

## شرایط رفع hold

- first screen spec approved
- mock data protocol approved
- prototype isolation boundary approved
- test plan approved
- rollback plan approved
- control-room approval issued

## قانون

هرگونه ساخت cockpit باید با دستور مستقل مرکز کنترل باشد. CONTROL-P33 فقط approval policy و candidate انتخاب می‌کند، نه ساخت.

## وضعیت خروجی Design Lab

خروجی Design Lab تا زمانی که hold برداشته نشده، فقط می‌تواند به عنوان concept، review note، screen spec یا mock scenario نگه‌داری شود.
