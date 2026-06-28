# Backlog

آخرین به‌روزرسانی: 2026-06-29

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
| CORE/DATA/INV | طراحی Product Schema Draft | تبدیل مدل مفهومی کالا به schema پیشنهادی، بدون migration |
| DATA-MAHAK | طراحی Product Adapter Boundary | مرز استخراج/تبدیل داده کالا از پروژه کالا یا محک، بدون merge |
| DATA-MAHAK | بررسی خروجی محک | تحلیل ستون‌ها، mapping و محدودیت‌های Excel/محک |
| DATA-MAHAK | بررسی بانک سنگ | استخراج مفهومی نوع سنگ و ویژگی‌های لازم |
| DATA-MAHAK | بررسی barcode strategy | بررسی تولید، یکتایی، alias و کنترل تکراری بارکد |
| DATA-MAHAK | بررسی AI-ready product export | طراحی خروجی تمیز و قابل تحلیل برای AI |
| DATA-MAHAK | طراحی Product Import Validator | اعتبارسنجی داده کالا قبل از هر import یا UI |
| DATA-MAHAK | طراحی Product Duplicate Detector | تشخیص تکراری بر اساس کد داخلی، کد محک، بارکد، نام، وزن و سنگ |
| DATA-MAHAK | طراحی Mahak Export Adapter | تولید preview و mapping خروجی محک بدون نوشتن در سیستم اصلی |
| DATA-MAHAK | طراحی AI Product Snapshot | snapshot نسخه‌دار و تمیز برای تحلیل هوشمند |
| DATA-MAHAK | طراحی Product Auto-fix Rules | قواعد پیشنهادی برای اصلاح امن نام سنگ، گروه، barcode format و statusها |
| DATA-MAHAK | طراحی Product Review Queue | صف بررسی کالاهای دارای warning، duplicate یا merge/update candidate |
| DATA-MAHAK | طراحی Product Import Decision Flow | جریان تصمیم برای allowed، blocked، review، merge، update و create |
| DATA-MAHAK | طراحی Product Duplicate Resolution Flow | روش حل duplicate بدون merge خودکار و با تأیید مرکز فرمان |
| DATA-MAHAK | بررسی Mahak Export Adapter بعد از validator | خروجی محک فقط پس از validator و duplicate detector بررسی شود |
| DATA-MAHAK | طراحی Product Correction Log | ثبت اصلاح‌ها، تصمیم‌ها، مقدار قبلی/پیشنهادی و تأییدکننده |
| UI | بررسی Product UI بعد از کاهش بدهی Workforce | UI کالا فقط بعد از مدل/schema/validator و کاهش بدهی WF |
| CORE/FIN | طراحی Core Financial Event Model | مدل مشترک آینده برای نقدینگی، رسید و رویداد مالی |
| CORE/FIN | طراحی Financial Schema Draft | تبدیل مدل مفهومی رویداد مالی به schema پیشنهادی، بدون migration |
| FIN-AUDIT | طراحی Financial Adapter Boundary | مرز استخراج/تبدیل داده مالی از پروژه پول، بدون merge |
| FIN-AUDIT | بررسی liquidity model از audit-app | تحلیل مدل فشار نقدینگی و cash-in/cash-out |
| FIN-AUDIT | بررسی approval workflow | طراحی جریان ثبت، بررسی، تایید و رد مدیر |
| FIN/MOBILE | بررسی receipt attachment flow | اتصال سند یا عکس رسید به رویداد مالی |
| CORE/FIN | بررسی bank transaction mapping | mapping تراکنش بانکی به رویداد مالی، بدون اتصال واقعی |
| MOBILE | بررسی mobile receipt capture flow | ثبت رسید از اپ موبایل پس از تثبیت مدل مالی و رسید |
| CORE/INV | طراحی Core Inventory Model | مدل مشترک ورود/خروج، موجودی، مکان و مغایرت |
| PROD | طراحی Production Flow Model | مدل جریان تولید پس از تثبیت کالا و انبار |
| FIN/MOBILE | طراحی Receipt Capture Flow | جریان ثبت رسید، عکس، بررسی و اتصال به رویداد مالی |
| MOBILE | طراحی Mobile Capture App | اپ ثبت سبک پس از مدل رسید و رویداد مالی |
| DATA-MAHAK | طراحی Mahak Integration Boundary | مرز اتصال محک، خروجی‌ها و کنترل تکراری |
| CORE/UI | طراحی Central Cockpit Dashboard Map | نقشه KPIها، alertها و decisionها برای کابین مرکزی |
| UI | طراحی Design Lab repo | repo جدا برای UI/UX، design tokens و component patterns |
| UI | طراحی UI/UX cockpit prototype | prototype مستقل از main برای cockpit مدیریتی |
| UI | طراحی component pattern extraction | روش ورود pattern/component تأییدشده از Design Lab به main |
| CONTROL | طراحی multi-Codex handoff protocol | پروتکل تحویل کار بین Codexها و مرکز فرمان |
| CONTROL | طراحی branch ownership rules | مالکیت branch/file/workstream برای جلوگیری از conflict |
| CONTROL | طراحی merge approval checklist | checklist قبل از هر merge به main |
| CONTROL | طراحی rollback checklist | تعریف مسیر برگشت برای mergeهای کدی و lab output |
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
