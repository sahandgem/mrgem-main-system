# C23 — Trusted Runtime Injection Seam

تاریخ: 2026-10-04

## هدف

ایجاد seam صریح برای تزریق Runtime واقعی Command Center در آینده، بدون اضافه‌کردن network reader یا فعال‌کردن Live.

## تصمیم معماری

اسناد قبلی Production Center تصمیم گرفته‌اند:

- Production Center-owned BFF مرز ترجیحی است.
- Core-owned integration/read gateway فعلاً رد شده است.
- Mahak نباید مستقیم از browser خوانده شود.

بنابراین C23 یک server جدید داخل Core ایجاد نمی‌کند.

## تغییر

CommandCenterModuleOverview اکنون یک prop اختیاری دارد:

runtimeEnvironmentFactory

نوع:

() => CommandCenterRuntimeEnvironment

اگر داده نشود:

createCommandCenterRuntimeEnvironment

استفاده می‌شود.

این factory پیش‌فرض همچنان mode=mock می‌سازد.

## App seam

App نیز runtimeEnvironmentFactory اختیاری را دریافت می‌کند و فقط آن را به CommandCenterModuleOverview عبور می‌دهد.

main.tsx همچنان:

<App />

را بدون factory اجرا می‌کند.

پس رفتار اجرایی فعلی تغییر نمی‌کند.

## چرا این seam لازم بود

قبل از C23 حتی اگر LiveDataSource و Production transport آماده بودند، UI همیشه Runtime داخلی پیش‌فرض خودش را می‌ساخت.

بعد از C23 یک bootstrap قابل‌اعتماد در آینده می‌تواند Runtime مورد تأیید را تزریق کند بدون بازنویسی Cockpit.

## چیزهایی که C23 عمداً انجام نمی‌دهد

- fetch اضافه نمی‌کند.
- XMLHttpRequest اضافه نمی‌کند.
- WebSocket اضافه نمی‌کند.
- BFF client واقعی نمی‌سازد.
- auth provider انتخاب نمی‌کند.
- cookie/session/JWT طراحی نمی‌کند.
- productionOperationsEnabled را روشن نمی‌کند.
- C12 Live Gate را روشن نمی‌کند.
- Registry global را تغییر نمی‌دهد.
- main.tsx را Live نمی‌کند.
- deploy انجام نمی‌دهد.

## Default path

Current:

main.tsx
→ App()
→ CommandCenterModuleOverview()
→ createCommandCenterRuntimeEnvironment()
→ Mock

Future approved path:

trusted bootstrap
→ App(runtimeEnvironmentFactory)
→ CommandCenterModuleOverview
→ approved Live Runtime
→ Command Center

## ارتباط با BFF

طبق P05D، مرز read واقعی باید Production Center BFF باقی بماند.

Core نباید:
- مستقیم Production Runtime 55439 را بخواند.
- مستقیم Mahak را بخواند.
- credential upstream نگه دارد.

Reader نهایی فقط بعد از مشخص‌شدن enterprise auth می‌تواند BFF sanitized route را مصرف کند.

## Gate

C23 کامل است اگر:

1. App بتواند Runtime factory دریافت کند.
2. CommandCenterModuleOverview همان factory را فقط یک‌بار برای ساخت environment استفاده کند.
3. main.tsx هیچ factory پاس ندهد.
4. default runtime همچنان Mock باشد.
5. workspace boundary هنوز browser business network را ممنوع کند.
6. test:core PASS
7. build:core PASS
8. git diff --check PASS

## وضعیت Activation بعد از C23

UI module selection:
READY

Runtime injection seam:
READY

Live ViewModel path:
READY

Production sanitized producer:
READY

BFF bridge:
READY BUT DISABLED

Trusted enterprise authenticateRequest:
BLOCKED

Capability issuance:
BLOCKED

Final BFF client/session topology:
BLOCKED BY IDENTITY CHOICE

Production activation:
NO-GO
