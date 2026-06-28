# Backlog

آخرین به‌روزرسانی: 2026-06-28

## الان

| اولویت | شاخه | کار | توضیح |
|---|---|---|---|
| بالا | WF | extraction کنترل‌شده adapterهای کم‌ریسک باقی‌مانده | فقط فازهای کوچک، بدون تغییر route/storage/model/behavior |
| بالا | CONTROL | نگه‌داری sync اسناد کنترل پروژه | بعد از هر P، current state و phase log اصلاح شود |

## بعداً

| شاخه | کار | توضیح |
|---|---|---|
| WF | ادامه کوچک‌سازی adapterهای باقی‌مانده | پس از WF-P31، DataCenterPage هم جدا شده است |
| FIN-AUDIT | بررسی استخراج مدل نقدینگی از پروژه پول | فقط schema/model/idea؛ merge مستقیم ممنوع |
| DATA-MAHAK | بررسی استخراج مدل کالا و بارکد از پروژه کالا | فقط schema/model/idea؛ merge مستقیم ممنوع |
| CORE/DATA/INV | طراحی Core Product Model | مدل مشترک آینده برای کالا، انبار و تولید |
| CORE/FIN | طراحی Core Financial Event Model | مدل مشترک آینده برای نقدینگی، رسید و رویداد مالی |
| CORE/INV | طراحی Core Inventory Model | مدل مشترک ورود/خروج، موجودی، مکان و مغایرت |
| PROD | طراحی Production Flow Model | مدل جریان تولید پس از تثبیت کالا و انبار |
| FIN/MOBILE | طراحی Receipt Capture Flow | جریان ثبت رسید، عکس، بررسی و اتصال به رویداد مالی |
| MOBILE | طراحی Mobile Capture App | اپ ثبت سبک پس از مدل رسید و رویداد مالی |
| DATA-MAHAK | طراحی Mahak Integration Boundary | مرز اتصال محک، خروجی‌ها و کنترل تکراری |
| CORE/UI | طراحی Central Cockpit Dashboard Map | نقشه KPIها، alertها و decisionها برای کابین مرکزی |
| CONTROL | طراحی Source Integration Plan | تبدیل نقشه منابع به برنامه استخراج مرحله‌ای |
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
