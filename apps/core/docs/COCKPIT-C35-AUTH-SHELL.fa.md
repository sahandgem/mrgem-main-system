# C35 — پوسته احراز هویت Core

تاریخ: 2026-10-09

## هدف

آماده‌کردن تجربه ورود به Core بدون فعال‌سازی واقعی Supabase Auth و بدون باز کردن مسیر داده زنده.

C35 فقط UI، قرارداد Auth و Gate مسیر مدیر را آماده می‌کند.

## رفتار مسیرها

### مسیر مدیر

`/`

حالا به‌صورت پیش‌فرض صفحه ورود را نمایش می‌دهد.

در حالت پیش‌فرض:
- Auth provider واقعی وجود ندارد
- دکمه ورود غیرفعال است
- هیچ درخواست شبکه‌ای انجام نمی‌شود
- هیچ داده Mock به‌جای داده واقعی نمایش داده نمی‌شود
- Command Center زنده ساخته نمی‌شود

### مسیر توسعه

`/__dev/command-center`

همچنان Cockpit آزمایشی قبلی را نمایش می‌دهد.

این مسیر:
- مستقل از Login است
- Mock scenario controls را حفظ می‌کند
- برای توسعه و تست UI باقی می‌ماند

## قرارداد Auth

فایل:

`apps/core/src/integration/auth/coreAuthProvider.ts`

قرارداد:

- `getSnapshot()`
- `subscribe()`
- `signIn()`
- `signOut()`
- `getAccessToken()`

Provider پیش‌فرض:

`createClosedCoreAuthProvider()`

ویژگی‌ها:
- configured=false
- access token ندارد
- network ندارد
- fail-closed است

## Storage Policy

C33 تصمیم گرفته بود نشست مرورگر در session-scoped storage نگه‌داری شود و Remember Me نداشته باشیم.

C35 به دلیل Workspace Boundary فعلی Core، مستقیماً به browser storage دسترسی ندارد.

به‌جای آن فقط قرارداد تزریقی زیر ساخته شد:

`createSessionStorageAuthStorage(storage)`

این تصمیم دو مزیت دارد:
- Core همچنان mock-only و بدون browser business storage باقی می‌ماند
- adapter واقعی آینده می‌تواند storage مناسب را خارج از boundary فعلی تزریق کند

هیچ localStorage یا storage مرورگر به‌صورت مستقیم در Core خوانده/نوشته نمی‌شود.

## UI

کامپوننت:

`apps/core/src/components/auth/CoreAuthBoundary.tsx`

ویژگی‌ها:
- RTL و فارسی
- هماهنگ با Visual System Cockpit
- dark premium / command-center
- بدون صفحه سفید SaaS
- بدون ثبت‌نام عمومی
- بدون Reset Password در نسخه اول
- بدون Remember Me
- وضعیت Auth غیرفعال به‌صورت روشن نمایش داده می‌شود
- اصطلاحات فنی انگلیسی از UI حذف شده‌اند
- فقط نام برند MASTER GEM باقی مانده است

## Gate داده بعد از Auth

حتی اگر یک Auth provider تزریقی کاربر را authenticated کند:

اگر `runtimeEnvironmentFactory` صریح تزریق نشده باشد:
- داشبورد باز نمی‌شود
- Mock fallback انجام نمی‌شود
- پیام «مسیر داده مدیریتی هنوز بسته است» نمایش داده می‌شود

فقط Auth معتبر + Runtime injection صریح می‌تواند Command Center را باز کند.

## Hardening فرم

فرم:
- ایمیل را محلی validate می‌کند
- رمز حداقل ۸ نویسه می‌خواهد
- هنگام submit دوباره‌کاری را می‌بندد
- خطای provider را به پیام امن تبدیل می‌کند
- رمز را در finally از state پاک می‌کند
- خطای خام provider را نمایش نمی‌دهد

## تست‌های C35

تست جدید:

`apps/core/tests/coreAuthProvider.test.ts`

پوشش:
- closed provider پیش‌فرض
- access token=null
- sign-in پیش‌فرض unavailable
- storage wrapper تزریقی
- email/password validation

Test runner Core نیز این suite را اجرا می‌کند.

## Visual Validation

### Desktop

1365×768:
- بدون page scroll
- frame کامل داخل viewport
- فرم و intelligence panel خوانا
- هماهنگ با Cockpit

### Mobile

420×800:
- scrollWidth = 420
- بدون horizontal scroll
- scrollHeight = 870
- صفحه به‌صورت طبیعی عمودی scroll می‌شود
- فرم در یک ستون و خوانا باقی می‌ماند

### Dev Cockpit regression

1365×768 روی:

`/__dev/command-center`

نتیجه:
- document = 1365×768
- بدون page scroll
- Vital Strip کامل
- Attention rows حفظ شده‌اند
- Dev scenario path سالم است

## Production / Real Auth state

Supabase واقعی:
NOT CALLED

Auth user:
NOT CREATED

Login واقعی:
NOT PERFORMED

Live Runtime:
NOT ACTIVATED

Production data:
NOT READ

Push / Merge / Deploy:
NOT PERFORMED

## مرحله بعد

C36 — Supabase Browser Auth Adapter Contract

C36 می‌تواند adapter واقعی Supabase را آماده کند اما همچنان با gate بسته و بدون فعال‌سازی Production.

تمرکز:
- signInWithPassword
- session-scoped storage injection
- auto refresh
- local signOut
- access-token handoff فقط به BFF transport
- بدون service/secret key
- بدون public signup
- بدون Live activation
