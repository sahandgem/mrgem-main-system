# C11 — Runtime Data Boundary / آمادگی Core برای داده واقعی

تاریخ: 2026-10-04

## هدف

آماده‌کردن Core Command Center برای اتصال آینده به داده واقعی، بدون فعال‌کردن هیچ اتصال واقعی در این فاز.

C11 نباید:
- Mahak واقعی را بخواند.
- Production API را صدا بزند.
- Database واقعی را لمس کند.
- localStorage واقعی اضافه کند.
- packages/module-contracts را تغییر دهد.
- UI تأییدشده C10 را بازطراحی کند.

## وضعیت معماری موجود

مسیر فعلی داده از قبل صحیح است:

Module Adapter
→ Validation
→ Aggregation
→ Command Center ViewModel
→ Cockpit UI

این مسیر حفظ می‌شود.

مسئله فعلی این است که CommandCenterModuleOverview خودش مسئول lifecycle دریافت داده است:
- شروع دریافت
- وضعیت refreshing
- نگه‌داری آخرین snapshot
- مدیریت خطا
- زمان آخرین دریافت موفق
- جلوگیری از چند refresh هم‌زمان

این مسئولیت باید از UI جدا شود.

## تصمیم C11

یک لایه جدید به نام Command Center Runtime اضافه می‌شود:

DataSource
→ Runtime Controller
→ React UI

Runtime Controller فقط orchestration انجام می‌دهد و هیچ منطق کسب‌وکاری تولید نمی‌کند.

## قرارداد DataSource

DataSource باید فقط snapshot مدیریتی برگرداند.

ویژگی‌ها:
- read-only
- بدون write
- بدون mutation
- قابل جایگزینی
- مستقل از React

در C11 تنها implementation فعال:
- CommandCenterMockDataSource

هیچ LiveDataSource در C11 ساخته یا فعال نمی‌شود.

## Runtime State

حالت‌های runtime:

- idle
- loading
- ready
- refreshing
- error

قاعده مهم:

اگر refresh جدید شکست خورد ولی snapshot قبلی سالم وجود دارد:
- snapshot قبلی حفظ می‌شود.
- UI خالی نمی‌شود.
- runtime وارد error-with-snapshot می‌شود.
- پیام خطا نمایش داده می‌شود.
- lastSuccessfulAt تغییر نمی‌کند.

اگر اولین load شکست بخورد و snapshot قبلی وجود نداشته باشد:
- state = error
- UI باید خطای قابل فهم نشان دهد.

## Timestampها

Runtime سه زمان را از هم جدا نگه می‌دارد:

- lastAttemptAt
- lastSuccessfulAt
- generatedAt داخل ViewModel

این سه مفهوم نباید یکی فرض شوند.

## Concurrency

هر read یک request sequence دارد.

قاعده:
- نتیجه request قدیمی نباید نتیجه request جدیدتر را overwrite کند.
- UI نباید به‌خاطر پاسخ دیررس به snapshot قدیمی برگردد.

در C11 شبکه واقعی نداریم، ولی این قاعده قبل از اتصال واقعی پیاده می‌شود.

## Refresh Semantics

Initial:
idle → loading → ready

Manual refresh:
ready → refreshing → ready

Failed refresh with existing snapshot:
ready → refreshing → error
snapshot قبلی حفظ می‌شود

Retry:
error → refreshing → ready

## Dev Scenario

Scenario controls فقط در route توسعه باقی می‌مانند.

تغییر scenario:
- MockDataSource را تنظیم می‌کند.
- Runtime refresh اجرا می‌شود.
- Drawer و mobile expansion مانند قبل reset می‌شوند.

Manager route نباید کنترل Mock نشان دهد.

## UI Contract

C11 نباید Visual Drift ایجاد کند.

CockpitSystemBar همچنان فقط نیاز دارد:
- isRefreshing
- lastSuccessfulAt
- onRefresh
- viewModel

UI نباید بداند داده از Mock آمده یا در آینده از Live.

## Future Live Boundary

در فاز آینده یک DataSource جدید می‌تواند به Runtime داده شود:

CommandCenterLiveDataSource

اما این implementation در C11 وجود ندارد.

منبع واقعی در آینده باید پشت ModuleReadAdapterها قرار بگیرد، نه داخل Component.

## Test Gate

C11 زمانی کامل است که:

1. Initial load موفق باشد.
2. Manual refresh موفق باشد.
3. Failed refresh snapshot قبلی را پاک نکند.
4. Retry بعد از error بتواند recover کند.
5. lastSuccessfulAt فقط بعد از success تغییر کند.
6. stale request نتواند newer result را overwrite کند.
7. Manager UI به MockDataSource وابستگی lifecycle مستقیم نداشته باشد.
8. Dev scenario همچنان کار کند.
9. هیچ fetch / network / localStorage / database جدیدی اضافه نشود.
10. test:core PASS
11. build:core PASS
12. git diff --check PASS

## خارج از Scope

- احراز هویت
- API واقعی
- Supabase
- Mahak transport
- Production transport
- WebSocket / realtime
- retry policy شبکه
- caching پایدار
- persistence
- background polling

این موارد فقط بعد از بسته‌شدن C11 بررسی می‌شوند.


---

## Implementation انجام‌شده

فایل‌های جدید:
- commandCenterDataSource.ts
- commandCenterRuntime.ts
- commandCenterRuntimeEnvironment.ts

تغییرات:
- lifecycle دریافت داده از CommandCenterModuleOverview خارج شد.
- Component دیگر CommandCenterMockDataSource را مستقیم import نمی‌کند.
- Runtime Environment نقطه Wiring منبع داده شد.
- MockDataSource قرارداد عمومی CommandCenterDataSource را پیاده می‌کند.
- Runtime آخرین snapshot موفق را در خطای refresh حفظ می‌کند.
- Runtime زمان آخرین attempt و success را جدا نگه می‌دارد.
- نتیجه request قدیمی نمی‌تواند request جدیدتر را overwrite کند.
- Dev Scenario از طریق Runtime Environment کنترل می‌شود.

## Validation نهایی C11

Automated:
- Core boundary / mock-only — PASS
- Integration Backbone — PASS
- C11 runtime initial lifecycle — PASS
- failed refresh keeps last successful snapshot — PASS
- retry recovery — PASS
- stale concurrent request protection — PASS
- Command Center view-model — PASS
- C4 interaction model — PASS
- npm run test:core — PASS
- npm run build:core — PASS
- git diff --check — PASS

Visual smoke:
- Desktop 1365×768 — بدون drift از C10
- Mobile 420×800 — document height = 1684 و Bottom Nav = y 738
- Dev Critical State — سناریوی خطای داده همچنان صحیح
- Desktop page scroll = صفر
- Mobile horizontal overflow = صفر

Boundary:
- هیچ fetch جدیدی اضافه نشد.
- هیچ network call جدیدی اضافه نشد.
- هیچ localStorage جدیدی اضافه نشد.
- هیچ Database / Supabase / Mahak connection اضافه نشد.
- packages/module-contracts تغییر نکرد.
- apps/workforce تغییر نکرد.

## نتیجه C11

Runtime Boundary آماده است و UI دیگر lifecycle منبع Mock را مدیریت نمی‌کند.

C11 آماده بسته‌شدن است.

مرحله بعدی باید قبل از اتصال واقعی، قرارداد Wiring منبع واقعی و سیاست activation/gating آن را تعریف کند؛ اتصال Production واقعی همچنان خارج از C11 است.
