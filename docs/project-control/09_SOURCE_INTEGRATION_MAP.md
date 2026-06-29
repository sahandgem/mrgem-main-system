# Source Integration Map

آخرین به‌روزرسانی: 2026-06-28

## هدف

این سند نقشه ادغام منابع مستر جم است. هدف آن فقط شناسایی ارزش منابع موجود و مسیر استخراج آینده است؛ در CONTROL-P2 هیچ کدی از هیچ پروژه‌ای merge نمی‌شود.

## قواعد مرکز کنترل

- پروژه اصلی مستر جم فعلاً روی تثبیت معماری WF و سبک‌سازی `WorkforcePages.tsx` متمرکز است.
- ماژول جدید شروع نشود تا بدهی معماری کمتر شود.
- پروژه پول و پروژه کالا فعلاً Subproject باقی می‌مانند.
- merge مستقیم `audit-app` ممنوع است.
- merge مستقیم `mahak-web-version` ممنوع است.
- فقط ایده‌ها، schemaها، مدل‌ها، الگوهای UI و منطق‌های مفید بعداً با تأیید مرکز کنترل استخراج می‌شوند.
- هر استخراج آینده باید فاز مستقل، تست، گزارش اثر متقاطع و checkpoint Git داشته باشد.

## نقشه منابع

| نام منبع | چه چیزی دارد | ارزش برای مستر جم | الان وارد شود یا بعداً | نوع استفاده | خطر ادغام مستقیم | پیشنهاد مرکز کنترل |
|---|---|---|---|---|---|---|
| پروژه اصلی مستر جم / workforce | داشبورد WF، route registry، analyzerها، localStorage services، backup، readiness، drift، history، retention، operations calendar | پایه فعلی کابین مدیریتی و الگوی local-first برای شاخه‌های بعدی | الان فقط تثبیت و سبک‌سازی | Extract UI pattern / Extract model / Keep as main project | شروع ماژول جدید قبل از کاهش بدهی `WorkforcePages.tsx` باعث پیچیدگی معماری می‌شود | تمرکز روی سبک‌سازی، تست، کنترل route/storage و آماده‌سازی کابین مرکزی |
| پروژه پول / audit-app | داشبورد بحران نقدینگی، احتمالاً schema مالی، roles، RLS، جریان تأیید مدیر و الگوی هشدار مالی | منبع آینده برای ماژول FIN و طراحی رویدادهای مالی | بعداً | Keep as subproject / Extract schema / Extract model / Extract idea / Do not merge | merge مستقیم می‌تواند auth، database، role model و UI ناسازگار وارد پروژه اصلی کند | فعلاً Subproject بماند؛ بعداً فقط schema نقدینگی، roles، RLS، ایده تأیید مدیر و dashboard نقدینگی بررسی شود |
| پروژه کالا / mahak-web-version | ثبت کالا، مدل کالا، بارکد، بانک سنگ، خروجی محک، کنترل تکراری، export آماده برای AI | منبع آینده برای DATA/INV/PROD و اتصال محک | بعداً | Keep as subproject / Extract model / Extract schema / Extract idea / Do not merge | merge مستقیم می‌تواند مدل داده، storage/database و flowهای ناسازگار وارد کند | فعلاً Subproject بماند؛ بعداً فقط مدل کالا، بارکد، بانک سنگ، خروجی محک، کنترل تکراری و AI-ready export بررسی شود |
| تحلیل‌های معماری کابین خلبانی مرکزی مستر جم | ایده کابین فرمان، KPIهای چندشاخه، decision center، alert center، branch registry و phase control | ستون CORE/CONTROL برای اتصال همه شاخه‌ها به یک مرکز تصمیم | بعداً، پس از تثبیت WF | Extract idea / Extract UI pattern / Extract model | پیاده‌سازی زودهنگام کابین مرکزی بدون قرارداد داده باعث dashboard نمایشی و شکننده می‌شود | ابتدا قرارداد KPI/alert/status هر شاخه طراحی شود؛ سپس کابین مرکزی ساخته شود |
| ایده‌های مالی، کالا، تولید، انبار، کارمندان، رسیدها، محک و جمعه‌بازار | دامنه‌های کسب‌وکار و مسیرهای احتمالی توسعه | نقشه آینده سیستم‌عامل مستر جم | بعداً | Extract idea / Extract model / Extract schema | شروع هم‌زمان چند دامنه باعث آشفتگی مدل و route می‌شود | هر دامنه در branch خودش طراحی شود؛ اول مدل هسته و eventها، بعد UI |

