# Backlog

آخرین به‌روزرسانی: 2026-06-28

## الان

| اولویت | شاخه | کار | توضیح |
|---|---|---|---|
| بالا | CONTROL | Source Integration Map | فقط نقشه‌برداری منابع و زیرپروژه‌ها؛ بدون ادغام کد |
| بالا | CONTROL | نگه‌داری sync اسناد کنترل پروژه | بعد از هر P، current state و phase log اصلاح شود |

## بعداً

| شاخه | کار | توضیح |
|---|---|---|
| WF | استخراج `DataCenterPage` | فاز جدا، بدون تغییر route/storage/model/behavior |
| FIN-AUDIT | بررسی استخراج schema نقدینگی، roles و RLS | فقط تحلیل و استخراج ایده/مدل؛ merge مستقیم ممنوع |
| DATA-MAHAK | بررسی استخراج مدل کالا، بارکد، بانک سنگ و خروجی AI-ready | فقط تحلیل و استخراج ایده/مدل؛ merge مستقیم ممنوع |
| WF | کوچک‌سازی ادامه‌دار `WorkforcePages.tsx` | ادامه استخراج صفحه‌ها در فازهای کوچک و قابل rollback |
| CORE | dashboard مرکزی چندشاخه | اتصال KPIهای WF به کابین مرکزی مستر جم |
| UI | تست responsive و accessibility | keyboard، contrast، overflow و mobile viewport |

## پارکینگ

| شاخه | ایده | دلیل پارک شدن |
|---|---|---|
| FIN-AUDIT | Merge کامل audit-app | merge مستقیم ممنوع است |
| DATA-MAHAK | Merge کامل mahak-web-version | merge مستقیم ممنوع است |
| CORE | تغییر auth اصلی | نیازمند تصمیم امنیتی و backend |
| DATA | تغییر database اصلی | نیازمند طراحی migration/backend و تأیید مرکز کنترل |
| FIN | ماژول مالی کامل | هنوز فاز مصوب ندارد |
| PROD | برنامه تولید | نیازمند مدل دامنه جداگانه |
| INV | انبار | نیازمند تعریف موجودیت و جریان ورود/خروج |
| MOBILE | اپ موبایل | وابسته به تثبیت API/backend یا adapter |
| DATA | sync چند دستگاه | قبل از backend امن نباید ساخته شود |
| UI | redesign گسترده | فعلاً باید cockpit موجود حفظ شود |
