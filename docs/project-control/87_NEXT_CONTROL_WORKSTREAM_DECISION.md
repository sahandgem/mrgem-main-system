# Next Control Workstream Decision

آخرین به‌روزرسانی: 2026-06-29

## وضعیت

این سند گزینه‌های مسیر بعدی مرکز کنترل را پس از freeze موقت Product Import ثبت می‌کند. هیچ گزینه‌ای در این سند به معنی شروع خودکار کار نیست؛ انتخاب نهایی باید با دستور مستقل مرکز کنترل انجام شود.

## Next Control Workstream Decision چیست؟

Next Control Workstream Decision فهرست گزینه‌های منطقی بعدی برای ادامه پروژه است. هدف آن کمک به انتخاب مسیر بعدی بدون ایجاد route، UI، prototype، repo، database، migration یا implementation واقعی است.

## گزینه‌های پیشنهادی

### 1. Design Lab Foundation Package

| بخش | توضیح |
|---|---|
| هدف | ساخت rulebook مستند برای Design Lab، شامل handoff، tokens، screen spec، review language و approval boundary |
| فایده | قبل از هر طراحی UI یا prototype، زبان مشترک و محدودیت‌های lab را کامل می‌کند |
| ریسک | اگر بد تعریف شود، Design Lab ممکن است خروجی قابل merge مستقیم تصور شود |
| پیش‌نیاز | P17، P18، P28، P29 و freeze Product Import |
| چرا الان مناسب است؟ | Product Import و Cockpit concepts آماده‌اند و قبل از UI واقعی باید Design Lab rulebook کامل شود |

### 2. Central Cockpit UI/UX Drill-down Strategy

| بخش | توضیح |
|---|---|
| هدف | طراحی مسیر drill-down از کارت‌های cockpit به evidence، review و audit |
| فایده | cockpit آینده تصمیم‌محورتر و قابل ردیابی‌تر می‌شود |
| ریسک | اگر زود وارد UI شود، ممکن است main app را تغییر دهد |
| پیش‌نیاز | Design Lab foundation و card map فعلی |
| چرا الان مناسب یا نامناسب است؟ | مناسب برای طراحی بعدی است، اما بهتر است پس از rulebook Design Lab انجام شود |

### 3. Workforce Code Refactor Continuation

| بخش | توضیح |
|---|---|
| هدف | ادامه extraction کنترل‌شده از `WorkforcePages.tsx` |
| فایده | بدهی معماری WF کاهش می‌یابد |
| ریسک | تغییر کدی دارد و باید جدا از control docs اجرا شود |
| پیش‌نیاز | git clean، scope کوچک، test/build |
| چرا الان مناسب یا نامناسب است؟ | مناسب برای فاز اجرایی WF است، اما اگر مرکز کنترل بخواهد docs راهبردی را ادامه دهد، اولویت دوم است |

### 4. Finance Bank Excel Automation Architecture

| بخش | توضیح |
|---|---|
| هدف | دقیق‌تر کردن معماری bank Excel automation و matcher مالی |
| فایده | مسیر مالی آینده برای import روزانه بانک روشن‌تر می‌شود |
| ریسک | اگر زود اجرا شود، خطر تغییر auth/database و داده مالی واقعی دارد |
| پیش‌نیاز | financial schema، validation، review queue و bank test plan |
| چرا الان مناسب یا نامناسب است؟ | برای آینده مهم است، اما بهتر است پس از تثبیت Design Lab rulebook یا با دستور مستقل مالی انجام شود |

### 5. Production Formula Architecture

| بخش | توضیح |
|---|---|
| هدف | طراحی مفهومی فرمول تولید، مواد، هزینه و ریسک تولید |
| فایده | زمینه اتصال کالا، انبار و تولید را آماده می‌کند |
| ریسک | بدون Core Product/Inventory دقیق ممکن است زودهنگام باشد |
| پیش‌نیاز | Core Product Model، Product Feature Boundary و Inventory draft |
| چرا الان مناسب یا نامناسب است؟ | فعلاً بعداً مناسب‌تر است، چون Product Import تازه freeze شده و inventory هنوز طراحی کامل ندارد |

### 6. Inventory Visual Registry Architecture

| بخش | توضیح |
|---|---|
| هدف | طراحی رجیستری دیداری انبار، وضعیت موجودی و هشدارهای مغایرت |
| فایده | برای cockpit و تولید ارزش بالایی دارد |
| ریسک | بدون schema و event boundary ممکن است به UI زودرس تبدیل شود |
| پیش‌نیاز | Core Inventory Model، Product Model و reporting/read model strategy |
| چرا الان مناسب یا نامناسب است؟ | گزینه آینده خوب است، اما هنوز Design Lab Foundation اولویت امن‌تری دارد |

## پیشنهاد پیش‌فرض

**Design Lab Foundation Package**

## دلیل پیشنهاد

Product Import و Cockpit concepts آماده‌اند و قبل از ساخت هر UI واقعی، prototype یا component باید rulebook Design Lab کامل شود. این مسیر کم‌ریسک است، فقط مستندسازی می‌خواهد و کمک می‌کند خروجی‌های آینده Design Lab با مرزهای main app، approval، synthetic data و handoff سازگار بمانند.
