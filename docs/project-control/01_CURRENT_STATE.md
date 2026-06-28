# Current State

آخرین به‌روزرسانی: 2026-06-28

## وضعیت فعلی پروژه

پروژه فعلی یک داشبورد مدیریتی فارسی، راست‌به‌چپ و dark mode برای ماژول نیروی انسانی مستر جم است. تمرکز اجرایی فعلی روی شاخه `WF` است: «داشبورد هفتگی تحلیل‌گر مکان و زمان کارمندان».

اپ با React، TypeScript و Vite ساخته شده و فعلاً backend، Supabase، login، sync خارجی یا notification واقعی ندارد. داده‌ها local-first هستند و با serviceهای داخلی و localStorage مدیریت می‌شوند.

## آخرین P قطعی

آخرین P اجرایی و کدی verify شده: **WF-P30**

کار کنترل پروژه تکمیل‌شده: **CONTROL-P1**

## وضعیت WF-P30

WF-P30 انجام شد و verify شد. در این فاز فقط extraction معماری انجام شد و رفتار برنامه تغییر نکرد.

- `OperationalHistoryPage` واقعاً از `src/WorkforcePages.tsx` خارج شد.
- فایل صفحه: `src/pages/workforce/system/OperationalHistoryPage.tsx`
- فایل‌های تغییرکرده در WF-P30:
  - `src/WorkforcePages.tsx`
  - `src/pages/workforce/system/OperationalHistoryPage.tsx`
  - `tests/analysis.test.ts`
- `WorkforcePages.tsx` از `4733` خط به `4614` خط رسید.
- route تغییر نکرد.
- localStorage key جدید ساخته نشد.
- `npm test` موفق بود.
- `npm run build` موفق بود.
- build warning نداشت.
- رفتار UI تغییر نکرد.

## وضعیت WF-P29

WF-P29 انجام و verify شد. دو صفحه زیر قبلاً از `src/WorkforcePages.tsx` جدا شده بودند و ثبت نهایی شدند:

- `MaintenancePage`
- `HistoryRetentionPage`

فایل‌های موجود:

- `src/pages/workforce/system/MaintenancePage.tsx`
- `src/pages/workforce/operations/HistoryRetentionPage.tsx`
- `src/pages/workforce/workforcePageUtils.ts`

نتیجه ثبت‌شده:

- `WorkforcePages.tsx` از حدود `5028` خط به `4733` خط رسیده است.
- `npm test` موفق است.
- `npm run build` موفق است.
- route جدید ساخته نشده است.
- localStorage key جدید ساخته نشده است.
- رفتار UI تغییر نکرده است.

## شاخه‌های فعال

| شاخه | وضعیت | توضیح |
|---|---|---|
| CORE | فعال کنترلی | route registry، shell، قوانین معماری و اتصال آینده به کابین مرکزی |
| WF | فعال اجرایی | ماژول نیروی انسانی تا WF-P30 تأیید و verify شده است |
| UI | فعال پشتیبان | RTL، dark mode و cockpit مدیریتی در UI فعلی حفظ شده است |
| DATA | نیمه‌فعال | localStorage registry، backup، import/restore و baseline compatibility وجود دارد |
| CONTROL | فعال | docs/project-control منبع حقیقت کنترل پروژه است |
| FIN | برنامه‌ریزی نشده | هنوز در محصول اصلی شروع نشده است |
| PROD | برنامه‌ریزی نشده | هنوز در محصول اصلی شروع نشده است |
| INV | برنامه‌ریزی نشده | هنوز در محصول اصلی شروع نشده است |
| MOBILE | برنامه‌ریزی نشده | هنوز در محصول اصلی شروع نشده است |

## زیرپروژه‌های ثبت‌شده

| کد | نام repo/پروژه | وضعیت | قاعده |
|---|---|---|---|
| FIN-AUDIT | `audit-app` / داشبورد بحران نقدینگی | Subproject | فعلاً merge نشود |
| DATA-MAHAK | `mahak-web-version` / ثبت کالا و خروجی محک | Subproject | فعلاً merge نشود |

## وضعیت معماری WF

- route manifest مرکزی وجود دارد.
- routeها lazy load می‌شوند.
- داده‌ها در localStorage و serviceهای داخلی هستند.
- analyzerها، recommendation، simulator، decision queue، report، backup، readiness، launch، drift، history، retention، operations calendar و maintenance وجود دارند.
- `MaintenancePage`، `HistoryRetentionPage` و `OperationalHistoryPage` از `WorkforcePages.tsx` جدا شده‌اند.
- `WorkforcePages.tsx` هنوز بزرگ است و نیازمند extraction مرحله‌ای بیشتر است.
- `DataCenterPage` هنوز adapter/compat دارد.

## ریسک‌های فعلی

1. `WorkforcePages.tsx` هنوز بدهی معماری اصلی است.
2. `DataCenterPage` هنوز adapter/compat دارد.
3. زیرپروژه‌های `audit-app` و `mahak-web-version` نباید مستقیم merge شوند.
4. تست DOM/E2E رسمی برای routeهای مستقیم وجود ندارد.
5. پروژه هنوز local-only است؛ پاک شدن storage مرورگر باعث از دست رفتن داده محلی می‌شود.
6. backend، auth و sync هنوز طراحی/پیاده‌سازی نشده‌اند.

## P پیشنهادی بعدی

**Source Integration Map**، بدون ادغام کد.
