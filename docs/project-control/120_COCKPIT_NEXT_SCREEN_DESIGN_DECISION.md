# Cockpit Next Screen Design Decision

آخرین به‌روزرسانی: 2026-06-30

## تصمیم

| موضوع | وضعیت |
|---|---|
| Selected Screen | `Manager Review Queue Drill-down Screen` |
| Screen Design | `APPROVED_FOR_CONCEPT` |
| Prototype Build | `NOT_APPROVED` |
| Main Integration | `NOT_APPROVED` |
| Implementation | `NOT_APPROVED` |

## Cockpit Next Screen Design Decision چیست؟

تصمیم مرکز کنترل برای انتخاب صفحه بعدی cockpit در سطح concept و مستندات است. این تصمیم فقط اجازه طراحی Screen Spec، mock dataset و interaction boundary را می‌دهد و مجوز UI، component، route یا prototype جدید نیست.

## دلیل انتخاب Manager Review Queue

- بعد از Overview، مدیر باید بداند کدام تصمیم‌ها منتظر بررسی هستند.
- صف review نقطه مشترک Finance، Product، Inventory، Production، Workforce، Mobile و AI است.
- این صفحه مرز اصلی Human-in-the-loop برای تصمیم‌های حساس است.
- risk، confidence، audit و blocked reason در این صفحه باید کنار هم دیده شوند.
- طراحی آن با mock/synthetic data ممکن است و به داده یا action واقعی نیاز ندارد.
- استاندارد کردن این صفحه، الگوی صفحات تصمیم‌محور بعدی را روشن می‌کند.

## کاندیدهای بعدی

- Financial Pressure Drill-down
- Product Import Metrics Drill-down
- Crisis Signal Drill-down
- AI Suggestion Review

## دلیل تعویق کاندیدهای دیگر

ابتدا باید قرارداد صف تصمیم مدیر، جزئیات item، evidence، پیشنهاد AI و audit boundary استاندارد شود. صفحات دیگر بعداً از همین الگو استفاده می‌کنند.

## مرز تصمیم

- طراحی فقط concept-only است.
- action واقعی، write، approval، rejection یا status mutation مجاز نیست.
- prototype جدید فقط با approval مستقل آینده قابل بررسی است.
- Overview prototype freeze باقی می‌ماند و به main merge نمی‌شود.