## تصمیم فعلی برای پروژه پول

- `audit-app` فعلاً Subproject است.
- کد آن merge نمی‌شود.
- اتصال مستقیم database/auth/RLS انجام نمی‌شود.
- بعداً فقط این موارد بررسی می‌شوند:
  - schema نقدینگی
  - roles
  - RLS
  - ایده تأیید مدیر
  - داشبورد بحران نقدینگی

## تصمیم فعلی برای پروژه کالا

- `mahak-web-version` فعلاً Subproject است.
- کد آن merge نمی‌شود.
- اتصال مستقیم database/storage انجام نمی‌شود.
- بعداً فقط این موارد بررسی می‌شوند:
  - مدل کالا
  - بارکد
  - بانک سنگ
  - خروجی محک
  - کنترل تکراری
  - AI-ready export

## تصمیم فعلی برای پروژه اصلی

- تمرکز فعلی روی سبک‌سازی `WorkforcePages.tsx` و تثبیت معماری WF است.
- ماژول جدید شروع نشود تا بدهی معماری کمتر شود.
- `DataCenterPage` هنوز adapter/compat دارد و یک کاندیدای refactor آینده است.
- هر ادغام دامنه‌ای باید از مسیر docs، مدل، schema و تست عبور کند.

## استخراج‌های آینده پیشنهادی

| موضوع | شاخه | نوع استفاده | پیش‌نیاز |
|---|---|---|---|
| مدل نقدینگی | FIN-AUDIT | Extract schema / Extract model | مرور `audit-app` بدون merge |
| roles و RLS مالی | FIN-AUDIT | Extract schema / Extract idea | تصمیم امنیتی مرکز کنترل |
| مدل کالا و بارکد | DATA-MAHAK | Extract model / Extract schema | مرور `mahak-web-version` بدون merge |
| بانک سنگ و خروجی محک | DATA-MAHAK | Extract model / Extract idea | تعریف adapter داده محک |
| Core Product Model | CORE/DATA/INV | Extract model | مطالعه کالا و انبار |
| Core Financial Event Model | CORE/FIN | Extract model | مطالعه نقدینگی و رسیدها |
| Source Integration Plan | CONTROL | Extract idea | تکمیل این map و تعیین اولویت‌ها |

## CONTROL-MAHAK-ARCH-01 - Mahak Reference-only Decision

- `mahak-web-version` و تحلیل معماری محک فقط reference-only هستند.
- merge مستقیم پروژه محک یا کدهای مرتبط با آن ممنوع است.
- وابستگی به SQL schema، tableها، columnها، queryها و viewهای محک ممنوع است.
- داده‌های تاریخی محک فقط از مسیر staging، import، validation، dry-run، review و approved import قابل استفاده هستند.
- فقط الگوهای معماری قابل استفاده‌اند: Header/Detail، BaseDocument، BaseDocumentItem، Master Data، Feature Based Product Model، Audit Trail، Status Based Soft Delete، View Based Reporting و Multi Currency Ready Design.
- هسته مستر جم باید مستقل از محک و بر اساس Event Driven Architecture، AI Ready Architecture، Domain Driven Design، Modular Architecture، Unified Business Model و Central Business Event Bus طراحی شود.
