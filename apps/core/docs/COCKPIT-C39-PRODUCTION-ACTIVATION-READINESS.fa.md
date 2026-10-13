# C39 — بررسی آمادگی اتصال واقعی Core به مرکز تولید

تاریخ: 2026-10-09

## تصمیم فعلی

**NO-GO — اتصال واقعی همچنان خاموش بماند.**

این فاز فقط‌خواندنی است. هیچ سرویس، تنظیم Auth، migration، کاربر یا مسیر Production فعال نشده است.

## شواهد بررسی‌شده

### وضعیت Supabase

پروژه `Mr Gem Production` با شناسه `jwmuasieitxapwvwigtw` در بررسی وضعیت پروژه‌ها:

`INACTIVE`

بنابراین قبل از هر تست Auth یا PostgreSQL واقعی، فعال‌بودن پروژه باید جداگانه و با مجوز بررسی شود.

پروژه مالی دیگری که فعال است، جایگزین پروژه Production نیست.

### Production Center / BFF

آخرین commit مشاهده‌شده:

`8b9c674` — active-session verification

موجود:
- endpoint فقط‌خواندنی Production snapshot
- BFF bridge دارای authorization و capability مستقل
- Supabase JWT/claims + policy resolver + session-aware authorization
- C32 executable startup با `npm start`
- gateهای مستقل و پیش‌فرض خاموش

gateهای startup:
- `PC_BFF_RUNTIME_ENABLED`
- `PC_SUPABASE_AUTH_ENABLED`
- `PC_PRODUCTION_OPERATIONS_ENABLED`

همگی فقط با true صریح فعال می‌شوند.

### Migration سیاست هویت

موجود:

`materials/migration-candidates/019_enterprise_identity_policy.sql`

در مسیر migration اجرایی:

`materials/migrations/019_enterprise_identity_policy.sql`

وجود ندارد.

بنابراین آن را applied فرض نمی‌کنیم.

قبل از اعمال، SQL باید روی PostgreSQL ایزوله تست اجرایی شود؛ Gate فعلی C26/C34 برای SQL صرفاً static بود. دسترسی تابع `SECURITY DEFINER` به `auth.sessions` نیز باید در محیط مقصد بررسی شود.

هیچ policy row، user role یا capability واقعی در این فاز ساخته یا تأیید نشده است.

### Core

commitهای محلی:
- C37: `3f37350`
- C38: `23214f6`

موجود:
- Login Shell فارسی
- C36 Supabase browser-auth adapter قرارداد تزریقی
- C37 authenticated BFF request و خواننده مسیر ثابت Production
- C38 محافظ جداگانه مسیر مدیر در برابر Runtime آزمایشی
- Runtime Live Gate مستقل

هنوز ناموجود در bootstrap اصلی:
- Supabase browser client واقعی
- storage واقعی تزریق‌شده در مرز مجاز مرورگر
- `BffRequestExecutor` شبکه‌ای تأییدشده
- wiring کامل auth + BFF + Live environment

`main.tsx` هنوز فقط `<App />` اجرا می‌کند.

### آخرین Gateهای فنی

Core C37 و C38:
- `test:core`: PASS
- `build:core`: PASS
- Workspace Boundary: PASS
- `git diff --check`: PASS

BFF در پایان C34:
- 71/71 PASS
- candidate static gate: 6/6 PASS

این تست‌ها synthetic هستند و به‌جای Proof اتصال واقعی محسوب نمی‌شوند.

## ماتریس آمادگی

| بخش | وضعیت |
|---|---|
| مشاهده فقط‌خواندنی تولید | قرارداد آماده؛ اتصال واقعی تأیید نشده |
| BFF authorization | کد و تست synthetic آماده |
| session revocation | کد و تست synthetic آماده |
| Supabase Production | **INACTIVE** |
| Role/capability migration | **APPLY نشده** |
| Policy واقعی کاربر | **تعریف/اعمال نشده** |
| Supabase signup policy | روی پروژه واقعی تأیید نشده |
| اولین مدیر آزمایشی | ایجاد نشده |
| Core network executor | implementation واقعی ندارد |
| Core Auth bootstrap | پیش‌فرض خاموش |
| Dev Mock route | مستقل |
| Deploy و Production activation | انجام نشده |

## ترتیب ایمن قبل از Go

### A. آماده‌سازی و تأیید انسانی

1. تأیید صریح برای فعال‌کردن پروژه Supabase Production.
2. تعیین این‌که چه مدیر آزمایشی، تحت کدام سازمان، capability `command_center.production.read` را دریافت می‌کند.
3. تعیین مسیر خصوصی دسترسی BFF و امنیت اتصال Core به BFF؛ از expose کردن مستقیم Production Runtime به اینترنت اجتناب شود.
4. تأیید اینکه rollout نخست فقط READ-ONLY خواهد بود.

### B. اعتبارسنجی در محیط ایزوله

1. آزمایش اجرایی SQL migration 019 در PostgreSQL تستی سازگار با Supabase.
2. آزمایش واقعی کارکرد session_id + auth.sessions با حساب تستی غیرProduction.
3. تست revoke کاربر/capability و حذف نشست در سطح دیتابیس.
4. تست 401/403/timeout/عدم دسترسی، بدون Mock fallback.
5. تست بدون تغییر ظاهر Cockpit در دسکتاپ و موبایل.

### C. اجرای کنترل‌شده با مجوز جدا

1. روشن‌شدن Supabase Production پس از تأیید.
2. اعمال migration additive تأییدشده پس از backup و بررسی rollback.
3. بستن signup عمومی در تنظیمات واقعی.
4. ساخت **یک** کاربر مدیر کنترل‌شده، بدون گسترش دسترسی.
5. تخصیص حداقل capability لازم با policy سروری.
6. راه‌اندازی BFF با فقط پورت و دسترسی مجاز، بدون worker/write.
7. اتصال Core از طریق Executor تأییدشده و Gateهای جداگانه.
8. اجرای Smoke Test read-only، بررسی audit، خروج فوری و rollback.

## معیارهای GO

- پروژه Supabase فعال و سالم باشد.
- migration 019 اجرایی و صحت آن تأیید شده باشد.
- session revoke و capability revoke واقعاً مؤثر باشد.
- BFF principal از JWT verify + policy سروری ساخته شود.
- یک کاربر دارای مجوز روی درخواست واقعی 200 بگیرد.
- درخواست بی‌توکن 401 و کاربر بی‌مجوز 403 بگیرد.
- در خطاها توکن یا شناسه و داده خام افشا نشود.
- Runtime آزمایشی در مسیر مدیر غیرقابل نمایش باشد.
- همه سرویس‌های worker/write همچنان خاموش باشند.
- rollback و مسئول تصویب آن مشخص باشد.

## کارهای انجام‌نشده در C39

- resume پروژه Supabase
- migration apply
- ایجاد Auth user، رمز یا token
- روشن‌کردن Supabase Auth یا BFF
- دسترسی به دیتابیس Production
- ارسال درخواست واقعی به Mahak/Production
- push/merge/deploy

## مرحله بعد

**C40 — Isolated SQL / Auth Session Rehearsal Design**

پیش از فعال‌سازی، طرح تست اجرایی migration 019 و سناریوی session/revoke را برای محیط کاملاً ایزوله بنویسیم. تغییر Production همچنان نیازمند مجوز صریح است.
