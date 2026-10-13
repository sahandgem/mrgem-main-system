# C20 — Activation Readiness Audit

تاریخ: 2026-10-04

## تصمیم نهایی

Activation واقعی Command Center Production:

NO-GO

زنجیره فنی تا قبل از activation آماده شده، اما سه blocker عملیاتی/معماری هنوز باقی است.

## وضعیت Producer — C16

وضعیت:
READY FOR CONTROLLED ACTIVATION TEST

شواهد:
- endpoint واقعی فقط‌خواندنی وجود دارد:
  GET /api/raw-materials/production-operations-snapshot
- aggregate فقط از production_orders ساخته می‌شود.
- هیچ ID یا raw order row از مرز خارج نمی‌شود.
- کل Materials test suite:
  89 PASS / 0 FAIL / 12 pre-existing SKIP
- node syntax check برای Production Runtime و Producer PASS
- فایل production backend DB secret موجود است.
- پورت پیش‌فرض 55439 در زمان audit آزاد بود.
- PC_MAHAK_WRITE_ENABLED تنظیم نشده است.
- PC_PRODUCTION_WORKER_ENABLED تنظیم نشده است.
- PC_MAHAK_PRODUCTION_SEND_ENABLED تنظیم نشده است.

طبق کد فعلی، نبود این flagها یعنی write/worker/send پیش‌فرض خاموش می‌مانند.

محدودیت audit:
Production Runtime در C20 اجرا نشد و اتصال واقعی PostgreSQL بررسی نشد، چون این کار وارد read عملیاتی Production می‌شود و activation جدا می‌خواهد.

نتیجه:
کد Producer آماده است؛ runtime connectivity واقعی هنوز UNVERIFIED است.

## وضعیت BFF Bridge — C18/C19

وضعیت:
READY BUT DISABLED

شواهد:
- route:
  GET /api/command-center/production-operations
- source فقط loopback HTTP را قبول می‌کند.
- capability مستقل:
  command_center.production.read
- product_identity.read به‌تنهایی کافی نیست.
- browser role/org/capability headers معتبر تلقی نمی‌شوند.
- upstream errors sanitize می‌شوند.
- Runtime gate:
  productionOperationsEnabled === true
- default:
  disabled
- BFF test suite:
  20 / 20 PASS

## Blocker 1 — Trusted authenticateRequest

وضعیت:
BLOCKED

در repoهای بررسی‌شده implementation عملیاتی برای authenticateRequest پیدا نشد.

موجود:
- interface/injection point
- authorization rules
- test fixture authenticateRequest

ناموجود:
- trusted session/auth adapter واقعی که request را به principal معتبر تبدیل کند.

بدون این بخش BFF عمداً fail-closed است.

## Blocker 2 — Capability Issuance

وضعیت:
BLOCKED

قانون capability تعریف شده:

command_center.production.read

اما سازوکار عملیاتی برای اینکه چه کاربری و تحت چه policy این capability را دریافت می‌کند هنوز تعریف/پیاده نشده است.

این capability نباید از browser header یا role ادعایی ساخته شود.

## Blocker 3 — Core Server-Side Reader

وضعیت:
BLOCKED

Core فعلی:
- Vite SPA است.
- هیچ server-side API/runtime ندارد.
- هیچ fetch/XMLHttpRequest/WebSocket برای داده کسب‌وکار ندارد.
- C13/C17 transport در حالت fixture/test است.

بنابراین هنوز مسیر امن زیر وجود ندارد:

Trusted Core Runtime
→ authenticated BFF
→ Production snapshot

اضافه‌کردن fetch مستقیم browser در C20 تأیید نشد.

## Blocker 4 — UI Module Identity Hard-code

وضعیت:
BLOCKED BUT SAFE TO FIX BEFORE ACTIVATION

Cockpit فعلی در چند نقطه moduleIdهای زیر را hard-code کرده است:

- workforce.demo
- production.demo

در نتیجه production.operations می‌تواند وارد ViewModel شود ولی UI هنوز آن را به‌عنوان Production primary module انتخاب نمی‌کند.

فایل‌های اصلی:
- CommandCenterModuleOverview.tsx
- CockpitSignals.tsx

این blocker باید قبل از activation حذف شود.

## Data Label

وضعیت:
READY

ViewModel اکنون دو label دارد:
- DEMO/MOCK
- LIVE/READ-ONLY

Live source در C17 به‌درستی LIVE/READ-ONLY تولید می‌کند.

## Gate Independence

وضعیت:
READY

سه gate مستقل باقی مانده‌اند:

1. Production Runtime service
   - باید جداگانه start شود.

2. BFF Production bridge
   - productionOperationsEnabled
   - default=false

3. Core LiveDataSource
   - enabled
   - default runtime environment=mock

بازشدن یک gate به‌تنهایی دو gate دیگر را باز نمی‌کند.

## Process State در زمان Audit

فعال نبود:
- C16 Production Runtime
- Product Monitoring / Command Center BFF
- Production Operations bridge

بنابراین C20 هیچ active Production traffic ایجاد نکرد.

## Activation Matrix

Producer contract/code:
GO

Producer real DB connectivity:
UNVERIFIED

BFF source adapter:
GO

BFF authorization rules:
GO

BFF runtime gate:
GO

Trusted authenticateRequest implementation:
NO-GO

Capability issuance policy:
NO-GO

Core transport contract:
GO

Core end-to-end fixture:
GO

Core server-side/live reader:
NO-GO

Core UI live module selection:
NO-GO

Production deploy/start:
NOT ATTEMPTED

## نتیجه

Production activation در C20 انجام نمی‌شود.

مرحله بعدی امن:

C21 — Live Module Selection / حذف وابستگی UI به demo module IDs

بعد از آن:
C22 — Trusted Auth Boundary Design

و فقط بعد از مشخص‌شدن auth واقعی:
C23 — Server-Side Core Reader / activation rehearsal

هیچ Production activation، DB read واقعی، deploy، push یا merge در C20 انجام نشد.
