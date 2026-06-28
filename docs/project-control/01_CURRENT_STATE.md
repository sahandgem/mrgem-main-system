# Current State

آخرین به‌روزرسانی: 2026-06-28

## وضعیت فعلی پروژه

پروژه فعلی یک داشبورد مدیریتی فارسی، راست‌به‌چپ و dark mode برای ماژول نیروی انسانی مستر جم است. تمرکز اجرایی فعلی روی شاخه `WF` است: «داشبورد هفتگی تحلیل‌گر مکان و زمان کارمندان».

اپ با React، TypeScript و Vite ساخته شده و فعلاً backend، Supabase، login، sync خارجی یا notification واقعی ندارد. داده‌ها local-first هستند و با serviceهای داخلی و localStorage مدیریت می‌شوند.

## آخرین P قطعی

آخرین P اجرایی و کدی verify شده: **WF-P31**

آخرین کار کنترل پروژه تکمیل‌شده: **CONTROL-P3**

## وضعیت CONTROL-P3

CONTROL-P3 انجام شد. در این فاز فقط `docs/project-control` تغییر کرد و هیچ کد اجرایی، route، UI، migration یا localStorage تغییر داده نشد.

- فایل نقشه آینده ماژول‌ها ساخته شد: `docs/project-control/10_FUTURE_MODULES_ROADMAP.md`
- آینده شاخه‌های Workforce، Finance، Product، Production، Inventory، Receipts، Mahak Integration، Mobile App، AI Analysis و Central Cockpit ثبت شد.
- تصمیم قطعی ثبت شد که قبل از کاهش بدهی معماری WF، ماژول جدید شروع نشود.
- وابستگی‌های کلیدی آینده ثبت شد: `Core Product Model`، `Core Financial Event Model`، `Core Inventory Model`، `Receipt Capture Flow` و `Mahak Integration Boundary`.
- پروژه پول و پروژه کالا همچنان Subproject می‌مانند و merge مستقیم ندارند.

## وضعیت WF-P31

WF-P31 انجام شد و verify شد. در این فاز فقط extraction معماری انجام شد و رفتار برنامه تغییر نکرد.

- `DataCenterPage` از adapter به صفحه واقعی تبدیل شد.
- فایل صفحه: `src/pages/workforce/system/DataCenterPage.tsx`
- فایل‌های تغییرکرده در WF-P31:
  - `src/WorkforcePages.tsx`
  - `src/pages/workforce/system/DataCenterPage.tsx`
  - `src/pages/workforce/workforcePageUtils.ts`
  - `tests/analysis.test.ts`
- `WorkforcePages.tsx` از `4331` خط به `4119` خط رسید.
- کاهش تقریبی: `212` خط.
- route تغییر نکرد.
- localStorage key جدید ساخته نشد.
- docs در زمان اجرای WF-P31 تغییر نکرده بود.
- `npm test` موفق بود.
- `npm run build` موفق بود.
- build warning جدی نداشت.
- commit اجرایی WF-P31: `85d0df5 refactor: extract DataCenterPage`

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

## وضعیت CONTROL-P2

CONTROL-P2 انجام شد. در این فاز فقط `docs/project-control` تغییر کرد و هیچ کد اجرایی ادغام یا تغییر داده نشد.

- فایل نقشه منابع ساخته شد: `docs/project-control/09_SOURCE_INTEGRATION_MAP.md`
- پروژه پول / `audit-app` به عنوان `FIN-AUDIT` ثبت شد و فعلاً Subproject باقی می‌ماند.
- پروژه کالا / `mahak-web-version` به عنوان `DATA-MAHAK` ثبت شد و فعلاً Subproject باقی می‌ماند.
- merge مستقیم هر دو زیرپروژه ممنوع است.
- پیشنهاد استخراج آینده فقط در سطح ایده، مدل، schema و الگو ثبت شد.

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
| WF | فعال اجرایی | ماژول نیروی انسانی تا WF-P31 تأیید و verify شده است |
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
- `MaintenancePage`، `HistoryRetentionPage`، `OperationalHistoryPage` و `DataCenterPage` از `WorkforcePages.tsx` جدا شده‌اند.
- `WorkforcePages.tsx` هنوز بزرگ است و نیازمند extraction مرحله‌ای بیشتر است.

## ریسک‌های فعلی

1. `WorkforcePages.tsx` هنوز بدهی معماری اصلی است.
2. زیرپروژه‌های `audit-app` و `mahak-web-version` نباید مستقیم merge شوند.
3. تست DOM/E2E رسمی برای routeهای مستقیم وجود ندارد.
4. پروژه هنوز local-only است؛ پاک شدن storage مرورگر باعث از دست رفتن داده محلی می‌شود.
5. backend، auth و sync هنوز طراحی/پیاده‌سازی نشده‌اند.

## P پیشنهادی بعدی

ادامه extraction کنترل‌شده adapterهای کم‌ریسک باقی‌مانده، یا شروع طراحی مستند `Core Product Model` / `Core Financial Event Model` بدون کدنویسی.
