# C21 — Live Module Selection / حذف وابستگی UI به Demo IDs

تاریخ: 2026-10-04

## هدف

آماده‌کردن UI Cockpit برای نمایش ماژول واقعی Production بدون تغییر حالت پیش‌فرض Mock.

## مشکل

قبل از C21 چند بخش UI مستقیماً این شناسه‌ها را جست‌وجو می‌کردند:

- workforce.demo
- production.demo

در نتیجه حتی اگر ViewModel دارای:

production.operations

بود، Rail و Vital Strip همچنان فقط production.demo را می‌دیدند.

## تصمیم

UI نباید به implementation-specific demo ID وابسته باشد.

یک selector مرکزی اضافه شد:

findPrimaryCommandCenterModule(modules, family)

familyهای فعلی:
- workforce
- production

قاعده انتخاب:
1. moduleId باید در namespace همان family باشد.
2. اگر candidate غیرآزمایشی وجود داشته باشد، همان انتخاب می‌شود.
3. اگر فقط demo/experimental وجود داشته باشد، همان fallback انتخاب می‌شود.

## نتیجه برای Mock فعلی

Registry فعلی:
- workforce.demo
- production.demo

بنابراین خروجی فعلی هیچ تغییری نمی‌کند.

## نتیجه برای Live آینده

Registry تست C17:
- workforce.demo
- production.operations

UI اکنون:
- workforce.demo را برای Workforce انتخاب می‌کند.
- production.operations را برای Production انتخاب می‌کند.

production.operations بر production.demo اولویت دارد چون غیرآزمایشی است.

## Vital Strip

Vital Strip اکنون:
- Production module را با selector خانواده پیدا می‌کند.
- production_in_progress_orders را برای Live Production می‌فهمد.
- production_open_orders را برای سیگنال سفارش‌ها می‌فهمد.
- mock work-order semantics قبلی را برای demo حفظ می‌کند.
- برچسب آزمایشی را از خود module می‌گیرد، نه به‌صورت hard-code.

## Loading State

متن loading اکنون با source mode هماهنگ است:

Mock:
در حال ساخت نمای مدیریتی از داده آزمایشی...

Live:
در حال ساخت نمای مدیریتی از داده فقط‌خواندنی...

## مواردی که عمداً تغییر نکردند

- default runtime = mock
- C12 Live Gate = بسته
- network reader وجود ندارد
- Production bridge فعال نشده
- Registry global تغییر نکرده
- C10 layout تغییر نکرده
- Workforce هنوز demo است

## Gate

C21 کامل است اگر:

1. production.operations در selector بر production.demo اولویت داشته باشد.
2. mock-only همچنان production.demo را انتخاب کند.
3. UI components دیگر production.demo/workforce.demo را مستقیم جست‌وجو نکنند.
4. test:core PASS
5. build:core PASS
6. git diff --check PASS
7. Mock visual baseline بدون drift معنادار باقی بماند.

## مرحله بعد

بعد از C21 blocker UI در C20 رفع می‌شود.

Blockerهای باقی‌مانده:
- trusted authenticateRequest implementation
- capability issuance policy
- trusted Core/server reader

این موارد در C22 به‌صورت Auth Boundary Design بررسی می‌شوند.
